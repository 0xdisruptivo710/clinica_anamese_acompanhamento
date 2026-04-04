export interface CreateSessionDTO {
  idempotencyKey: string;
  clinicId: string;
  clientId: string;
  professionalId: string;
  sessionDate: string;
  preSessionNotes?: string;
  clientComplaint?: string;
}
