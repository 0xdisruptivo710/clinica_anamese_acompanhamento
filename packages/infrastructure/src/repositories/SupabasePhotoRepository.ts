import { SupabaseClient } from '@supabase/supabase-js';
import { Photo, PhotoId } from '@aesthetic-track/domain';
import type { IPhotoRepository, PaginationOptions, PhotoType, PhotoAngle } from '@aesthetic-track/domain';

export class SupabasePhotoRepository implements IPhotoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Photo | null> {
    const { data, error } = await this.supabase
      .from('session_photos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findBySessionId(sessionId: string): Promise<Photo[]> {
    const { data, error } = await this.supabase
      .from('session_photos')
      .select('*')
      .eq('session_id', sessionId)
      .order('taken_at');

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<Photo[]> {
    let query = this.supabase
      .from('session_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: false });

    if (options) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findFeaturedByClientId(clientId: string): Promise<Photo[]> {
    const { data, error } = await this.supabase
      .from('session_photos')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_featured', true)
      .order('taken_at');

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async save(photo: Photo): Promise<void> {
    const { error } = await this.supabase
      .from('session_photos')
      .insert(this.toPersistence(photo));

    if (error) throw new Error(`Failed to save photo: ${error.message}`);
  }

  async update(photo: Photo): Promise<void> {
    const { error } = await this.supabase
      .from('session_photos')
      .update(this.toPersistence(photo))
      .eq('id', photo.id.value);

    if (error) throw new Error(`Failed to update photo: ${error.message}`);
  }

  async delete(photoId: string): Promise<void> {
    const { error } = await this.supabase
      .from('session_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw new Error(`Failed to delete photo: ${error.message}`);
  }

  private toDomain(row: Record<string, unknown>): Photo {
    return Photo.reconstitute({
      id: PhotoId.from(row.id as string),
      sessionId: row.session_id as string,
      clientId: row.client_id as string,
      storagePath: row.storage_path as string,
      url: row.url as string,
      thumbnailUrl: (row.thumbnail_url as string) ?? undefined,
      photoType: row.photo_type as PhotoType,
      angle: (row.angle as PhotoAngle) ?? undefined,
      treatmentArea: (row.treatment_area as string) ?? undefined,
      takenAt: new Date(row.taken_at as string),
      widthPx: (row.width_px as number) ?? undefined,
      heightPx: (row.height_px as number) ?? undefined,
      fileSizeBytes: (row.file_size_bytes as number) ?? undefined,
      aiAnalysis: (row.ai_analysis as Record<string, unknown>) ?? undefined,
      aiAnalyzedAt: row.ai_analyzed_at ? new Date(row.ai_analyzed_at as string) : undefined,
      caption: (row.caption as string) ?? undefined,
      isFeatured: row.is_featured as boolean,
      isConsentOk: row.is_consent_ok as boolean,
      createdBy: (row.created_by as string) ?? undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }

  private toPersistence(photo: Photo): Record<string, unknown> {
    return {
      id: photo.id.value,
      session_id: photo.sessionId,
      client_id: photo.clientId,
      storage_path: photo.storagePath,
      url: photo.url,
      thumbnail_url: photo.thumbnailUrl,
      photo_type: photo.photoType,
      angle: photo.angle,
      treatment_area: photo.treatmentArea,
      taken_at: photo.takenAt.toISOString(),
      width_px: photo.widthPx,
      height_px: photo.heightPx,
      file_size_bytes: photo.fileSizeBytes,
      ai_analysis: photo.aiAnalysis,
      ai_analyzed_at: photo.aiAnalyzedAt?.toISOString(),
      caption: photo.caption,
      is_featured: photo.isFeatured,
      is_consent_ok: photo.isConsentOk,
      created_by: photo.createdBy,
    };
  }
}
