import { Photo } from '@aesthetic-track/domain';
import type { IPhotoRepository } from '@aesthetic-track/domain';

export class ListSessionPhotosUseCase {
  constructor(private readonly photoRepository: IPhotoRepository) {}

  async execute(sessionId: string): Promise<Photo[]> {
    return this.photoRepository.findBySessionId(sessionId);
  }
}
