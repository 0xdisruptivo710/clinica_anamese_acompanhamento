import type { IClientRepository } from '@aesthetic-track/domain';
import { NotFoundError } from '@aesthetic-track/domain';
import type { UpdateClientDTO } from '../../dtos/UpdateClientDTO';

export class UpdateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(input: UpdateClientDTO): Promise<void> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) throw new NotFoundError('Client', input.clientId);

    if (input.phone || input.whatsapp || input.email) {
      client.updateContactInfo({
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
      });
    }

    if (input.skinType || input.fitzpatrick || input.allergies || input.medications || input.medicalConditions) {
      client.updateAnamnesis({
        skinType: input.skinType,
        fitzpatrick: input.fitzpatrick,
        allergies: input.allergies,
        medications: input.medications,
        medicalConditions: input.medicalConditions,
      });
    }

    if (input.aestheticGoals) {
      client.updateAestheticGoals(input.aestheticGoals);
    }

    if (input.preferredChannel || input.communicationOptIn !== undefined) {
      client.setCommunicationPreferences(
        input.preferredChannel ?? client.preferredChannel,
        input.communicationOptIn ?? client.communicationOptIn,
      );
    }

    await this.clientRepository.update(client);
  }
}
