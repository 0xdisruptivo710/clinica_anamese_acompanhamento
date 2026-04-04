import { DomainEvent } from './DomainEvent';

export class SessionCreated implements DomainEvent {
  readonly eventName = 'SessionCreated';
  readonly occurredAt: Date;

  constructor(
    public readonly payload: {
      sessionId: string;
      clinicId: string;
      clientId: string;
      professionalId: string;
    },
  ) {
    this.occurredAt = new Date();
  }
}
