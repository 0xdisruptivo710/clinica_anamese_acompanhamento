import { SupabaseClient } from '@supabase/supabase-js';
import type { IStorageService, UploadResult } from '@aesthetic-track/application';

export class SupabaseStorageService implements IStorageService {
  constructor(private readonly supabase: SupabaseClient) {}

  async upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<UploadResult> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: false });

    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      storagePath: data.path,
      url: urlData.publicUrl,
    };
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw new Error(`Failed to get signed URL: ${error.message}`);
    return data.signedUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw new Error(`Failed to delete file: ${error.message}`);
  }
}
