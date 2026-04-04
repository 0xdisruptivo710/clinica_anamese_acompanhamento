import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient, SupabaseSessionRepository, UpstashEventBus } from '@aesthetic-track/infrastructure';
import { CompleteSessionUseCase } from '@aesthetic-track/application';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await request.json();

  const supabase = getSupabaseAdminClient();
  const sessionRepo = new SupabaseSessionRepository(supabase);
  const eventBus = new UpstashEventBus();
  const useCase = new CompleteSessionUseCase(sessionRepo, eventBus);

  try {
    await useCase.execute({ sessionId: id, ...body });
    return successResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete session';
    return errorResponse(message, 400);
  }
}
