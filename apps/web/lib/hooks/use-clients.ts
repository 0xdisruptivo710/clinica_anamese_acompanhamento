'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ClientListItem {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  profilePhotoUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

interface ClientDetail extends ClientListItem {
  clinicId: string;
  dateOfBirth?: string;
  cpf?: string;
  address?: Record<string, unknown>;
  skinType?: string;
  fitzpatrick?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  previousProcedures: string[];
  aestheticGoals?: string;
  preferredChannel: string;
  communicationOptIn: boolean;
  notes?: string;
  updatedAt: string;
}

async function fetchClients(search?: string, limit = 20, offset = 0) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  const res = await fetch(`/api/v1/clients?${params}`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json() as Promise<{ clients: ClientListItem[]; total: number }>;
}

async function fetchClient(id: string) {
  const res = await fetch(`/api/v1/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json() as Promise<ClientDetail>;
}

async function createClient(data: Record<string, unknown>) {
  const res = await fetch('/api/v1/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create client');
  }
  return res.json();
}

async function updateClient(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/v1/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update client');
  }
  return res.json();
}

export function useClients(search?: string) {
  return useQuery({
    queryKey: ['clients', search],
    queryFn: () => fetchClients(search),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateClient(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    },
  });
}
