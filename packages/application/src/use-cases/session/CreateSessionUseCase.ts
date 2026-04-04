import { Session, NotFoundError, DomainError } from '@aesthetic-track/domain';
import type { ISessionRepository, IClientRepository } from '@aesthetic-track/domain';
import type { IEventBus } from '../../ports/IEventBus';
import type { CreateSessionDTO } from '../../dtos/CreateSessionDTO';

export interface CreateSessionOutput {
  sessionId: string;
  sessionNumber: number;
}

export class CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CreateSessionDTO): Promise<CreateSessionOutput> {
    const existing = await this.sessionRepository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return { sessionId: existing.id.value, sessionNumber: existing.sessionNumber };
    }

    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Client', input.clientId);
    if (!client.isActive) throw new DomainError('Cannot create session for inactive client');

    const session = Session.create({
      clinicId: input.clinicId,
      clientId: input.clientId,
      professionalId: input.professionalId,
      sessionDate: new Date(input.sessionDate),
      idempotencyKey: input.idempotencyKey,
      preSessionNotes: input.preSessionNotes,
      clientComplaint: input.clientComplaint,
    });

    await this.sessionRepository.save(session);
    await this.eventBus.publish(session.domainEvents);
    session.clearDomainEvents();

    return { sessionId: session.id.value, sessionNumber: session.sessionNumber };
  }
}
