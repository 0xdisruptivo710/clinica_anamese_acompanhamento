export interface EvolutionReportDTO {
  clientId: string;
  clientName: string;
  totalSessions: number;
  totalProcedures: number;
  totalPhotos: number;
  firstSessionDate?: string;
  lastSessionDate?: string;
  procedureTypes: string[];
  totalInvested?: number;
  sessions: SessionSummaryDTO[];
}

export interface SessionSummaryDTO {
  sessionId: string;
  sessionNumber: number;
  sessionDate: string;
  status: string;
  procedures: string[];
  photoCount: number;
}
