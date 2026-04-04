export interface UploadPhotoDTO {
  sessionId: string;
  clientId: string;
  file: Buffer;
  contentType: string;
  fileName: string;
  photoType: 'before' | 'after' | 'during' | 'progress' | 'reference';
  angle?:
    | 'frontal'
    | 'left_profile'
    | 'right_profile'
    | 'left_three_quarters'
    | 'right_three_quarters'
    | 'superior'
    | 'inferior';
  treatmentArea?: string;
  caption?: string;
  isConsentOk: boolean;
  createdBy?: string;
}
