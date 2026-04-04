import { Client } from '@aesthetic-track/domain';
import type { IClientRepository } from '@aesthetic-track/domain';

export interface ListClientsInput {
  clinicId: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ListClientsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(input: ListClientsInput): Promise<{ clients: Client[]; total: number }> {
    const options = { limit: input.limit ?? 20, offset: input.offset ?? 0 };

    if (input.search?.trim()) {
      const clients = await this.clientRepository.search(input.clinicId, input.search, options);
      return { clients, total: clients.length };
    }

    const [clients, total] = await Promise.all([
      this.clientRepository.findByClinicId(input.clinicId, options),
      this.clientRepository.countByClinicId(input.clinicId),
    ]);

    return { clients, total };
  }
}
