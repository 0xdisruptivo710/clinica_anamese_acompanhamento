import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, FlwChatService } from '@aesthetic-track/infrastructure';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const body = await request.json();
  const { clientId } = body as { clientId: string };

  if (!clientId) return errorResponse('clientId is required', 400);

  const admin = getSupabaseAdminClient();

  // Get clinic settings
  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, string>;
  const token = settings.flwApiToken || settings.aiosApiKey;

  if (!token) {
    return errorResponse('FLW Chat API not configured', 400);
  }

  // Get full client data
  const { data: client } = await admin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (!client) return errorResponse('Client not found', 404);

  const phone = client.whatsapp || client.phone;
  if (!phone) return errorResponse('Client has no phone number', 400);

  // Get all procedure categories this client has had
  const { data: procedures } = await admin
    .from('session_procedures')
    .select('category, sessions!inner(client_id)')
    .eq('sessions.client_id', clientId);

  const procedureCategories = [
    ...new Set((procedures ?? []).map((p: { category: string }) => p.category)),
  ];

  const flw = new FlwChatService(token);

  try {
    const result = await flw.syncClientToCRM({
      phone,
      fullName: client.full_name,
      email: client.email ?? undefined,
      skinType: client.skin_type ?? undefined,
      fitzpatrick: client.fitzpatrick ?? undefined,
      allergies: client.allergies ?? undefined,
      aestheticGoals: client.aesthetic_goals ?? undefined,
      tags: client.tags ?? undefined,
      procedureCategories,
    });

    return successResponse({
      success: true,
      contact: {
        id: result.contact.id,
        name: result.contact.name,
        phone: result.contact.phoneNumber,
        tags: result.contact.tagNames,
      },
      tagsUpdated: result.tagsUpdated,
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'CRM sync failed',
      500,
    );
  }
}
