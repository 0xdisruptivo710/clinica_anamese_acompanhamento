import { Client } from '../entities/Client';

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findByClinicId(clinicId: string, options?: PaginationOptions): Promise<Client[]>;
  findByCpf(cpf: string, clinicId: string): Promise<Client | null>;
  findByPhone(phone: string, clinicId: string): Promise<Client | null>;
  search(clinicId: string, query: string, options?: PaginationOptions): Promise<Client[]>;
  save(client: Client): Promise<void>;
  update(client: Client): Promise<void>;
  delete(clientId: string): Promise<void>;
  countByClinicId(clinicId: string): Promise<number>;
}
