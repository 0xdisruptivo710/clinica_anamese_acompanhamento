import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from('professionals')
    .update({ password_set_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) return errorResponse(error.message, 500);
  return successResponse({ ok: true });
}
