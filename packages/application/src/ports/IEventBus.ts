export interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

export interface IEventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}
