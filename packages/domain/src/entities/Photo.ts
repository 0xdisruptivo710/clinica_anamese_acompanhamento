import { Entity } from './Entity';
import { PhotoId } from '../value-objects/PhotoId';
import { ValidationError } from '../errors/ValidationError';

export type PhotoType = 'before' | 'after' | 'during' | 'progress' | 'reference';
export type PhotoAngle = 'frontal' | 'left_profile' | 'right_profile' | 'left_three_quarters' | 'right_three_quarters' | 'superior' | 'inferior';

export interface PhotoProps {
  id: PhotoId;
  sessionId: string;
  clientId: string;
  storagePath: string;
  url: string;
  thumbnailUrl?: string;
  photoType: PhotoType;
  angle?: PhotoAngle;
  treatmentArea?: string;
  takenAt: Date;
  widthPx?: number;
  heightPx?: number;
  fileSizeBytes?: number;
  aiAnalysis?: Record<string, unknown>;
  aiAnalyzedAt?: Date;
  caption?: string;
  isFeatured: boolean;
  isConsentOk: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Photo extends Entity<PhotoId> {
  private props: PhotoProps;

  private constructor(props: PhotoProps) {
    super(props.id);
    this.props = props;
  }

  static create(props: Omit<PhotoProps, 'id' | 'createdAt' | 'updatedAt' | 'isFeatured' | 'takenAt'>): Photo {
    if (!props.storagePath?.trim()) {
      throw new ValidationError('Storage path is required', 'storagePath');
    }
    if (!props.url?.trim()) {
      throw new ValidationError('Photo URL is required', 'url');
    }
    if (!props.isConsentOk) {
      throw new ValidationError('Photo cannot be saved without consent');
    }

    const photo = new Photo({
      ...props,
      id: PhotoId.generate(),
      isFeatured: false,
      takenAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    photo._domainEvents.push({
      eventName: 'PhotoUploaded',
      occurredAt: new Date(),
      payload: {
        photoId: photo.props.id.value,
        sessionId: photo.props.sessionId,
        clientId: photo.props.clientId,
        photoType: photo.props.photoType,
      },
    });

    return photo;
  }

  static reconstitute(props: PhotoProps): Photo {
    return new Photo(props);
  }

  markAsFeatured(): void {
    this.props.isFeatured = true;
    this.props.updatedAt = new Date();
  }

  unmarkAsFeatured(): void {
    this.props.isFeatured = false;
    this.props.updatedAt = new Date();
  }

  setAiAnalysis(analysis: Record<string, unknown>): void {
    this.props.aiAnalysis = analysis;
    this.props.aiAnalyzedAt = new Date();
    this.props.updatedAt = new Date();
  }

  setCaption(caption: string): void {
    this.props.caption = caption;
    this.props.updatedAt = new Date();
  }

  get sessionId(): string { return this.props.sessionId; }
  get clientId(): string { return this.props.clientId; }
  get storagePath(): string { return this.props.storagePath; }
  get url(): string { return this.props.url; }
  get thumbnailUrl(): string | undefined { return this.props.thumbnailUrl; }
  get photoType(): PhotoType { return this.props.photoType; }
  get angle(): PhotoAngle | undefined { return this.props.angle; }
  get treatmentArea(): string | undefined { return this.props.treatmentArea; }
  get takenAt(): Date { return this.props.takenAt; }
  get widthPx(): number | undefined { return this.props.widthPx; }
  get heightPx(): number | undefined { return this.props.heightPx; }
  get fileSizeBytes(): number | undefined { return this.props.fileSizeBytes; }
  get aiAnalysis(): Record<string, unknown> | undefined { return this.props.aiAnalysis; }
  get aiAnalyzedAt(): Date | undefined { return this.props.aiAnalyzedAt; }
  get caption(): string | undefined { return this.props.caption; }
  get isFeatured(): boolean { return this.props.isFeatured; }
  get isConsentOk(): boolean { return this.props.isConsentOk; }
  get createdBy(): string | undefined { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
