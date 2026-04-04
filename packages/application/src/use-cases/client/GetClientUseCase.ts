import { Client, NotFoundError } from '@aesthetic-track/domain';
import type { IClientRepository } from '@aesthetic-track/domain';

export class GetClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(clientId: string): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new NotFoundError('Client', clientId);
    return client;
  }
}
