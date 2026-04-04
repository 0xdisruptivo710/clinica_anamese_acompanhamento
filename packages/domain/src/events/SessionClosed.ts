import { DomainEvent } from './DomainEvent';

export class SessionClosed implements DomainEvent {
  readonly eventName = 'SessionClosed';
  readonly occurredAt: Date;

  constructor(
    public readonly payload: {
      sessionId: string;
      clinicId: string;
      clientId: string;
      professionalId: string;
      followUpDate?: string;
    },
  ) {
    this.occurredAt = new Date();
  }
}
