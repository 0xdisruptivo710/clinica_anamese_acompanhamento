import { Photo } from '../entities/Photo';
import { PaginationOptions } from './IClientRepository';

export interface IPhotoRepository {
  findById(id: string): Promise<Photo | null>;
  findBySessionId(sessionId: string): Promise<Photo[]>;
  findByClientId(clientId: string, options?: PaginationOptions): Promise<Photo[]>;
  findFeaturedByClientId(clientId: string): Promise<Photo[]>;
  save(photo: Photo): Promise<void>;
  update(photo: Photo): Promise<void>;
  delete(photoId: string): Promise<void>;
}
