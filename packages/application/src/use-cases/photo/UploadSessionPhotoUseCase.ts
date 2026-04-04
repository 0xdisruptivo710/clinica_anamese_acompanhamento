import { Photo, NotFoundError, ValidationError } from '@aesthetic-track/domain';
import type { IPhotoRepository, ISessionRepository, PhotoType, PhotoAngle } from '@aesthetic-track/domain';
import type { IStorageService } from '../../ports/IStorageService';
import type { IEventBus } from '../../ports/IEventBus';
import type { UploadPhotoDTO } from '../../dtos/UploadPhotoDTO';

export interface UploadPhotoOutput {
  photoId: string;
  url: string;
}

export class UploadSessionPhotoUseCase {
  constructor(
    private readonly photoRepository: IPhotoRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly storageService: IStorageService,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: UploadPhotoDTO): Promise<UploadPhotoOutput> {
    if (!input.isConsentOk) {
      throw new ValidationError('Cannot upload photo without consent');
    }

    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) throw new NotFoundError('Session', input.sessionId);

    const storagePath = `${input.clientId}/${input.sessionId}/${Date.now()}-${input.fileName}`;
    const uploadResult = await this.storageService.upload(
      'aesthetic-photos',
      storagePath,
      input.file,
      input.contentType,
    );

    const photo = Photo.create({
      sessionId: input.sessionId,
      clientId: input.clientId,
      storagePath: uploadResult.storagePath,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      photoType: input.photoType as PhotoType,
      angle: input.angle as PhotoAngle | undefined,
      treatmentArea: input.treatmentArea,
      caption: input.caption,
      isConsentOk: input.isConsentOk,
      createdBy: input.createdBy,
    });

    await this.photoRepository.save(photo);
    await this.eventBus.publish(photo.domainEvents);
    photo.clearDomainEvents();

    return { photoId: photo.id.value, url: uploadResult.url };
  }
}
