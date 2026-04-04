import { randomUUID } from 'crypto';

export abstract class UniqueId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim() === '') {
      throw new Error('ID cannot be empty');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: UniqueId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  protected static generateUUID(): string {
    return randomUUID();
  }
}
