import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Not authenticated', 401);

  return successResponse({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
}
