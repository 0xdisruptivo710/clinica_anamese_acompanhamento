import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import { getSupabaseAdminClient } from '@aesthetic-track/infrastructure';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) return errorResponse('Cliente nao encontrado', 404);

  return successResponse(data);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('clients')
    .update(body)
    .eq('id', params.id);

  if (error) return errorResponse(`Erro ao atualizar: ${error.message}`, 400);

  return successResponse({ success: true });
}
