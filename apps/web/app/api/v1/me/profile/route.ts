import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const admin = getSupabaseAdminClient();

  const [profResult, clinicResult] = await Promise.all([
    admin
      .from('professionals')
      .select('id, full_name, specialty, crf_crm, role, avatar_url')
      .eq('user_id', user.id)
      .eq('clinic_id', clinicId)
      .single(),
    admin
      .from('clinics')
      .select('id, name, logo_url')
      .eq('id', clinicId)
      .single(),
  ]);

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
    },
    professional: profResult.data ?? null,
    clinic: clinicResult.data ?? null,
  });
}
