import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import { requireRole, getAuthContext } from '@/lib/auth/require-role';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

// GET — lista todos os profissionais da clinica (qualquer role ativo pode ver)
export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return errorResponse('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('professionals')
    .select('id, user_id, full_name, specialty, role, is_active, invited_at, password_set_at, created_at')
    .eq('clinic_id', ctx.professional.clinicId)
    .order('created_at', { ascending: true });

  if (error) return errorResponse(error.message, 500);

  // Buscar emails via auth.admin (uma chamada por usuario — OK para lista pequena)
  const enriched = await Promise.all(
    (data ?? []).map(async (p) => {
      const { data: userData } = await admin.auth.admin.getUserById(p.user_id);
      return {
        ...p,
        email: userData?.user?.email ?? null,
        last_sign_in_at: userData?.user?.last_sign_in_at ?? null,
      };
    }),
  );

  return successResponse({ professionals: enriched, callerRole: ctx.professional.role });
}

// POST /invite — apenas owner/admin podem convidar
export async function POST(request: NextRequest) {
  const ctx = await requireRole(['owner', 'admin']);
  if (!ctx) return errorResponse('Forbidden', 403);

  const body = await request.json();
  const { fullName, email, role, specialty } = body as {
    fullName?: string;
    email?: string;
    role?: 'admin' | 'professional';
    specialty?: string;
  };

  if (!fullName || !email || !role) {
    return errorResponse('fullName, email e role sao obrigatorios', 400);
  }
  if (role !== 'admin' && role !== 'professional') {
    return errorResponse('role deve ser admin ou professional', 400);
  }
  // Apenas owner pode convidar outro admin
  if (role === 'admin' && ctx.professional.role !== 'owner') {
    return errorResponse('Apenas o dono da clinica pode convidar administradores', 403);
  }

  const admin = getSupabaseAdminClient();

  // Impede convite de e-mail ja vinculado a um profissional da clinica
  const { data: existingByEmail } = await admin
    .from('professionals')
    .select('id, user_id')
    .eq('clinic_id', ctx.professional.clinicId);

  if (existingByEmail?.length) {
    for (const p of existingByEmail) {
      const { data: u } = await admin.auth.admin.getUserById(p.user_id);
      if (u?.user?.email?.toLowerCase() === email.toLowerCase()) {
        return errorResponse('Este e-mail ja pertence a um profissional da clinica', 409);
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/onboarding/set-password`,
    data: { invited_by_clinic: ctx.professional.clinicId },
  });

  if (inviteError || !invited?.user) {
    return errorResponse(`Falha no convite: ${inviteError?.message ?? 'erro desconhecido'}`, 500);
  }

  const { data: professional, error: profError } = await admin
    .from('professionals')
    .insert({
      user_id: invited.user.id,
      clinic_id: ctx.professional.clinicId,
      full_name: fullName,
      specialty: specialty || null,
      role,
      invited_at: new Date().toISOString(),
      invited_by: ctx.professional.id,
      password_set_at: null,
    })
    .select('id, full_name, role, invited_at')
    .single();

  if (profError) {
    // Rollback: remove o auth.user criado
    await admin.auth.admin.deleteUser(invited.user.id);
    return errorResponse(`Erro ao vincular profissional: ${profError.message}`, 500);
  }

  return successResponse(
    {
      professional,
      email,
      message: 'Convite enviado. O profissional recebera um e-mail com o link de acesso.',
    },
    201,
  );
}
