import { UniqueId } from './UniqueId';

export class SessionId extends UniqueId {
  private constructor(value: string) {
    super(value);
  }

  static generate(): SessionId {
    return new SessionId(UniqueId.generateUUID());
  }

  static from(value: string): SessionId {
    return new SessionId(value);
  }
}
