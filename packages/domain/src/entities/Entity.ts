import { UniqueId } from '../value-objects/UniqueId';

export interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

export abstract class Entity<T extends UniqueId> {
  protected readonly _domainEvents: DomainEvent[] = [];

  constructor(protected readonly _id: T) {}

  get id(): T {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  equals(other: Entity<T>): boolean {
    return this._id.equals(other._id);
  }
}
