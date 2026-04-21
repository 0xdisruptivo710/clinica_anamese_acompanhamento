import { errorResponse, successResponse } from '@/lib/api-helpers';
import { requireRole } from '@/lib/auth/require-role';
import { getSupabaseAdminClient, FlwChatService } from '@aesthetic-track/infrastructure';

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

interface ReminderTarget {
  id: string;
  type: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  sessionId: string;
  sessionDate: string;
  followUpDate?: string;
}

export async function POST(request: Request) {
  const ctx = await requireRole(['owner', 'admin']);
  if (!ctx) return errorResponse('Apenas admin ou dono pode disparar lembretes', 403);

  const clinicId = ctx.professional.clinicId;

  const body = await request.json();
  const { reminderIds, type: batchType } = body as {
    reminderIds?: string[];
    type?: 'all_today' | 'all_overdue';
  };

  if (!reminderIds?.length && !batchType) {
    return errorResponse('reminderIds or type (all_today/all_overdue) required', 400);
  }

  const admin = getSupabaseAdminClient();

  const { data: clinic } = await admin
    .from('clinics')
    .select('name, settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, unknown>;
  const clinicName = clinic?.name ?? 'a clinica';
  const token = (settings.flwApiToken || settings.aiosApiKey) as string;

  if (!token) {
    return errorResponse('FLW Chat API not configured', 400);
  }

  const flw = new FlwChatService(token);
  const fromPhone = (settings.flwFromPhone || settings.aiosFromPhone) as string | undefined;
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  // Build reminder targets directly from DB
  const targets: ReminderTarget[] = [];
  const now = new Date();

  if (reminderIds?.length) {
    // Parse reminder IDs to get session IDs and types
    for (const rid of reminderIds) {
      const [type, sessionId] = rid.includes('_')
        ? [rid.substring(0, rid.lastIndexOf('_')), rid.substring(rid.lastIndexOf('_') + 1)]
        : ['unknown', rid];

      const reminderType = type.replace('appt', 'appointment').replace('followup', 'follow_up').replace('postsession', 'post_session');

      const { data: session } = await admin
        .from('sessions')
        .select('id, session_date, follow_up_date, client_id, clients!inner(full_name, phone, whatsapp)')
        .eq('id', sessionId)
        .single();

      if (session) {
        const client = session.clients as unknown as { full_name: string; phone: string; whatsapp: string };
        targets.push({
          id: rid,
          type: reminderType,
          clientId: session.client_id,
          clientName: client.full_name,
          clientPhone: client.whatsapp || client.phone,
          sessionId: session.id,
          sessionDate: session.session_date,
          followUpDate: session.follow_up_date ?? undefined,
        });
      }
    }
  } else {
    // Batch: get sessions based on type
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Scheduled sessions (appointment reminders)
    const { data: scheduled } = await admin
      .from('sessions')
      .select('id, session_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'scheduled')
      .gte('session_date', todayStart)
      .order('session_date', { ascending: true })
      .limit(50);

    for (const s of scheduled ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      const sessionDate = new Date(s.session_date);
      const reminderHours = (settings.appointmentReminderHours as number) ?? 24;
      const dueAt = new Date(sessionDate.getTime() - reminderHours * 60 * 60 * 1000);
      const isOverdue = dueAt < now && sessionDate > now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (batchType === 'all_overdue' && !isOverdue) continue;
      if (batchType === 'all_today' && !isToday && !isOverdue) continue;

      // Check not already sent
      const { data: existing } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'reminder_appointment_%')
        .limit(1);
      if (existing && existing.length > 0) continue;

      targets.push({
        id: `appt_${s.id}`,
        type: 'appointment',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionDate: s.session_date,
      });
    }

    // Follow-up reminders
    const { data: followUps } = await admin
      .from('sessions')
      .select('id, session_date, follow_up_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .not('follow_up_date', 'is', null)
      .gte('follow_up_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('follow_up_date', { ascending: true })
      .limit(50);

    for (const s of followUps ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      const followUpDate = new Date(s.follow_up_date + 'T09:00:00');
      const daysBefore = (settings.followUpReminderDaysBefore as number) ?? 1;
      const dueAt = new Date(followUpDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
      const isOverdue = dueAt < now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (batchType === 'all_overdue' && !isOverdue) continue;
      if (batchType === 'all_today' && !isToday && !isOverdue) continue;

      const { data: existing } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'reminder_followup_%')
        .limit(1);
      if (existing && existing.length > 0) continue;

      targets.push({
        id: `followup_${s.id}`,
        type: 'follow_up',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionDate: s.session_date,
        followUpDate: s.follow_up_date,
      });
    }

    // Post-session
    const { data: completed } = await admin
      .from('sessions')
      .select('id, session_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('session_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: false })
      .limit(50);

    for (const s of completed ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };

      const { data: existing } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'postsession_%')
        .limit(1);
      if (existing && existing.length > 0) continue;

      const sessionDate = new Date(s.session_date);
      const delayMin = (settings.postSessionMessageDelay as number) ?? 30;
      const dueAt = new Date(sessionDate.getTime() + delayMin * 60 * 1000);
      const isOverdue = dueAt < now;
      const isToday = sessionDate >= new Date(todayStart) && sessionDate < new Date(todayEnd);

      if (batchType === 'all_overdue' && !isOverdue) continue;
      if (batchType === 'all_today' && !isToday && !isOverdue) continue;

      targets.push({
        id: `postsession_${s.id}`,
        type: 'post_session',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionDate: s.session_date,
      });
    }
  }

  // Send messages
  for (const target of targets) {
    try {
      const { data: procs } = await admin
        .from('session_procedures')
        .select('category, procedure_name')
        .eq('session_id', target.sessionId);

      const procList = (procs ?? [])
        .map((p: { category: string; procedure_name: string }) => p.procedure_name || PROCEDURE_LABELS[p.category] || p.category)
        .join(', ');

      const message = buildMessage(target.type, {
        clientName: target.clientName,
        clinicName,
        sessionDate: target.sessionDate,
        followUpDate: target.followUpDate,
        procedures: procList,
      });

      // Check if there's a template configured for this type
      const templateKey = `${target.type}TemplateId`;
      const templateId = settings[templateKey] as string | undefined;

      const result = await flw.sendMessage({
        to: target.clientPhone,
        from: fromPhone,
        text: templateId ? undefined : message,
        templateId: templateId || undefined,
        parameters: templateId ? { client_name: target.clientName, clinic_name: clinicName } : undefined,
        hiddenSession: true,
      });

      const idempotencyPrefix =
        target.type === 'appointment'
          ? 'reminder_appointment_'
          : target.type === 'follow_up'
            ? 'reminder_followup_'
            : 'postsession_';

      await admin.from('client_messages').insert({
        clinic_id: clinicId,
        client_id: target.clientId,
        session_id: target.sessionId,
        channel: 'whatsapp',
        status: result.status === 'FAILED' ? 'failed' : 'sent',
        body: message,
        is_ai_generated: false,
        external_message_id: result.id,
        sent_at: new Date().toISOString(),
        idempotency_key: `${idempotencyPrefix}${target.sessionId}`,
      });

      results.push({ id: target.id, success: true });
    } catch (error) {
      results.push({
        id: target.id,
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
