import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

interface ReminderItem {
  id: string;
  type: 'appointment' | 'follow_up' | 'post_session';
  clientId: string;
  clientName: string;
  clientPhone: string;
  sessionId: string;
  sessionNumber: number;
  sessionDate: string;
  sessionStatus: string;
  followUpDate?: string;
  status: 'pending' | 'sent' | 'overdue';
  procedureSummary: string;
  dueAt: string;
  description: string;
}

/**
 * Reminders are categorized by SESSION STATUS:
 *
 * 1. LEMBRETE DE AGENDAMENTO (appointment)
 *    Session status = 'scheduled' | 'in_progress'
 *    → Remind client BEFORE the appointment
 *
 * 2. POS-PROCEDIMENTO (post_session)
 *    Session status = 'completed'
 *    → Send care instructions AFTER the procedure
 *
 * 3. FOLLOW-UP (follow_up)
 *    Session status = 'no_show' | 'cancelled'
 *    → Reach out to reschedule
 */
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'all';
  const type = searchParams.get('type');

  const admin = getSupabaseAdminClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, unknown>;
  const reminders: ReminderItem[] = [];

  // ──────────────────────────────────────────────
  // 1. LEMBRETE DE AGENDAMENTO
  //    status = scheduled, session_date no futuro
  //    → lembrar a cliente antes do horario
  // ──────────────────────────────────────────────
  if (!type || type === 'appointment') {
    const { data: sessions, error } = await admin
      .from('sessions')
      .select('id, session_number, session_date, status, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .in('status', ['scheduled', 'in_progress'])
      .gte('session_date', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: true })
      .limit(50);

    if (error) console.error('[reminders] appointment query error:', error.message);

    for (const s of sessions ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      if (!client?.full_name) continue;

      const sessionDate = new Date(s.session_date);
      const reminderHours = (settings.appointmentReminderHours as number) ?? 24;
      const dueAt = new Date(sessionDate.getTime() - reminderHours * 60 * 60 * 1000);

      const isOverdue = dueAt < now && sessionDate > now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (filter === 'today' && !isToday && !isOverdue) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && dueAt <= now) continue;

      const { data: sent } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'reminder_appointment_%')
        .limit(1);

      const alreadySent = (sent ?? []).length > 0;
      if (alreadySent && filter !== 'all') continue;

      reminders.push({
        id: `appt_${s.id}`,
        type: 'appointment',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionNumber: s.session_number,
        sessionDate: s.session_date,
        sessionStatus: s.status,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
        description: `Lembrar da sessao #${s.session_number} agendada para ${sessionDate.toLocaleDateString('pt-BR')}`,
      });
    }
  }

  // ──────────────────────────────────────────────
  // 2. POS-PROCEDIMENTO
  //    status = completed (ultimos 7 dias)
  //    → enviar cuidados pos-sessao
  // ──────────────────────────────────────────────
  if (!type || type === 'post_session') {
    const { data: sessions, error } = await admin
      .from('sessions')
      .select('id, session_number, session_date, status, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('session_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: false })
      .limit(50);

    if (error) console.error('[reminders] post_session query error:', error.message);

    for (const s of sessions ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      if (!client?.full_name) continue;

      const sessionDate = new Date(s.session_date);
      const delayMin = (settings.postSessionMessageDelay as number) ?? 30;
      const dueAt = new Date(sessionDate.getTime() + delayMin * 60 * 1000);
      const isOverdue = dueAt < now;
      const isToday = sessionDate >= new Date(todayStart) && sessionDate < new Date(todayEnd);

      if (filter === 'today' && !isToday) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && isOverdue) continue;

      const { data: sent } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'postsession_%')
        .limit(1);

      const alreadySent = (sent ?? []).length > 0;
      if (alreadySent && filter !== 'all') continue;

      reminders.push({
        id: `postsession_${s.id}`,
        type: 'post_session',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionNumber: s.session_number,
        sessionDate: s.session_date,
        sessionStatus: s.status,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
        description: `Enviar cuidados pos-procedimento da sessao #${s.session_number}`,
      });
    }
  }

  // ──────────────────────────────────────────────
  // 3. FOLLOW-UP (FALTOU / DESMARCOU)
  //    status = no_show | cancelled (ultimos 30 dias)
  //    → entrar em contato para reagendar
  // ──────────────────────────────────────────────
  if (!type || type === 'follow_up') {
    const { data: sessions, error } = await admin
      .from('sessions')
      .select('id, session_number, session_date, status, client_id, follow_up_date, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .in('status', ['no_show', 'cancelled'])
      .gte('session_date', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: false })
      .limit(50);

    if (error) console.error('[reminders] follow_up query error:', error.message);

    for (const s of sessions ?? []) {
      const client = s.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      if (!client?.full_name) continue;

      const sessionDate = new Date(s.session_date);
      // Follow-up due 1 day after the missed/cancelled session
      const dueAt = new Date(sessionDate.getTime() + 24 * 60 * 60 * 1000);
      const isOverdue = dueAt < now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (filter === 'today' && !isToday) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && dueAt <= now) continue;

      const { data: sent } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', s.id)
        .like('idempotency_key', 'reminder_followup_%')
        .limit(1);

      const alreadySent = (sent ?? []).length > 0;
      if (alreadySent && filter !== 'all') continue;

      const statusLabel = s.status === 'no_show' ? 'faltou' : 'desmarcou';

      reminders.push({
        id: `followup_${s.id}`,
        type: 'follow_up',
        clientId: s.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: s.id,
        sessionNumber: s.session_number,
        sessionDate: s.session_date,
        sessionStatus: s.status,
        followUpDate: s.follow_up_date ?? undefined,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
        description: `Cliente ${statusLabel} a sessao #${s.session_number} — reagendar`,
      });
    }
  }

  // Sort: overdue first, then pending, then sent
  const statusOrder: Record<string, number> = { overdue: 0, pending: 1, sent: 2 };
  reminders.sort((a, b) => {
    const sa = statusOrder[a.status] ?? 9;
    const sb = statusOrder[b.status] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  return successResponse({
    reminders,
    summary: {
      total: reminders.length,
      overdue: reminders.filter((r) => r.status === 'overdue').length,
      pending: reminders.filter((r) => r.status === 'pending').length,
      sent: reminders.filter((r) => r.status === 'sent').length,
    },
  });
}
