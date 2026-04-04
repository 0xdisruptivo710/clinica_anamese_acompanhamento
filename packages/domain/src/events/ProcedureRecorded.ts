import { DomainEvent } from './DomainEvent';

export class ProcedureRecorded implements DomainEvent {
  readonly eventName = 'ProcedureRecorded';
  readonly occurredAt: Date;

  constructor(
    public readonly payload: {
      procedureId: string;
      sessionId: string;
      category: string;
      treatmentAreas: string[];
    },
  ) {
    this.occurredAt = new Date();
  }
}
