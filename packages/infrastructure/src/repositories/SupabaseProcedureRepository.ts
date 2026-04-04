import { SupabaseClient } from '@supabase/supabase-js';
import { Procedure, ProcedureId } from '@aesthetic-track/domain';
import type { IProcedureRepository, ProcedureCategory, TreatmentAreaType } from '@aesthetic-track/domain';

export class SupabaseProcedureRepository implements IProcedureRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Procedure | null> {
    const { data, error } = await this.supabase
      .from('session_procedures')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findBySessionId(sessionId: string): Promise<Procedure[]> {
    const { data, error } = await this.supabase
      .from('session_procedures')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByClientId(clientId: string): Promise<Procedure[]> {
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('id')
      .eq('client_id', clientId);

    if (!sessions || sessions.length === 0) return [];

    const sessionIds = sessions.map((s: { id: string }) => s.id);
    const { data, error } = await this.supabase
      .from('session_procedures')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at');

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async findByCategory(clinicId: string, category: ProcedureCategory): Promise<Procedure[]> {
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('id')
      .eq('clinic_id', clinicId);

    if (!sessions || sessions.length === 0) return [];

    const sessionIds = sessions.map((s: { id: string }) => s.id);
    const { data, error } = await this.supabase
      .from('session_procedures')
      .select('*')
      .in('session_id', sessionIds)
      .eq('category', category);

    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => this.toDomain(row));
  }

  async save(procedure: Procedure): Promise<void> {
    const { error } = await this.supabase
      .from('session_procedures')
      .insert(this.toPersistence(procedure));

    if (error) throw new Error(`Failed to save procedure: ${error.message}`);
  }

  async update(procedure: Procedure): Promise<void> {
    const { error } = await this.supabase
      .from('session_procedures')
      .update(this.toPersistence(procedure))
      .eq('id', procedure.id.value);

    if (error) throw new Error(`Failed to update procedure: ${error.message}`);
  }

  async delete(procedureId: string): Promise<void> {
    const { error } = await this.supabase
      .from('session_procedures')
      .delete()
      .eq('id', procedureId);

    if (error) throw new Error(`Failed to delete procedure: ${error.message}`);
  }

  private toDomain(row: Record<string, unknown>): Procedure {
    return Procedure.reconstitute({
      id: ProcedureId.from(row.id as string),
      sessionId: row.session_id as string,
      category: row.category as ProcedureCategory,
      procedureName: row.procedure_name as string,
      treatmentAreas: ((row.treatment_areas as string[]) ?? []) as TreatmentAreaType[],
      side: (row.side as string) ?? undefined,
      technicalDetails: (row.technical_details as Record<string, unknown>) ?? {},
      productId: (row.product_id as string) ?? undefined,
      quantityUsed: row.quantity_used ? Number(row.quantity_used) : undefined,
      immediateResult: (row.immediate_result as string) ?? undefined,
      complications: (row.complications as string[]) ?? [],
      createdAt: new Date(row.created_at as string),
    });
  }

  private toPersistence(procedure: Procedure): Record<string, unknown> {
    return {
      id: procedure.id.value,
      session_id: procedure.sessionId,
      category: procedure.category,
      procedure_name: procedure.procedureName,
      treatment_areas: procedure.treatmentAreas,
      side: procedure.side,
      technical_details: procedure.technicalDetails,
      product_id: procedure.productId,
      quantity_used: procedure.quantityUsed,
      immediate_result: procedure.immediateResult,
      complications: procedure.complications,
    };
  }
}
