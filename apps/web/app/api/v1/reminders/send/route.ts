import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, AiosMessageService } from '@aesthetic-track/infrastructure';

const PROCEDURE_LABELS: Record<string, string> = {
  facial_botox: 'Botox',
  facial_filler: 'Preenchimento',
  facial_stimulator: 'Bioestimulador',
  facial_skinbooster: 'Skinbooster',
  facial_ultraformer: 'Ultraformer',
  facial_laser: 'Laser',
  facial_peel: 'Peeling',
  facial_led: 'LED',
  facial_microneedling: 'Microagulhamento',
  body_lipolysis: 'Lipolise',
  body_ultraformer: 'Ultraformer Corporal',
  body_radiofrequency: 'Radiofrequencia',
  body_cavitation: 'Cavitacao',
  body_lymphatic_drainage: 'Drenagem Linfatica',
  body_cryolipolysis: 'Criolipolise',
  other: 'Outro',
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const body = await request.json();
  const { reminderIds, type: batchType } = body as {
    reminderIds?: string[];
    type?: 'all_today' | 'all_overdue';
  };

  const admin = getSupabaseAdminClient();

  // Get clinic settings & name
  const { data: clinic } = await admin
    .from('clinics')
    .select('name, settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, unknown>;
  const clinicName = clinic?.name ?? 'a clinica';
  const aiosToken = settings.aiosApiKey as string;

  if (!aiosToken) {
    return errorResponse('Aios API not configured', 400);
  }

  const aios = new AiosMessageService(aiosToken);
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  // Get all reminders first via internal fetch to reuse logic
  const remindersRes = await fetch(new URL('/api/v1/reminders', request.url).toString(), {
    headers: request.headers,
  });
  const remindersData = await remindersRes.json();
  let reminders = remindersData.reminders as Array<{
    id: string;
    type: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    sessionId: string;
    sessionDate: string;
    followUpDate?: string;
    status: string;
    dueAt: string;
  }>;

  // Filter based on request
  if (reminderIds?.length) {
    reminders = reminders.filter((r) => reminderIds.includes(r.id));
  } else if (batchType === 'all_today') {
    const todayStr = new Date().toISOString().split('T')[0];
    reminders = reminders.filter(
      (r) => r.status !== 'sent' && r.dueAt.startsWith(todayStr),
    );
  } else if (batchType === 'all_overdue') {
    reminders = reminders.filter((r) => r.status === 'overdue');
  } else {
    return errorResponse('reminderIds or type (all_today/all_overdue) required', 400);
  }

  // Skip already sent
  reminders = reminders.filter((r) => r.status !== 'sent');

  for (const reminder of reminders) {
    try {
      // Get procedures for this session
      const { data: procs } = await admin
        .from('session_procedures')
        .select('category, procedure_name')
        .eq('session_id', reminder.sessionId);

      const procList = (procs ?? [])
        .map((p: { category: string; procedure_name: string }) => p.procedure_name || PROCEDURE_LABELS[p.category] || p.category)
        .join(', ');

      const message = buildMessage(reminder.type, {
        clientName: reminder.clientName,
        clinicName,
        sessionDate: reminder.sessionDate,
        followUpDate: reminder.followUpDate,
        procedures: procList,
      });

      const result = await aios.sendWhatsApp({
        to: reminder.clientPhone,
        text: message,
        hiddenSession: true,
      });

      // Save to client_messages
      const idempotencyPrefix =
        reminder.type === 'appointment'
          ? 'reminder_appointment_'
          : reminder.type === 'follow_up'
            ? 'reminder_followup_'
            : 'postsession_';

      await admin.from('client_messages').insert({
        clinic_id: clinicId,
        client_id: reminder.clientId,
        session_id: reminder.sessionId,
        channel: 'whatsapp',
        status: result.status === 'FAILED' ? 'failed' : 'sent',
        body: message,
        is_ai_generated: false,
        external_message_id: result.id,
        sent_at: new Date().toISOString(),
        idempotency_key: `${idempotencyPrefix}${reminder.sessionId}`,
      });

      results.push({ id: reminder.id, success: true });
    } catch (error) {
      results.push({
        id: reminder.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return successResponse({
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
}

function buildMessage(
  type: string,
  data: {
    clientName: string;
    clinicName: string;
    sessionDate: string;
    followUpDate?: string;
    procedures: string;
  },
): string {
  const firstName = data.clientName.split(' ')[0];
  const sessionDateFmt = new Date(data.sessionDate).toLocaleDateString('pt-BR');
  const sessionTimeFmt = new Date(data.sessionDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  switch (type) {
    case 'appointment':
      return (
        `Ola ${firstName}! Passando para lembrar do seu agendamento.\n\n` +
        `Data: ${sessionDateFmt} as ${sessionTimeFmt}\n` +
        (data.procedures ? `Procedimento(s): ${data.procedures}\n` : '') +
        `\nTe esperamos na ${data.clinicName}! Qualquer duvida, estamos a disposicao.`
      );

    case 'follow_up': {
      const followUpFmt = data.followUpDate
        ? new Date(data.followUpDate + 'T00:00:00').toLocaleDateString('pt-BR')
        : 'em breve';
      return (
        `Ola ${firstName}! Tudo bem?\n\n` +
        `Conforme combinamos na sua ultima sessao (${sessionDateFmt}), ` +
        `sua data de retorno esta se aproximando: ${followUpFmt}.\n\n` +
        (data.procedures ? `Procedimento(s) anteriores: ${data.procedures}\n\n` : '') +
        `Gostaria de agendar seu proximo atendimento? Entre em contato com a ${data.clinicName}.`
      );
    }

    case 'post_session':
      return (
        `Ola ${firstName}!\n\n` +
        `Muito obrigada pela sua visita hoje na ${data.clinicName}!\n\n` +
        (data.procedures ? `Realizamos: ${data.procedures}\n\n` : '') +
        `Lembre-se de seguir os cuidados pos-procedimento que orientamos. ` +
        `Qualquer duvida, estamos a disposicao!\n\n` +
        `Ate a proxima!`
      );

    default:
      return `Ola ${firstName}! Mensagem da ${data.clinicName}.`;
  }
}
