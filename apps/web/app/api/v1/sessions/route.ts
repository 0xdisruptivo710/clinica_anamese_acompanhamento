import { NextRequest } from 'next/server';
import { getAuthenticatedUser, getClinicId, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabaseSessionRepository,
  SupabaseClientRepository,
  UpstashEventBus,
} from '@aesthetic-track/infrastructure';
import { CreateSessionUseCase } from '@aesthetic-track/application';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('No clinic found', 403);

  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const startDate = searchParams.get('startDate') ?? undefined;
  const endDate = searchParams.get('endDate') ?? undefined;
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from('sessions')
    .select(`
      *,
      clients!inner(id, full_name, phone, whatsapp, email, profile_photo_url, skin_type, fitzpatrick, allergies, medications, medical_conditions, aesthetic_goals, tags),
      session_procedures(id, category, procedure_name, treatment_areas, technical_details),
      session_photos(id)
    `)
    .eq('clinic_id', clinicId)
    .order('session_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (clientId) query = query.eq('client_id', clientId);
  if (status) query = query.eq('status', status);
  if (startDate) query = query.gte('session_date', startDate);
  if (endDate) query = query.lte('session_date', endDate);
  if (search) query = query.ilike('clients.full_name', `%${search}%`);

  const { data, error } = await query;

  if (error) return errorResponse(error.message, 500);

  return successResponse({
    sessions: (data ?? []).map((s) => ({
      id: s.id,
      clientId: s.client_id,
      professionalId: s.professional_id,
      sessionNumber: s.session_number,
      sessionDate: s.session_date,
      status: s.status,
      durationMinutes: s.duration_minutes,
      totalValue: s.total_value,
      followUpDate: s.follow_up_date,
      clientComplaint: s.client_complaint,
      preSessionNotes: s.pre_session_notes,
      postSessionNotes: s.post_session_notes,
      professionalNotes: s.professional_notes,
      painScore: s.pain_score,
      client: s.clients ? {
        id: s.clients.id,
        fullName: s.clients.full_name,
        phone: s.clients.phone,
        whatsapp: s.clients.whatsapp,
        email: s.clients.email,
        profilePhotoUrl: s.clients.profile_photo_url,
        skinType: s.clients.skin_type,
        fitzpatrick: s.clients.fitzpatrick,
        allergies: s.clients.allergies,
        medications: s.clients.medications,
        medicalConditions: s.clients.medical_conditions,
        aestheticGoals: s.clients.aesthetic_goals,
        tags: s.clients.tags,
      } : null,
      procedures: (s.session_procedures ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        category: p.category,
        procedureName: p.procedure_name,
        treatmentAreas: p.treatment_areas,
        technicalDetails: p.technical_details,
      })),
      procedureCount: s.session_procedures?.length ?? 0,
      photoCount: s.session_photos?.length ?? 0,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('No clinic found', 403);

  const body = await request.json();

  const supabase = getSupabaseAdminClient();
  const sessionRepo = new SupabaseSessionRepository(supabase);
  const clientRepo = new SupabaseClientRepository(supabase);
  const eventBus = new UpstashEventBus();
  const useCase = new CreateSessionUseCase(sessionRepo, clientRepo, eventBus);

  try {
    const result = await useCase.execute({
      ...body,
      clinicId,
      idempotencyKey: body.idempotencyKey ?? crypto.randomUUID(),
    });
    return successResponse(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    return errorResponse(message, 400);
  }
}
