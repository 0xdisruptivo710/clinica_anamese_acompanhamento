import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabaseProcedureRepository,
  SupabaseSessionRepository,
  UpstashEventBus,
} from '@aesthetic-track/infrastructure';
import { RecordProcedureUseCase } from '@aesthetic-track/application';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const procedureRepo = new SupabaseProcedureRepository(supabase);

  const procedures = await procedureRepo.findBySessionId(id);

  return successResponse({
    procedures: procedures.map((p) => ({
      id: p.id.value,
      sessionId: p.sessionId,
      category: p.category,
      procedureName: p.procedureName,
      treatmentAreas: p.treatmentAreas,
      side: p.side,
      technicalDetails: p.technicalDetails,
      immediateResult: p.immediateResult,
      complications: p.complications,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await request.json();

  const supabase = getSupabaseAdminClient();
  const procedureRepo = new SupabaseProcedureRepository(supabase);
  const sessionRepo = new SupabaseSessionRepository(supabase);
  const eventBus = new UpstashEventBus();
  const useCase = new RecordProcedureUseCase(procedureRepo, sessionRepo, eventBus);

  try {
    const result = await useCase.execute({ ...body, sessionId: id });
    return successResponse(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record procedure';
    return errorResponse(message, 400);
  }
}
