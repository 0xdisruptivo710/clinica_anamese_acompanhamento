'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SessionClient {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  profilePhotoUrl?: string;
  skinType?: string;
  fitzpatrick?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  aestheticGoals?: string;
  tags?: string[];
}

export interface SessionProcedure {
  id: string;
  category: string;
  procedureName: string;
  treatmentAreas: string[];
  technicalDetails: Record<string, unknown>;
}

export interface SessionListItem {
  id: string;
  clientId: string;
  professionalId: string;
  sessionNumber: number;
  sessionDate: string;
  status: string;
  durationMinutes?: number;
  totalValue?: number;
  followUpDate?: string;
  clientComplaint?: string;
  preSessionNotes?: string;
  postSessionNotes?: string;
  professionalNotes?: string;
  painScore?: number;
  client: SessionClient | null;
  procedures: SessionProcedure[];
  procedureCount: number;
  photoCount: number;
}

async function fetchSessions(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`/api/v1/sessions?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json() as Promise<{ sessions: SessionListItem[] }>;
}

async function createSession(data: Record<string, unknown>) {
  const res = await fetch('/api/v1/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create session');
  }
  return res.json();
}

async function completeSession(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/v1/sessions/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to complete session');
  }
  return res.json();
}

async function addProcedure(sessionId: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/v1/sessions/${sessionId}/procedures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add procedure');
  }
  return res.json();
}

export function useSessions(filters?: { clientId?: string; status?: string; search?: string }) {
  const params: Record<string, string> = {};
  if (filters?.clientId) params.clientId = filters.clientId;
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;

  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => fetchSessions(params),
  });
}

export interface SessionPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  photoType: string;
  angle?: string;
  caption?: string;
  takenAt: string;
}

export interface SessionDetail extends SessionListItem {
  photos: SessionPhoto[];
}

async function fetchSessionDetail(id: string) {
  const res = await fetch(`/api/v1/sessions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json() as Promise<SessionDetail>;
}

export function useSessionDetail(id: string | null) {
  return useQuery({
    queryKey: ['session-detail', id],
    queryFn: () => fetchSessionDetail(id!),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      completeSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useAddProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Record<string, unknown> }) =>
      addProcedure(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
