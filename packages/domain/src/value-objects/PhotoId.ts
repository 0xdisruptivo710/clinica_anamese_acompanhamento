import { UniqueId } from './UniqueId';

export class PhotoId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): PhotoId {
    return new PhotoId(UniqueId.generateUUID());
  }

  static from(value: string): PhotoId {
    return new PhotoId(value);
  }
}
