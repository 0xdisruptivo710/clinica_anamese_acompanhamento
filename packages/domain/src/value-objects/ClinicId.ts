import { UniqueId } from './UniqueId';

export class ClinicId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): ClinicId {
    return new ClinicId(UniqueId.generateUUID());
  }

  static from(value: string): ClinicId {
    return new ClinicId(value);
  }
}
