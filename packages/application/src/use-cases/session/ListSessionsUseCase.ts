import { Session } from '@aesthetic-track/domain';
import type { ISessionRepository } from '@aesthetic-track/domain';

export interface ListSessionsInput {
  clinicId?: string;
  clientId?: string;
  professionalId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class ListSessionsUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(input: ListSessionsInput): Promise<Session[]> {
    const options = { limit: input.limit ?? 20, offset: input.offset ?? 0 };

    if (input.clientId) {
      return this.sessionRepository.findByClientId(input.clientId, options);
    }

    if (input.professionalId) {
      return this.sessionRepository.findByProfessionalId(input.professionalId, options);
    }

    if (input.clinicId && input.startDate && input.endDate) {
      return this.sessionRepository.findByDateRange(
        input.clinicId,
        new Date(input.startDate),
        new Date(input.endDate),
      );
    }

    if (input.clinicId) {
      return this.sessionRepository.findByClinicId(input.clinicId, options);
    }

    return [];
  }
}
