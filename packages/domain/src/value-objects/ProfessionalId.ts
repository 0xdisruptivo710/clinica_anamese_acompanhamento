import { UniqueId } from './UniqueId';

export class ProfessionalId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): ProfessionalId {
    return new ProfessionalId(UniqueId.generateUUID());
  }

  static from(value: string): ProfessionalId {
    return new ProfessionalId(value);
  }
}
