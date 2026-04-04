import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

// GET /api/v1/clients/[id]/photos — listar todas as fotos do cliente
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = params;
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('session_photos')
    .select('*, sessions(session_number, session_date, status)')
    .eq('client_id', id)
    .order('taken_at', { ascending: false });

  if (error) return errorResponse(error.message, 500);

  return successResponse({ photos: data ?? [] });
}

// POST /api/v1/clients/[id]/photos — upload direto de foto para o cliente
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id: clientId } = params;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const photoType = (formData.get('photoType') as string) || 'progress';
  const angle = formData.get('angle') as string | null;
  const sessionId = formData.get('sessionId') as string | null;
  const caption = formData.get('caption') as string | null;

  if (!file) return errorResponse('Arquivo obrigatorio', 400);

  const supabase = getSupabaseAdminClient();

  // Upload para Supabase Storage
  const fileName = `${clientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('aesthetic-photos')
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    // Se o bucket nao existe, tenta criar
    if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
      await supabase.storage.createBucket('aesthetic-photos', { public: true });
      const { data: retry, error: retryErr } = await supabase.storage
        .from('aesthetic-photos')
        .upload(fileName, buffer, { contentType: file.type, upsert: false });
      if (retryErr) return errorResponse(`Erro no upload: ${retryErr.message}`, 500);
      if (!retry) return errorResponse('Upload falhou', 500);
    } else {
      return errorResponse(`Erro no upload: ${uploadError.message}`, 500);
    }
  }

  const { data: urlData } = supabase.storage.from('aesthetic-photos').getPublicUrl(fileName);

  // Salvar registro no banco
  const { data: photo, error: dbError } = await supabase
    .from('session_photos')
    .insert({
      client_id: clientId,
      session_id: sessionId || null,
      storage_path: fileName,
      url: urlData.publicUrl,
      photo_type: photoType,
      angle: angle || null,
      caption: caption || null,
      is_consent_ok: true,
      taken_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (dbError) return errorResponse(`Erro ao salvar: ${dbError.message}`, 500);

  return successResponse(photo, 201);
}
