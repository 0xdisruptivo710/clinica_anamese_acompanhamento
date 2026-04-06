import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

interface ReminderItem {
  id: string;
  type: 'appointment' | 'follow_up' | 'post_session';
  clientId: string;
  clientName: string;
  clientPhone: string;
  sessionId: string;
  sessionDate: string;
  followUpDate?: string;
  status: 'pending' | 'sent' | 'overdue' | 'skipped';
  procedureSummary: string;
  dueAt: string;
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'all'; // all, today, overdue, upcoming
  const type = searchParams.get('type'); // appointment, follow_up, post_session

  const admin = getSupabaseAdminClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const reminders: ReminderItem[] = [];

  // Get clinic settings
  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, unknown>;

  // ──────────────────────────────────────────────
  // 1. APPOINTMENT REMINDERS (upcoming scheduled sessions)
  // ──────────────────────────────────────────────
  if (!type || type === 'appointment') {
    const appointmentQuery = admin
      .from('sessions')
      .select('id, session_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'scheduled')
      .gte('session_date', todayStart)
      .order('session_date', { ascending: true })
      .limit(50);

    const { data: scheduledSessions } = await appointmentQuery;

    for (const session of scheduledSessions ?? []) {
      const client = session.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      const sessionDate = new Date(session.session_date);
      const reminderHours = (settings.appointmentReminderHours as number) ?? 24;
      const dueAt = new Date(sessionDate.getTime() - reminderHours * 60 * 60 * 1000);

      const isOverdue = dueAt < now && sessionDate > now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (filter === 'today' && !isToday) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && dueAt <= now) continue;

      // Check if already sent
      const { data: existingMsg } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', session.id)
        .like('idempotency_key', 'reminder_appointment_%')
        .limit(1);

      const alreadySent = (existingMsg ?? []).length > 0;

      reminders.push({
        id: `appt_${session.id}`,
        type: 'appointment',
        clientId: session.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: session.id,
        sessionDate: session.session_date,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
      });
    }
  }

  // ──────────────────────────────────────────────
  // 2. FOLLOW-UP REMINDERS (sessions with follow_up_date)
  // ──────────────────────────────────────────────
  if (!type || type === 'follow_up') {
    const { data: followUpSessions } = await admin
      .from('sessions')
      .select('id, session_date, follow_up_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .not('follow_up_date', 'is', null)
      .gte('follow_up_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('follow_up_date', { ascending: true })
      .limit(50);

    for (const session of followUpSessions ?? []) {
      const client = session.clients as unknown as { full_name: string; phone: string; whatsapp: string };
      const followUpDate = new Date(session.follow_up_date + 'T09:00:00');
      const daysBefore = (settings.followUpReminderDaysBefore as number) ?? 1;
      const dueAt = new Date(followUpDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);

      const isOverdue = dueAt < now;
      const isToday = dueAt >= new Date(todayStart) && dueAt < new Date(todayEnd);

      if (filter === 'today' && !isToday) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && dueAt <= now) continue;

      const { data: existingMsg } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', session.id)
        .like('idempotency_key', 'reminder_followup_%')
        .limit(1);

      const alreadySent = (existingMsg ?? []).length > 0;

      reminders.push({
        id: `followup_${session.id}`,
        type: 'follow_up',
        clientId: session.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: session.id,
        sessionDate: session.session_date,
        followUpDate: session.follow_up_date,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
      });
    }
  }

  // ──────────────────────────────────────────────
  // 3. POST-SESSION MESSAGES (completed without message sent)
  // ──────────────────────────────────────────────
  if (!type || type === 'post_session') {
    const { data: completedSessions } = await admin
      .from('sessions')
      .select('id, session_date, client_id, clients!inner(full_name, phone, whatsapp)')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('session_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('session_date', { ascending: false })
      .limit(50);

    for (const session of completedSessions ?? []) {
      const client = session.clients as unknown as { full_name: string; phone: string; whatsapp: string };

      const { data: existingMsg } = await admin
        .from('client_messages')
        .select('id')
        .eq('session_id', session.id)
        .like('idempotency_key', 'postsession_%')
        .limit(1);

      const alreadySent = (existingMsg ?? []).length > 0;

      const sessionDate = new Date(session.session_date);
      const delayMin = (settings.postSessionMessageDelay as number) ?? 30;
      const dueAt = new Date(sessionDate.getTime() + delayMin * 60 * 1000);
      const isOverdue = !alreadySent && dueAt < now;

      if (filter === 'today' && !(sessionDate >= new Date(todayStart) && sessionDate < new Date(todayEnd))) continue;
      if (filter === 'overdue' && !isOverdue) continue;
      if (filter === 'upcoming' && alreadySent) continue;
      if (alreadySent && filter !== 'all') continue;

      reminders.push({
        id: `postsession_${session.id}`,
        type: 'post_session',
        clientId: session.client_id,
        clientName: client.full_name,
        clientPhone: client.whatsapp || client.phone,
        sessionId: session.id,
        sessionDate: session.session_date,
        status: alreadySent ? 'sent' : isOverdue ? 'overdue' : 'pending',
        procedureSummary: '',
        dueAt: dueAt.toISOString(),
      });
    }
  }

  // Sort: overdue first, then pending today, then upcoming
  const statusOrder: Record<string, number> = { overdue: 0, pending: 1, sent: 2, skipped: 3 };
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
