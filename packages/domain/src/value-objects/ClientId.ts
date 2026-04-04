import { UniqueId } from './UniqueId';

export class ClientId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): ClientId {
    return new ClientId(UniqueId.generateUUID());
  }

  static from(value: string): ClientId {
    return new ClientId(value);
  }
}
