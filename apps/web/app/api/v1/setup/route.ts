import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { clinicName, professionalName, specialty } = body;

  if (!clinicName || !professionalName) {
    return errorResponse('clinicName and professionalName are required', 400);
  }

  const supabase = getSupabaseAdminClient();

  // Se ja existe uma clinica, este endpoint nao auto-cria profissional.
  // Acesso so via convite pelo owner/admin.
  const { data: existingClinic } = await supabase
    .from('clinics')
    .select('id')
    .limit(1)
    .single();

  if (existingClinic) {
    const { data: existingProf } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProf) {
      return successResponse({
        clinicId: existingClinic.id,
        message: 'Clinica ja configurada.',
      });
    }

    return errorResponse(
      'Esta clinica ja foi configurada. Peca ao administrador para te convidar.',
      403,
    );
  }

  // Primeiro acesso do sistema: cria clinica + promove o usuario a OWNER.
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({ name: clinicName, email: user.email })
    .select('id')
    .single();

  if (clinicError || !clinic) {
    return errorResponse(`Erro ao criar clinica: ${clinicError?.message}`, 500);
  }

  const nowIso = new Date().toISOString();
  const { error: profError } = await supabase.from('professionals').insert({
    user_id: user.id,
    clinic_id: clinic.id,
    full_name: professionalName,
    specialty: specialty || null,
    role: 'owner',
    password_set_at: nowIso, // signup direto ja define senha
  });

  if (profError) {
    return errorResponse(`Erro ao criar profissional: ${profError.message}`, 500);
  }

  return successResponse({
    clinicId: clinic.id,
    role: 'owner',
    message: 'Clinica configurada com sucesso!',
  }, 201);
}
