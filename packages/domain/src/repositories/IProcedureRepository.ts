import { Procedure } from '../entities/Procedure';
import { ProcedureCategory } from '../value-objects/ProcedureType';

export interface IProcedureRepository {
  findById(id: string): Promise<Procedure | null>;
  findBySessionId(sessionId: string): Promise<Procedure[]>;
  findByClientId(clientId: string): Promise<Procedure[]>;
  findByCategory(clinicId: string, category: ProcedureCategory): Promise<Procedure[]>;
  save(procedure: Procedure): Promise<void>;
  update(procedure: Procedure): Promise<void>;
  delete(procedureId: string): Promise<void>;
}
