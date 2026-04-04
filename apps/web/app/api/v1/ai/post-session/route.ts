import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabaseSessionRepository,
  SupabaseClientRepository,
  SupabaseProcedureRepository,
  ClaudeAIService,
} from '@aesthetic-track/infrastructure';
import { GeneratePostSessionMessageUseCase } from '@aesthetic-track/application';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { sessionId, professionalName } = body;

  if (!sessionId) return errorResponse('sessionId is required', 400);

  const supabase = getSupabaseAdminClient();
  const sessionRepo = new SupabaseSessionRepository(supabase);
  const clientRepo = new SupabaseClientRepository(supabase);
  const procedureRepo = new SupabaseProcedureRepository(supabase);
  const aiService = new ClaudeAIService();

  const useCase = new GeneratePostSessionMessageUseCase(
    sessionRepo,
    clientRepo,
    procedureRepo,
    aiService,
  );

  try {
    const result = await useCase.execute({ sessionId, professionalName: professionalName ?? '' });
    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate message';
    return errorResponse(message, 500);
  }
}
