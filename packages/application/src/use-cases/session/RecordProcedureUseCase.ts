import { Procedure, NotFoundError } from '@aesthetic-track/domain';
import type {
  ISessionRepository,
  IProcedureRepository,
  ProcedureCategory,
  TreatmentAreaType,
} from '@aesthetic-track/domain';
import type { IEventBus } from '../../ports/IEventBus';
import type { RecordProcedureDTO } from '../../dtos/RecordProcedureDTO';

export interface RecordProcedureOutput {
  procedureId: string;
}

export class RecordProcedureUseCase {
  constructor(
    private readonly procedureRepository: IProcedureRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: RecordProcedureDTO): Promise<RecordProcedureOutput> {
    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) throw new NotFoundError('Session', input.sessionId);

    const procedure = Procedure.create({
      sessionId: input.sessionId,
      category: input.category as ProcedureCategory,
      procedureName: input.procedureName,
      treatmentAreas: input.treatmentAreas as TreatmentAreaType[],
      side: input.side,
      technicalDetails: input.technicalDetails ?? {},
      productId: input.productId,
      quantityUsed: input.quantityUsed,
      immediateResult: input.immediateResult,
      complications: input.complications ?? [],
    });

    await this.procedureRepository.save(procedure);

    await this.eventBus.publish([
      {
        eventName: 'ProcedureRecorded',
        occurredAt: new Date(),
        payload: {
          procedureId: procedure.id.value,
          sessionId: input.sessionId,
          category: input.category,
          treatmentAreas: input.treatmentAreas,
        },
      },
    ]);

    return { procedureId: procedure.id.value };
  }
}
