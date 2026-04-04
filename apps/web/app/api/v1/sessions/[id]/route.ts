import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      clients!inner(id, full_name, phone, whatsapp, email, profile_photo_url, skin_type, fitzpatrick, allergies, medications, medical_conditions, aesthetic_goals, previous_procedures, notes, tags),
      session_procedures(*),
      session_photos(id, url, thumbnail_url, photo_type, angle, caption, taken_at)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return errorResponse('Sessao nao encontrada', 404);

  return successResponse({
    id: data.id,
    clientId: data.client_id,
    professionalId: data.professional_id,
    sessionNumber: data.session_number,
    sessionDate: data.session_date,
    status: data.status,
    durationMinutes: data.duration_minutes,
    totalValue: data.total_value,
    followUpDate: data.follow_up_date,
    clientComplaint: data.client_complaint,
    preSessionNotes: data.pre_session_notes,
    postSessionNotes: data.post_session_notes,
    professionalNotes: data.professional_notes,
    painScore: data.pain_score,
    client: data.clients ? {
      id: data.clients.id,
      fullName: data.clients.full_name,
      phone: data.clients.phone,
      whatsapp: data.clients.whatsapp,
      email: data.clients.email,
      profilePhotoUrl: data.clients.profile_photo_url,
      skinType: data.clients.skin_type,
      fitzpatrick: data.clients.fitzpatrick,
      allergies: data.clients.allergies,
      medications: data.clients.medications,
      medicalConditions: data.clients.medical_conditions,
      aestheticGoals: data.clients.aesthetic_goals,
      previousProcedures: data.clients.previous_procedures,
      notes: data.clients.notes,
      tags: data.clients.tags,
    } : null,
    procedures: (data.session_procedures ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      category: p.category,
      procedureName: p.procedure_name,
      treatmentAreas: p.treatment_areas,
      technicalDetails: p.technical_details,
      side: p.side,
      immediateResult: p.immediate_result,
      complications: p.complications,
    })),
    photos: (data.session_photos ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      url: p.url,
      thumbnailUrl: p.thumbnail_url,
      photoType: p.photo_type,
      angle: p.angle,
      caption: p.caption,
      takenAt: p.taken_at,
    })),
  });
}
