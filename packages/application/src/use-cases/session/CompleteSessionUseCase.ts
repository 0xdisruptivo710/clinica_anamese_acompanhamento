import { NotFoundError } from '@aesthetic-track/domain';
import type { ISessionRepository } from '@aesthetic-track/domain';
import type { IEventBus } from '../../ports/IEventBus';

export interface CompleteSessionInput {
  sessionId: string;
  postSessionNotes?: string;
  professionalNotes?: string;
  followUpDate?: string;
  durationMinutes?: number;
  totalValue?: number;
}

export class CompleteSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CompleteSessionInput): Promise<void> {
    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) throw new NotFoundError('Session', input.sessionId);

    session.complete({
      postSessionNotes: input.postSessionNotes,
      professionalNotes: input.professionalNotes,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
      durationMinutes: input.durationMinutes,
      totalValue: input.totalValue,
    });

    await this.sessionRepository.update(session);
    await this.eventBus.publish(session.domainEvents);
    session.clearDomainEvents();
  }
}
