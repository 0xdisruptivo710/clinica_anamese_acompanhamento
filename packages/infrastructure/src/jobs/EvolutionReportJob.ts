import type { IClientRepository, ISessionRepository, IPhotoRepository, IProcedureRepository } from '@aesthetic-track/domain';
import type { EvolutionReportDTO } from '@aesthetic-track/application';

export interface EvolutionReportPayload {
  clientId: string;
}

export class EvolutionReportJob {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly photoRepository: IPhotoRepository,
    private readonly procedureRepository: IProcedureRepository,
  ) {}

  async execute(payload: EvolutionReportPayload): Promise<EvolutionReportDTO | null> {
    const client = await this.clientRepository.findById(payload.clientId);
    if (!client) return null;

    const [sessions, photos, procedures] = await Promise.all([
      this.sessionRepository.findByClientId(payload.clientId),
      this.photoRepository.findByClientId(payload.clientId),
      this.procedureRepository.findByClientId(payload.clientId),
    ]);

    const completedSessions = sessions.filter((s) => s.status === 'completed');
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
      sessions: sessions.map((session) => {
        const sessionProcs = procedures.filter((p) => p.sessionId === session.id.value);
        const sessionPhotos = photos.filter((p) => p.sessionId === session.id.value);
        return {
          sessionId: session.id.value,
          sessionNumber: session.sessionNumber,
          sessionDate: session.sessionDate.toISOString(),
          status: session.status,
          procedures: sessionProcs.map((p) => p.procedureName),
          photoCount: sessionPhotos.length,
        };
      }),
    };
  }
}
