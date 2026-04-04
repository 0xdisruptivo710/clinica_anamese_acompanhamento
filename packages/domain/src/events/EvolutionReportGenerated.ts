import { DomainEvent } from './DomainEvent';

export class EvolutionReportGenerated implements DomainEvent {
  readonly eventName = 'EvolutionReportGenerated';
  readonly occurredAt: Date;

  constructor(
    public readonly payload: {
      clientId: string;
      reportId: string;
      totalSessions: number;
    },
  ) {
    this.occurredAt = new Date();
  }
}
