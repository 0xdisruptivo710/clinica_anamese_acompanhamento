import { NextRequest } from 'next/server';
import { getAuthenticatedUser, getClinicId, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

// GET /api/v1/clients/[id]/sessions — todas as sessoes do cliente com procedimentos
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      session_procedures(*),
      session_photos(id)
    `)
    .eq('client_id', params.id)
    .order('session_date', { ascending: false });

  if (error) return errorResponse(error.message, 500);

  return successResponse({
    sessions: (data ?? []).map((s) => ({
      ...s,
      procedureCount: s.session_procedures?.length ?? 0,
      photoCount: s.session_photos?.length ?? 0,
      procedures: s.session_procedures ?? [],
    })),
  });
}

// POST /api/v1/clients/[id]/sessions — criar sessao para este cliente
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const clinicId = await getClinicId();
  if (!clinicId) return errorResponse('Clinica nao configurada', 403);

  const body = await request.json();
  const supabase = getSupabaseAdminClient();

  // Buscar professional_id do user
  const { data: prof } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!prof) return errorResponse('Profissional nao encontrado', 403);

  // Criar sessao
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      clinic_id: clinicId,
      client_id: params.id,
      professional_id: prof.id,
      session_date: body.sessionDate || new Date().toISOString(),
      status: body.status || 'scheduled',
      pre_session_notes: body.preSessionNotes || null,
      post_session_notes: body.postSessionNotes || null,
      professional_notes: body.professionalNotes || null,
      client_complaint: body.clientComplaint || null,
      total_value: body.totalValue || null,
      follow_up_date: body.followUpDate || null,
      duration_minutes: body.durationMinutes || null,
    })
    .select('*')
    .single();

  if (error) return errorResponse(`Erro ao criar sessao: ${error.message}`, 500);

  // Se tem procedimentos, insere
  if (body.procedures?.length > 0) {
    const procedures = body.procedures.map((p: Record<string, unknown>) => ({
      session_id: session.id,
      category: p.category,
      procedure_name: p.procedureName,
      treatment_areas: p.treatmentAreas || [],
      technical_details: p.technicalDetails || {},
      side: p.side || null,
    }));

    await supabase.from('session_procedures').insert(procedures);
  }

  return successResponse(session, 201);
}
