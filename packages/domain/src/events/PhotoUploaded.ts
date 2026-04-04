import { DomainEvent } from './DomainEvent';

export class PhotoUploaded implements DomainEvent {
  readonly eventName = 'PhotoUploaded';
  readonly occurredAt: Date;

  constructor(
    public readonly payload: {
      photoId: string;
      sessionId: string;
      clientId: string;
      photoType: string;
    },
  ) {
    this.occurredAt = new Date();
  }
}
