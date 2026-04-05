import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const admin = getSupabaseAdminClient();

  const [clinicResult, profResult] = await Promise.all([
    admin
      .from('clinics')
      .select('id, name, cnpj, phone, email, settings')
      .eq('id', clinicId)
      .single(),
    admin
      .from('professionals')
      .select('id, full_name, specialty, crf_crm, role')
      .eq('user_id', user.id)
      .eq('clinic_id', clinicId)
      .single(),
  ]);

  return successResponse({
    clinic: clinicResult.data ?? null,
    professional: profResult.data ?? null,
  });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const body = await request.json();
  const admin = getSupabaseAdminClient();

  if (body.clinic) {
    const { name, cnpj, phone, email, settings } = body.clinic;
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (cnpj !== undefined) updateData.cnpj = cnpj;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (settings !== undefined) updateData.settings = settings;

    if (Object.keys(updateData).length > 0) {
      await admin.from('clinics').update(updateData).eq('id', clinicId);
    }
  }

  if (body.professional) {
    const { full_name, specialty, crf_crm } = body.professional;
    const updateData: Record<string, unknown> = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (crf_crm !== undefined) updateData.crf_crm = crf_crm;

    if (Object.keys(updateData).length > 0) {
      await admin
        .from('professionals')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('clinic_id', clinicId);
    }
  }

  return successResponse({ success: true });
}
