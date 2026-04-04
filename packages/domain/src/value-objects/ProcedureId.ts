import { UniqueId } from './UniqueId';

export class ProcedureId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): ProcedureId {
    return new ProcedureId(UniqueId.generateUUID());
  }

  static from(value: string): ProcedureId {
    return new ProcedureId(value);
  }
}
