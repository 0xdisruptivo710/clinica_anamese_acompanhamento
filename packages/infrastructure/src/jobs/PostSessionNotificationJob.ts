import type { IAIService, IMessageService } from '@aesthetic-track/application';
import type { ISessionRepository, IClientRepository, IProcedureRepository } from '@aesthetic-track/domain';

export interface PostSessionNotificationPayload {
  sessionId: string;
  professionalName: string;
}

export class PostSessionNotificationJob {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly procedureRepository: IProcedureRepository,
    private readonly aiService: IAIService,
    private readonly messageService: IMessageService,
  ) {}

  async execute(payload: PostSessionNotificationPayload): Promise<void> {
    const session = await this.sessionRepository.findById(payload.sessionId);
    if (!session) return;

    const client = await this.clientRepository.findById(session.clientId);
    if (!client) return;
    if (!client.communicationOptIn) return;

    const procedures = await this.procedureRepository.findBySessionId(payload.sessionId);
    const allSessions = await this.sessionRepository.findByClientId(session.clientId);

    let clientAge: number | undefined;
    if (client.dateOfBirth) {
      const ageDiff = Date.now() - client.dateOfBirth.getTime();
      clientAge = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const aiResponse = await this.aiService.generatePostSessionMessage({
      clientName: client.fullName,
      clientAge,
      sessionNumber: session.sessionNumber,
      sessionDate: session.sessionDate.toISOString(),
      proceduresList: procedures.map((p) => p.procedureName),
      treatmentAreas: procedures.flatMap((p) => p.treatmentAreas),
      professionalName: payload.professionalName,
      totalPreviousSessions: allSessions.filter((s) => s.status === 'completed').length,
      previousProcedures: [],
      aestheticGoal: client.aestheticGoals,
      followUpDate: session.followUpDate?.toISOString(),
    });

    const destination =
      client.preferredChannel === 'email' ? client.email : (client.whatsapp ?? client.phone);
    if (!destination) return;

    await this.messageService.send({
      to: destination,
      channel: client.preferredChannel,
      subject: client.preferredChannel === 'email' ? aiResponse.emailSubject : undefined,
      body: client.preferredChannel === 'email' ? aiResponse.emailBody : aiResponse.whatsappMessage,
    });
  }
}
