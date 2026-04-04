export interface UploadResult {
  storagePath: string;
  url: string;
  thumbnailUrl?: string;
}

export interface IStorageService {
  upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<UploadResult>;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
}
