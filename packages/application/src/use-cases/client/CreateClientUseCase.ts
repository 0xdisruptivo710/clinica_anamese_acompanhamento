import { Client } from '@aesthetic-track/domain';
import type { IClientRepository } from '@aesthetic-track/domain';
import type { IEventBus } from '../../ports/IEventBus';
import type { CreateClientDTO } from '../../dtos/CreateClientDTO';

export interface CreateClientOutput {
  clientId: string;
}

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CreateClientDTO): Promise<CreateClientOutput> {
    if (input.cpf) {
      const existing = await this.clientRepository.findByCpf(input.cpf, input.clinicId);
      if (existing) throw new Error('Client with this CPF already exists');
    }

    const client = Client.create({
      clinicId: input.clinicId,
      fullName: input.fullName,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      cpf: input.cpf,
      whatsapp: input.whatsapp,
      email: input.email,
      address: input.address,
      skinType: input.skinType,
      fitzpatrick: input.fitzpatrick,
      allergies: input.allergies ?? [],
      medications: input.medications ?? [],
      medicalConditions: input.medicalConditions ?? [],
      previousProcedures: input.previousProcedures ?? [],
      aestheticGoals: input.aestheticGoals,
      preferredChannel: input.preferredChannel ?? 'whatsapp',
      communicationOptIn: input.communicationOptIn ?? true,
      notes: input.notes,
      tags: input.tags ?? [],
      createdBy: input.createdBy,
    });

    await this.clientRepository.save(client);
    await this.eventBus.publish(client.domainEvents);
    client.clearDomainEvents();

    return { clientId: client.id.value };
  }
}
