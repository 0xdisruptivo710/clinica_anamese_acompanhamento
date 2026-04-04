export interface RecordProcedureDTO {
  sessionId: string;
  category: string;
  procedureName: string;
  treatmentAreas: string[];
  side?: string;
  technicalDetails?: Record<string, unknown>;
  productId?: string;
  quantityUsed?: number;
  immediateResult?: string;
  complications?: string[];
}
