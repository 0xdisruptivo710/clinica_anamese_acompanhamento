import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Single-clinic mode: returns the one and only clinic.
 * Creates it automatically on first use if needed.
 */
export async function getClinicId(): Promise<string | null> {
  const admin = getSupabaseAdminClient();

  const { data: clinic } = await admin
    .from('clinics')
    .select('id')
    .limit(1)
    .single();

  return clinic?.id ?? null;
}

/**
 * Ensures the clinic + professional exist.
 * Returns clinicId or null if not set up yet.
 */
export async function ensureClinicSetup(userId: string): Promise<string | null> {
  const clinicId = await getClinicId();
  if (!clinicId) return null;

  // Ensure this user is linked as professional
  const admin = getSupabaseAdminClient();
  const { data: prof } = await admin
    .from('professionals')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!prof) {
    // Auto-link user to the clinic
    await admin.from('professionals').insert({
      user_id: userId,
      clinic_id: clinicId,
      full_name: 'Profissional',
      role: 'admin',
    });
  }

  return clinicId;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
