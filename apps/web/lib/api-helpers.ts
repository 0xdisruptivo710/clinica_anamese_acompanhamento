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
 * Retorna o clinic_id do usuário se ele estiver vinculado a um
 * professional ativo. Retorna null caso contrário — NÃO auto-cria
 * mais profissionais (acesso passa exclusivamente pelo convite).
 */
export async function ensureClinicSetup(userId: string): Promise<string | null> {
  const admin = getSupabaseAdminClient();
  const { data: prof } = await admin
    .from('professionals')
    .select('clinic_id, is_active')
    .eq('user_id', userId)
    .single();

  if (!prof || !prof.is_active) return null;
  return prof.clinic_id;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
