import { Session } from '../entities/Session';
import { PaginationOptions } from './IClientRepository';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByIdempotencyKey(key: string): Promise<Session | null>;
  findByClientId(clientId: string, options?: PaginationOptions): Promise<Session[]>;
  findByClinicId(clinicId: string, options?: PaginationOptions): Promise<Session[]>;
  findByProfessionalId(professionalId: string, options?: PaginationOptions): Promise<Session[]>;
  findByDateRange(clinicId: string, startDate: Date, endDate: Date): Promise<Session[]>;
  save(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  delete(sessionId: string): Promise<void>;
  countByClientId(clientId: string): Promise<number>;
}
