import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabaseClientRepository,
  SupabaseSessionRepository,
  SupabasePhotoRepository,
  SupabaseProcedureRepository,
} from '@aesthetic-track/infrastructure';
import { GetClientEvolutionUseCase } from '@aesthetic-track/application';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const supabase = getSupabaseAdminClient();

  const useCase = new GetClientEvolutionUseCase(
    new SupabaseClientRepository(supabase),
    new SupabaseSessionRepository(supabase),
    new SupabasePhotoRepository(supabase),
    new SupabaseProcedureRepository(supabase),
  );

  try {
    const report = await useCase.execute(id);
    return successResponse(report);
  } catch {
    return errorResponse('Client not found', 404);
  }
}
