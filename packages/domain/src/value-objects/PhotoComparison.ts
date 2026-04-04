import { PhotoId } from './PhotoId';
import { ValidationError } from '../errors/ValidationError';

export class PhotoComparison {
  private constructor(
    private readonly _beforePhotoId: PhotoId,
    private readonly _afterPhotoId: PhotoId,
    private readonly _title?: string,
    private readonly _notes?: string,
  ) {}

  static create(props: {
    beforePhotoId: PhotoId;
    afterPhotoId: PhotoId;
    title?: string;
    notes?: string;
  }): PhotoComparison {
    if (props.beforePhotoId.equals(props.afterPhotoId)) {
      throw new ValidationError('Before and after photos must be different');
    }
    return new PhotoComparison(
      props.beforePhotoId,
      props.afterPhotoId,
      props.title,
      props.notes,
    );
  }

  get beforePhotoId(): PhotoId { return this._beforePhotoId; }
  get afterPhotoId(): PhotoId { return this._afterPhotoId; }
  get title(): string | undefined { return this._title; }
  get notes(): string | undefined { return this._notes; }
}
