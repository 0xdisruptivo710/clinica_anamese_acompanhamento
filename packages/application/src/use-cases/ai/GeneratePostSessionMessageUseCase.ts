import { NotFoundError } from '@aesthetic-track/domain';
import type { ISessionRepository, IClientRepository, IProcedureRepository } from '@aesthetic-track/domain';
import type { IAIService, PostSessionAIOutput } from '../../ports/IAIService';

export interface GeneratePostSessionMessageInput {
  sessionId: string;
  professionalName: string;
}

export class GeneratePostSessionMessageUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly procedureRepository: IProcedureRepository,
    private readonly aiService: IAIService,
  ) {}

  async execute(input: GeneratePostSessionMessageInput): Promise<PostSessionAIOutput> {
    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) throw new NotFoundError('Session', input.sessionId);

    const client = await this.clientRepository.findById(session.clientId);
    if (!client) throw new NotFoundError('Client', session.clientId);

    const procedures = await this.procedureRepository.findBySessionId(input.sessionId);

    const allClientSessions = await this.sessionRepository.findByClientId(session.clientId);
    const previousProcedures: string[] = [];
    for (const s of allClientSessions) {
      if (s.id.value !== input.sessionId) {
        const procs = await this.procedureRepository.findBySessionId(s.id.value);
        previousProcedures.push(...procs.map((p) => p.procedureName));
      }
    }

    let clientAge: number | undefined;
    if (client.dateOfBirth) {
      const ageDiff = Date.now() - client.dateOfBirth.getTime();
      clientAge = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    }

    return this.aiService.generatePostSessionMessage({
      clientName: client.fullName,
      clientAge,
      sessionNumber: session.sessionNumber,
      sessionDate: session.sessionDate.toISOString(),
      proceduresList: procedures.map((p) => p.procedureName),
      treatmentAreas: procedures.flatMap((p) => p.treatmentAreas),
      professionalName: input.professionalName,
      totalPreviousSessions: allClientSessions.filter((s) => s.status === 'completed').length,
      previousProcedures: [...new Set(previousProcedures)],
      aestheticGoal: client.aestheticGoals,
      followUpDate: session.followUpDate?.toISOString(),
    });
  }
}
