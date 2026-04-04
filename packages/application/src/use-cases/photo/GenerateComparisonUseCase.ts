import { PhotoComparison, PhotoId, NotFoundError } from '@aesthetic-track/domain';
import type { IPhotoRepository } from '@aesthetic-track/domain';

export interface GenerateComparisonInput {
  clientId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title?: string;
  notes?: string;
}

export class GenerateComparisonUseCase {
  constructor(private readonly photoRepository: IPhotoRepository) {}

  async execute(input: GenerateComparisonInput): Promise<PhotoComparison> {
    const beforePhoto = await this.photoRepository.findById(input.beforePhotoId);
    if (!beforePhoto) throw new NotFoundError('Photo', input.beforePhotoId);

    const afterPhoto = await this.photoRepository.findById(input.afterPhotoId);
    if (!afterPhoto) throw new NotFoundError('Photo', input.afterPhotoId);

    return PhotoComparison.create({
      beforePhotoId: PhotoId.from(input.beforePhotoId),
      afterPhotoId: PhotoId.from(input.afterPhotoId),
      title: input.title,
      notes: input.notes,
    });
  }
}
