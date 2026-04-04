import { ValidationError } from '../errors/ValidationError';

export class SessionDate {
  private constructor(private readonly _value: Date) {}

  static create(date: Date): SessionDate {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new ValidationError('Invalid session date', 'sessionDate');
    }
    return new SessionDate(date);
  }

  static fromString(dateStr: string): SessionDate {
    const date = new Date(dateStr);
    return SessionDate.create(date);
  }

  static now(): SessionDate {
    return new SessionDate(new Date());
  }

  get value(): Date {
    return new Date(this._value);
  }

  isBefore(other: SessionDate): boolean {
    return this._value < other._value;
  }

  isAfter(other: SessionDate): boolean {
    return this._value > other._value;
  }

  daysBetween(other: SessionDate): number {
    const diff = Math.abs(this._value.getTime() - other._value.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
