'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReminderItem {
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

export interface RemindersResponse {
  reminders: ReminderItem[];
  summary: {
    total: number;
    overdue: number;
    pending: number;
    sent: number;
  };
}

async function fetchReminders(filter?: string, type?: string): Promise<RemindersResponse> {
  const params = new URLSearchParams();
  if (filter) params.set('filter', filter);
  if (type) params.set('type', type);
  const res = await fetch(`/api/v1/reminders?${params}`);
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

async function sendReminders(data: { reminderIds?: string[]; type?: string }) {
  const res = await fetch('/api/v1/reminders/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send reminders');
  }
  return res.json();
}

async function syncClientCRM(clientId: string) {
  const res = await fetch('/api/v1/messages/sync-crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to sync CRM');
  }
  return res.json();
}

export function useReminders(filter?: string, type?: string) {
  return useQuery({
    queryKey: ['reminders', filter, type],
    queryFn: () => fetchReminders(filter, type),
    refetchInterval: 60_000,
  });
}

export function useSendReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendReminders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useSyncCRM() {
  return useMutation({
    mutationFn: syncClientCRM,
  });
}
