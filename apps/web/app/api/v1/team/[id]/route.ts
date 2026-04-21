import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-helpers';
import { requireRole } from '@/lib/auth/require-role';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

type Params = { params: Promise<{ id: string }> };

// PATCH — altera role ou is_active
export async function PATCH(request: NextRequest, { params }: Params) {
  const ctx = await requireRole(['owner', 'admin']);
  if (!ctx) return errorResponse('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();
  const { role, isActive, fullName, specialty } = body as {
    role?: 'admin' | 'professional';
    isActive?: boolean;
    fullName?: string;
    specialty?: string;
  };

  const admin = getSupabaseAdminClient();
  const { data: target } = await admin
    .from('professionals')
    .select('id, clinic_id, role')
    .eq('id', id)
    .single();

  if (!target || target.clinic_id !== ctx.professional.clinicId) {
    return errorResponse('Profissional nao encontrado', 404);
  }

  // Owner nao pode ser alterado em role nem desativado
  if (target.role === 'owner' && (role !== undefined || isActive === false)) {
    return errorResponse('O dono da clinica nao pode ser rebaixado nem desativado', 403);
  }

  // Apenas owner pode promover/rebaixar para admin
  if (role !== undefined && ctx.professional.role !== 'owner') {
    return errorResponse('Apenas o dono da clinica pode alterar roles', 403);
  }
  if (role !== undefined && role !== 'admin' && role !== 'professional') {
    return errorResponse('role invalida', 400);
  }

  const patch: Record<string, unknown> = {};
  if (role !== undefined) patch.role = role;
  if (isActive !== undefined) patch.is_active = isActive;
  if (fullName !== undefined) patch.full_name = fullName;
  if (specialty !== undefined) patch.specialty = specialty;

  if (Object.keys(patch).length === 0) {
    return errorResponse('Nenhum campo para atualizar', 400);
  }

  const { data: updated, error } = await admin
    .from('professionals')
    .update(patch)
    .eq('id', id)
    .select('id, full_name, role, is_active, specialty')
    .single();

  if (error) return errorResponse(error.message, 500);
  return successResponse({ professional: updated });
}

// DELETE — desativa (soft delete). Só owner.
export async function DELETE(_request: NextRequest, { params }: Params) {
  const ctx = await requireRole(['owner']);
  if (!ctx) return errorResponse('Apenas o dono pode remover profissionais', 403);

  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const { data: target } = await admin
    .from('professionals')
    .select('id, clinic_id, role')
    .eq('id', id)
    .single();

  if (!target || target.clinic_id !== ctx.professional.clinicId) {
    return errorResponse('Profissional nao encontrado', 404);
  }
  if (target.role === 'owner') {
    return errorResponse('Nao e possivel remover o dono da clinica', 403);
  }

  const { error } = await admin
    .from('professionals')
    .update({ is_active: false })
    .eq('id', id);

  if (error) return errorResponse(error.message, 500);
  return successResponse({ message: 'Profissional desativado' });
}
