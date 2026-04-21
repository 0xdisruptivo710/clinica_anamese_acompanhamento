import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export type Role = 'owner' | 'admin' | 'professional';

export interface AuthContext {
  userId: string;
  email: string | null;
  professional: {
    id: string;
    clinicId: string;
    role: Role;
    fullName: string;
    isActive: boolean;
    passwordSetAt: string | null;
  };
}

/**
 * Resolve o contexto autenticado: usuário + professional + role.
 * Retorna null se não há sessão, se o usuário não está vinculado a um
 * professional, ou se o professional está inativo.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getSupabaseAdminClient();
  const { data: professional } = await admin
    .from('professionals')
    .select('id, clinic_id, role, full_name, is_active, password_set_at')
    .eq('user_id', user.id)
    .single();

  if (!professional || !professional.is_active) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    professional: {
      id: professional.id,
      clinicId: professional.clinic_id,
      role: professional.role as Role,
      fullName: professional.full_name,
      isActive: professional.is_active,
      passwordSetAt: professional.password_set_at,
    },
  };
}

/**
 * Exige que o usuário autenticado tenha uma das roles permitidas.
 * Retorna o contexto se ok; retorna null se não autenticado ou sem permissão.
 */
export async function requireRole(allowed: Role[]): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  if (!allowed.includes(ctx.professional.role)) return null;
  return ctx;
}

export function hasRole(ctx: AuthContext | null, allowed: Role[]): boolean {
  return !!ctx && allowed.includes(ctx.professional.role);
}
