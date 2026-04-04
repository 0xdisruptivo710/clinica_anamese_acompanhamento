import { SupabaseClient } from '@supabase/supabase-js';
import { Session, SessionId } from '@aesthetic-track/domain';
import type { ISessionRepository, PaginationOptions } from '@aesthetic-track/domain';
import type { SessionStatus } from '@aesthetic-track/domain';

export class SupabaseSessionRepository implements ISessionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByIdempotencyKey(key: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('idempotency_key', key)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClientId(clientId: string, options?: PaginationOptions): Promise<Session[]> {
    let query = this.supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: false });

    if (options) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByClinicId(clinicId: string, options?: PaginationOptions): Promise<Session[]> {
    let query = this.supabase
      .from('sessions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('session_date', { ascending: false });

    if (options) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByProfessionalId(professionalId: string, options?: PaginationOptions): Promise<Session[]> {
    let query = this.supabase
      .from('sessions')
      .select('*')
      .eq('professional_id', professionalId)
      .order('session_date', { ascending: false });

    if (options) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByDateRange(clinicId: string, startDate: Date, endDate: Date): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('session_date', startDate.toISOString())
      .lte('session_date', endDate.toISOString())
      .order('session_date', { ascending: false });

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async save(session: Session): Promise<void> {
    const { error } = await this.supabase
      .from('sessions')
      .insert(this.toPersistence(session));

    if (error) throw new Error(`Failed to save session: ${error.message}`);
  }

  async update(session: Session): Promise<void> {
    const { error } = await this.supabase
      .from('sessions')
      .update(this.toPersistence(session))
      .eq('id', session.id.value);

    if (error) throw new Error(`Failed to update session: ${error.message}`);
  }

  async delete(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw new Error(`Failed to delete session: ${error.message}`);
  }

  async countByClientId(clientId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);

    if (error) return 0;
    return count ?? 0;
  }

  private toDomain(row: Record<string, unknown>): Session {
    return Session.reconstitute({
      id: SessionId.from(row.id as string),
      clinicId: row.clinic_id as string,
      clientId: row.client_id as string,
      professionalId: row.professional_id as string,
      sessionNumber: row.session_number as number,
      sessionDate: new Date(row.session_date as string),
      status: row.status as SessionStatus,
      durationMinutes: (row.duration_minutes as number) ?? undefined,
      totalValue: row.total_value ? Number(row.total_value) : undefined,
      preSessionNotes: (row.pre_session_notes as string) ?? undefined,
      clientComplaint: (row.client_complaint as string) ?? undefined,
      painScore: (row.pain_score as number) ?? undefined,
      postSessionNotes: (row.post_session_notes as string) ?? undefined,
      professionalNotes: (row.professional_notes as string) ?? undefined,
      followUpDate: row.follow_up_date ? new Date(row.follow_up_date as string) : undefined,
      consentSigned: row.consent_signed as boolean,
      consentSignedAt: row.consent_signed_at ? new Date(row.consent_signed_at as string) : undefined,
      idempotencyKey: (row.idempotency_key as string) ?? undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }

  private toPersistence(session: Session): Record<string, unknown> {
    return {
      id: session.id.value,
      clinic_id: session.clinicId,
      client_id: session.clientId,
      professional_id: session.professionalId,
      session_date: session.sessionDate.toISOString(),
      status: session.status,
      duration_minutes: session.durationMinutes,
      total_value: session.totalValue,
      pre_session_notes: session.preSessionNotes,
      client_complaint: session.clientComplaint,
      pain_score: session.painScore,
      post_session_notes: session.postSessionNotes,
      professional_notes: session.professionalNotes,
      follow_up_date: session.followUpDate?.toISOString().split('T')[0],
      consent_signed: session.consentSigned,
      consent_signed_at: session.consentSignedAt?.toISOString(),
      idempotency_key: session.idempotencyKey,
    };
  }
}
