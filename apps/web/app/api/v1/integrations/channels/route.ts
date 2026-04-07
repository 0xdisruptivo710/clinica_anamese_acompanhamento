import { getAuthenticatedUser, ensureClinicSetup, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, FlwChatService } from '@aesthetic-track/infrastructure';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  const clinicId = await ensureClinicSetup(user.id);
  if (!clinicId) return errorResponse('Clinic not set up', 404);

  const admin = getSupabaseAdminClient();
  const { data: clinic } = await admin
    .from('clinics')
    .select('settings')
    .eq('id', clinicId)
    .single();

  const settings = (clinic?.settings ?? {}) as Record<string, string>;
  const token = settings.flwApiToken || settings.aiosApiKey;

  if (!token) {
    return errorResponse('API token not configured', 400);
  }

  const flw = new FlwChatService(token);

  try {
    const channels = await flw.listChannels('Whatsapp');
    return successResponse({ channels });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch channels',
      500,
    );
  }
}
