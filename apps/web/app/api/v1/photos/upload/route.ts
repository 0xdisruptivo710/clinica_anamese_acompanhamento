import { NextRequest } from 'next/server';
import { getAuthenticatedUser, errorResponse, successResponse } from '@/lib/api-helpers';
import {
  getSupabaseAdminClient,
  SupabasePhotoRepository,
  SupabaseSessionRepository,
  SupabaseStorageService,
  UpstashEventBus,
} from '@aesthetic-track/infrastructure';
import { UploadSessionPhotoUseCase } from '@aesthetic-track/application';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const sessionId = formData.get('sessionId') as string;
  const clientId = formData.get('clientId') as string;
  const photoType = formData.get('photoType') as string;
  const angle = formData.get('angle') as string | null;
  const isConsentOk = formData.get('isConsentOk') === 'true';

  if (!file || !sessionId || !clientId || !photoType) {
    return errorResponse('Missing required fields', 400);
  }

  const supabase = getSupabaseAdminClient();
  const useCase = new UploadSessionPhotoUseCase(
    new SupabasePhotoRepository(supabase),
    new SupabaseSessionRepository(supabase),
    new SupabaseStorageService(supabase),
    new UpstashEventBus(),
  );

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await useCase.execute({
      sessionId,
      clientId,
      file: buffer,
      contentType: file.type,
      fileName: file.name,
      photoType: photoType as 'before' | 'after' | 'during' | 'progress' | 'reference',
      angle: angle as 'frontal' | 'left_profile' | 'right_profile' | undefined,
      isConsentOk,
      createdBy: user.id,
    });
    return successResponse(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload photo';
    return errorResponse(message, 400);
  }
}
