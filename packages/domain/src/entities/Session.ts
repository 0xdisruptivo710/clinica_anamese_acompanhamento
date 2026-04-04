import { Entity } from './Entity';
import { SessionId } from '../value-objects/SessionId';
import { DomainError } from '../errors/DomainError';
import { ValidationError } from '../errors/ValidationError';

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface SessionProps {
  id: SessionId;
  clinicId: string;
  clientId: string;
  professionalId: string;
  sessionNumber: number;
  sessionDate: Date;
  status: SessionStatus;
  durationMinutes?: number;
  totalValue?: number;
  preSessionNotes?: string;
  clientComplaint?: string;
  painScore?: number;
  postSessionNotes?: string;
  professionalNotes?: string;
  followUpDate?: Date;
  consentSigned: boolean;
  consentSignedAt?: Date;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Session extends Entity<SessionId> {
  private props: SessionProps;

  private constructor(props: SessionProps) {
    super(props.id);
    this.props = props;
  }

  static create(props: {
    clinicId: string;
    clientId: string;
    professionalId: string;
    sessionDate: Date;
    idempotencyKey?: string;
    preSessionNotes?: string;
    clientComplaint?: string;
  }): Session {
    const session = new Session({
      ...props,
      id: SessionId.generate(),
      sessionNumber: 0, // set by database trigger
      status: 'scheduled',
      consentSigned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    session._domainEvents.push({
      eventName: 'SessionCreated',
      occurredAt: new Date(),
      payload: {
        sessionId: session.props.id.value,
        clinicId: session.props.clinicId,
        clientId: session.props.clientId,
        professionalId: session.props.professionalId,
      },
    });

    return session;
  }

  static reconstitute(props: SessionProps): Session {
    return new Session(props);
  }

  start(): void {
    if (this.props.status !== 'scheduled') {
      throw new DomainError(`Cannot start session with status: ${this.props.status}`);
    }
    this.props.status = 'in_progress';
    this.props.updatedAt = new Date();
  }

  complete(data: {
    postSessionNotes?: string;
    professionalNotes?: string;
    followUpDate?: Date;
    durationMinutes?: number;
    totalValue?: number;
  }): void {
    if (this.props.status !== 'in_progress') {
      throw new DomainError(`Cannot complete session with status: ${this.props.status}`);
    }
    this.props.status = 'completed';
    this.props.postSessionNotes = data.postSessionNotes;
    this.props.professionalNotes = data.professionalNotes;
    this.props.followUpDate = data.followUpDate;
    this.props.durationMinutes = data.durationMinutes;
    this.props.totalValue = data.totalValue;
    this.props.updatedAt = new Date();

    this._domainEvents.push({
      eventName: 'SessionClosed',
      occurredAt: new Date(),
      payload: {
        sessionId: this.props.id.value,
        clinicId: this.props.clinicId,
        clientId: this.props.clientId,
        professionalId: this.props.professionalId,
        followUpDate: this.props.followUpDate?.toISOString(),
      },
    });
  }

  cancel(): void {
    if (this.props.status === 'completed') {
      throw new DomainError('Cannot cancel a completed session');
    }
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  markNoShow(): void {
    if (this.props.status !== 'scheduled') {
      throw new DomainError('Can only mark no-show for scheduled sessions');
    }
    this.props.status = 'no_show';
    this.props.updatedAt = new Date();
  }

  signConsent(): void {
    this.props.consentSigned = true;
    this.props.consentSignedAt = new Date();
    this.props.updatedAt = new Date();
  }

  setPainScore(score: number): void {
    if (score < 0 || score > 10) {
      throw new ValidationError('Pain score must be between 0 and 10', 'painScore');
    }
    this.props.painScore = score;
    this.props.updatedAt = new Date();
  }

  get clinicId(): string { return this.props.clinicId; }
  get clientId(): string { return this.props.clientId; }
  get professionalId(): string { return this.props.professionalId; }
  get sessionNumber(): number { return this.props.sessionNumber; }
  get sessionDate(): Date { return this.props.sessionDate; }
  get status(): SessionStatus { return this.props.status; }
  get durationMinutes(): number | undefined { return this.props.durationMinutes; }
  get totalValue(): number | undefined { return this.props.totalValue; }
  get preSessionNotes(): string | undefined { return this.props.preSessionNotes; }
  get clientComplaint(): string | undefined { return this.props.clientComplaint; }
  get painScore(): number | undefined { return this.props.painScore; }
  get postSessionNotes(): string | undefined { return this.props.postSessionNotes; }
  get professionalNotes(): string | undefined { return this.props.professionalNotes; }
  get followUpDate(): Date | undefined { return this.props.followUpDate; }
  get consentSigned(): boolean { return this.props.consentSigned; }
  get consentSignedAt(): Date | undefined { return this.props.consentSignedAt; }
  get idempotencyKey(): string | undefined { return this.props.idempotencyKey; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
