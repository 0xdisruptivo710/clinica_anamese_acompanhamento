export interface CreateClientDTO {
  clinicId: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  cpf?: string;
  whatsapp?: string;
  email?: string;
  address?: Record<string, unknown>;
  skinType?: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
  fitzpatrick?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  previousProcedures?: string[];
  aestheticGoals?: string;
  preferredChannel?: 'whatsapp' | 'email' | 'sms';
  communicationOptIn?: boolean;
  notes?: string;
  tags?: string[];
  createdBy?: string;
}
