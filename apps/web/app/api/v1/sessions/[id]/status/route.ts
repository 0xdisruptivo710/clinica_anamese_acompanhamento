import { getAuthenticatedUser, getClinicId, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

const VALID_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('No clinic found', 403);

  const body = await request.json();
  const { status } = body as { status: string };

  if (!status || !VALID_STATUSES.includes(status)) {
    return errorResponse(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const admin = getSupabaseAdminClient();

  // Verify session belongs to this clinic
  const { data: session } = await admin
    .from('sessions')
    .select('id, status, client_id')
    .eq('id', params.id)
    .eq('clinic_id', clinicId)
    .single();

  if (!session) return errorResponse('Session not found', 404);

  // Update status
  const updateData: Record<string, unknown> = { status };

  // If completing, set completed timestamp fields
  if (status === 'completed' && session.status !== 'completed') {
    updateData.updated_at = new Date().toISOString();
  }

  const { error } = await admin
    .from('sessions')
    .update(updateData)
    .eq('id', params.id);

  if (error) return errorResponse(error.message, 500);

  return successResponse({ success: true, sessionId: params.id, status });
}
