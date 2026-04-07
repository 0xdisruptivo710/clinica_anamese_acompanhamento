'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ClinicSettings {
  // Notification toggles
  postSessionMessageEnabled: boolean;
  postSessionMessageDelay: number;
  appointmentReminderEnabled: boolean;
  appointmentReminderHours: number;
  followUpReminderEnabled: boolean;
  followUpReminderDaysBefore: number;

  // FLW Chat / WTS Chat API
  flwApiToken: string;
  flwFromPhone: string;

  // Template IDs for each reminder type
  appointmentTemplateId: string;
  followUpTemplateId: string;
  postSessionTemplateId: string;

  // CRM sync
  crmSyncEnabled: boolean;

  // AI
  aiEnabled: boolean;

  // Legacy (backwards compat)
  aiosApiKey: string;
  aiosFromPhone: string;
}

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  postSessionMessageEnabled: false,
  postSessionMessageDelay: 30,
  appointmentReminderEnabled: false,
  appointmentReminderHours: 24,
  followUpReminderEnabled: false,
  followUpReminderDaysBefore: 1,
  flwApiToken: '',
  flwFromPhone: '',
  appointmentTemplateId: '',
  followUpTemplateId: '',
  postSessionTemplateId: '',
  crmSyncEnabled: false,
  aiEnabled: false,
  aiosApiKey: '',
  aiosFromPhone: '',
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

// ──────────────────────────────────────────────
// Integration hooks
// ──────────────────────────────────────────────

export interface FlwTemplate {
  id: string;
  name: string;
  status: string;
  type: string;
  body: string | null;
}

export interface FlwChannel {
  id: string;
  key: string;
  platform: string;
  displayName: string;
}

async function fetchTemplates(): Promise<{ templates: FlwTemplate[] }> {
  const res = await fetch('/api/v1/integrations/templates');
  if (!res.ok) return { templates: [] };
  return res.json();
}

async function fetchChannels(): Promise<{ channels: FlwChannel[] }> {
  const res = await fetch('/api/v1/integrations/channels');
  if (!res.ok) return { channels: [] };
  return res.json();
}

async function testConnection(): Promise<{ connected: boolean; channelCount?: number; channels?: Array<{ displayName: string; platform: string; key: string }>; error?: string }> {
  const res = await fetch('/api/v1/integrations/test', { method: 'POST' });
  if (!res.ok) return { connected: false, error: 'Request failed' };
  return res.json();
}

export function useFlwTemplates(enabled = true) {
  return useQuery({
    queryKey: ['flw-templates'],
    queryFn: fetchTemplates,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFlwChannels(enabled = true) {
  return useQuery({
    queryKey: ['flw-channels'],
    queryFn: fetchChannels,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestConnection() {
  return useMutation({ mutationFn: testConnection });
}
