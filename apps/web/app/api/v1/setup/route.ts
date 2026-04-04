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

  // Single-clinic: check if any clinic exists
  const { data: existingClinic } = await supabase
    .from('clinics')
    .select('id')
    .limit(1)
    .single();

  if (existingClinic) {
    // Clinic exists, just ensure professional is linked
    const { data: existingProf } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingProf) {
      await supabase.from('professionals').insert({
        user_id: user.id,
        clinic_id: existingClinic.id,
        full_name: professionalName,
        specialty: specialty || null,
        role: 'admin',
      });
    }

    return successResponse({
      clinicId: existingClinic.id,
      message: 'Clinica ja existe. Profissional vinculado.',
    });
  }

  // Create the single clinic
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      name: clinicName,
      email: user.email,
    })
    .select('id')
    .single();

  if (clinicError || !clinic) {
    return errorResponse(`Erro ao criar clinica: ${clinicError?.message}`, 500);
  }

  // Create professional
  const { error: profError } = await supabase
    .from('professionals')
    .insert({
      user_id: user.id,
      clinic_id: clinic.id,
      full_name: professionalName,
      specialty: specialty || null,
      role: 'admin',
    });

  if (profError) {
    return errorResponse(`Erro ao criar profissional: ${profError.message}`, 500);
  }

  return successResponse({
    clinicId: clinic.id,
    message: 'Clinica configurada com sucesso!',
  }, 201);
}
