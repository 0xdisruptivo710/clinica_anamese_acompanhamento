'use client';

import { useQuery } from '@tanstack/react-query';

export interface UserProfile {
  user: {
    id: string;
    email: string;
  };
  professional: {
    id: string;
    full_name: string;
    specialty: string | null;
    crf_crm: string | null;
    role: string;
    avatar_url: string | null;
  } | null;
  clinic: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch('/api/v1/me/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}
