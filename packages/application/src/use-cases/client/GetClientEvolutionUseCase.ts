import type {
  IClientRepository,
  ISessionRepository,
  IPhotoRepository,
  IProcedureRepository,
} from '@aesthetic-track/domain';
import { NotFoundError } from '@aesthetic-track/domain';
import type { EvolutionReportDTO } from '../../dtos/EvolutionReportDTO';

export class GetClientEvolutionUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly photoRepository: IPhotoRepository,
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(clientId: string): Promise<EvolutionReportDTO> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new NotFoundError('Client', clientId);

    const [sessions, photos, procedures] = await Promise.all([
      this.sessionRepository.findByClientId(clientId),
      this.photoRepository.findByClientId(clientId),
      this.procedureRepository.findByClientId(clientId),
    ]);

    const completedSessions = sessions.filter((s) => s.status === 'completed');

    const sessionSummaries = sessions.map((session) => {
      const sessionProcedures = procedures.filter((p) => p.sessionId === session.id.value);
      const sessionPhotos = photos.filter((p) => p.sessionId === session.id.value);
      return {
        sessionId: session.id.value,
        sessionNumber: session.sessionNumber,
        sessionDate: session.sessionDate.toISOString(),
        status: session.status,
        procedures: sessionProcedures.map((p) => p.procedureName),
        photoCount: sessionPhotos.length,
      };
    });

    const procedureTypes = [...new Set(procedures.map((p) => p.category))];

    return {
      clientId: client.id.value,
      clientName: client.fullName,
      totalSessions: completedSessions.length,
      totalProcedures: procedures.length,
      totalPhotos: photos.length,
      firstSessionDate: completedSessions[0]?.sessionDate.toISOString(),
      lastSessionDate: completedSessions.at(-1)?.sessionDate.toISOString(),
      procedureTypes,
      totalInvested: completedSessions.reduce((sum, s) => sum + (s.totalValue ?? 0), 0),
      sessions: sessionSummaries,
    };
  }
}
