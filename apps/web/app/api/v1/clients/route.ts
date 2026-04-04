import { NextRequest } from 'next/server';
import { getAuthenticatedUser, getClinicId, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabaseClientRepository,
  UpstashEventBus,
} from '@aesthetic-track/infrastructure';
import { CreateClientUseCase, ListClientsUseCase } from '@aesthetic-track/application';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('Clinica nao configurada. Acesse /onboarding', 403);

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') ?? undefined;
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const supabase = getSupabaseAdminClient();
  const clientRepo = new SupabaseClientRepository(supabase);
  const useCase = new ListClientsUseCase(clientRepo);

  const result = await useCase.execute({ clinicId, search, limit, offset });

  return successResponse({
    clients: result.clients.map((c) => ({
      id: c.id.value,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      whatsapp: c.whatsapp,
      profilePhotoUrl: c.profilePhotoUrl,
      tags: c.tags,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    })),
    total: result.total,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('Clinica nao configurada. Acesse /onboarding', 403);

  const body = await request.json();

  const supabase = getSupabaseAdminClient();
  const clientRepo = new SupabaseClientRepository(supabase);
  const eventBus = new UpstashEventBus();
  const useCase = new CreateClientUseCase(clientRepo, eventBus);

  try {
    const result = await useCase.execute({ ...body, clinicId });
    return successResponse(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return errorResponse(message, 400);
  }
}
