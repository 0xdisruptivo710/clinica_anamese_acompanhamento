import { NotFoundError } from '@aesthetic-track/domain';
import type { ISessionRepository } from '@aesthetic-track/domain';

export class StartSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session', sessionId);

    session.start();
    await this.sessionRepository.update(session);
  }
}
