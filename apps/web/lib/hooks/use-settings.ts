'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ClinicSettings {
  postSessionMessageEnabled: boolean;
  postSessionMessageDelay: number;
  appointmentReminderEnabled: boolean;
  appointmentReminderHours: number;
  followUpReminderEnabled: boolean;
  followUpReminderDaysBefore: number;
  aiosApiUrl: string;
  aiosApiKey: string;
  aiosInstanceName: string;
  aiEnabled: boolean;
}

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  postSessionMessageEnabled: false,
  postSessionMessageDelay: 30,
  appointmentReminderEnabled: false,
  appointmentReminderHours: 24,
  followUpReminderEnabled: false,
  followUpReminderDaysBefore: 1,
  aiosApiUrl: '',
  aiosApiKey: '',
  aiosInstanceName: '',
  aiEnabled: false,
};

export interface SettingsData {
  clinic: {
    id: string;
    name: string;
    cnpj: string | null;
    phone: string | null;
    email: string | null;
    settings: ClinicSettings | null;
  } | null;
  professional: {
    id: string;
    full_name: string;
    specialty: string | null;
    crf_crm: string | null;
    role: string;
  } | null;
}

async function fetchSettings(): Promise<SettingsData> {
  const res = await fetch('/api/v1/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

async function updateSettings(data: {
  clinic?: Record<string, unknown>;
  professional?: Record<string, unknown>;
}) {
  const res = await fetch('/api/v1/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
