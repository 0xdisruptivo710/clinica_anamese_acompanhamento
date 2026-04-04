import { SupabaseClient } from '@supabase/supabase-js';
import { Client, ClientId } from '@aesthetic-track/domain';
import type { IClientRepository, PaginationOptions } from '@aesthetic-track/domain';

export class SupabaseClientRepository implements IClientRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClinicId(clinicId: string, options?: PaginationOptions): Promise<Client[]> {
    let query = this.supabase
      .from('clients')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('full_name');

    if (options) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByCpf(cpf: string, clinicId: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('cpf', cpf)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByPhone(phone: string, clinicId: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async search(clinicId: string, query: string, options?: PaginationOptions): Promise<Client[]> {
    const { data, error } = await this.supabase.rpc('search_clients', {
      p_clinic_id: clinicId,
      p_query: query,
      p_limit: options?.limit ?? 20,
      p_offset: options?.offset ?? 0,
    });

    if (error || !data) return [];

    const ids = data.map((row: { id: string }) => row.id);
    if (ids.length === 0) return [];

    const { data: clients } = await this.supabase
      .from('clients')
      .select('*')
      .in('id', ids);

    return (clients ?? []).map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async save(client: Client): Promise<void> {
    const { error } = await this.supabase
      .from('clients')
      .insert(this.toPersistence(client));

    if (error) throw new Error(`Failed to save client: ${error.message}`);
  }

  async update(client: Client): Promise<void> {
    const { error } = await this.supabase
      .from('clients')
      .update(this.toPersistence(client))
      .eq('id', client.id.value);

    if (error) throw new Error(`Failed to update client: ${error.message}`);
  }

  async delete(clientId: string): Promise<void> {
    const { error } = await this.supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', clientId);

    if (error) throw new Error(`Failed to delete client: ${error.message}`);
  }

  async countByClinicId(clinicId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (error) return 0;
    return count ?? 0;
  }

  private toDomain(row: Record<string, unknown>): Client {
    return Client.reconstitute({
      id: ClientId.from(row.id as string),
      clinicId: row.clinic_id as string,
      fullName: row.full_name as string,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth as string) : undefined,
      cpf: (row.cpf as string) ?? undefined,
      phone: row.phone as string,
      whatsapp: (row.whatsapp as string) ?? undefined,
      email: (row.email as string) ?? undefined,
      address: (row.address as Record<string, unknown>) ?? undefined,
      skinType: (row.skin_type as 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive') ?? undefined,
      fitzpatrick: (row.fitzpatrick as 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI') ?? undefined,
      allergies: (row.allergies as string[]) ?? [],
      medications: (row.medications as string[]) ?? [],
      medicalConditions: (row.medical_conditions as string[]) ?? [],
      previousProcedures: (row.previous_procedures as string[]) ?? [],
      aestheticGoals: (row.aesthetic_goals as string) ?? undefined,
      preferredChannel: (row.preferred_channel as 'whatsapp' | 'email' | 'sms') ?? 'whatsapp',
      communicationOptIn: (row.communication_opt_in as boolean) ?? true,
      profilePhotoUrl: (row.profile_photo_url as string) ?? undefined,
      notes: (row.notes as string) ?? undefined,
      tags: (row.tags as string[]) ?? [],
      isActive: row.is_active as boolean,
      createdBy: (row.created_by as string) ?? undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }

  private toPersistence(client: Client): Record<string, unknown> {
    return {
      id: client.id.value,
      clinic_id: client.clinicId,
      full_name: client.fullName,
      date_of_birth: client.dateOfBirth?.toISOString().split('T')[0],
      cpf: client.cpf,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      address: client.address,
      skin_type: client.skinType,
      fitzpatrick: client.fitzpatrick,
      allergies: client.allergies,
      medications: client.medications,
      medical_conditions: client.medicalConditions,
      previous_procedures: client.previousProcedures,
      aesthetic_goals: client.aestheticGoals,
      preferred_channel: client.preferredChannel,
      communication_opt_in: client.communicationOptIn,
      profile_photo_url: client.profilePhotoUrl,
      notes: client.notes,
      tags: client.tags,
      is_active: client.isActive,
      created_by: client.createdBy,
    };
  }
}
