export type Language = 'ne' | 'en';

export interface GovernmentTask {
  id: string;
  code: string;
  titleNepali: string;
  titleEnglish: string;
  departmentNepali: string;
  departmentEnglish: string;
  requiredDocumentType: 'NAGARIKTA' | 'LALPURJA' | 'PASSPORT' | 'DRIVING_LICENSE' | 'BIRTH_CERTIFICATE';
  requiredDocumentNameNepali: string;
  requiredDocumentNameEnglish: string;
  officialFeeNpr: number;
  standardSlaMinutes: number; // e.g. 30, 45, 60, 120
  deskNameNepali: string;
  deskNameEnglish: string;
  stepsNepali: string[];
  stepsEnglish: string[];
  docAcquisitionLocations?: {
    locationNepali: string;
    locationEnglish: string;
    requiredProcessNepali: string;
    requiredProcessEnglish: string;
  }[];
}

export interface OCRDetectResult {
  isNagarikta: boolean;
  detectedDocumentType: 'NAGARIKTA' | 'LALPURJA' | 'PASSPORT' | 'DRIVING_LICENSE' | 'BIRTH_CERTIFICATE' | 'NON_GOVERNMENT_DOC' | 'UNKNOWN';
  documentTitleNepali: string;
  documentTitleEnglish: string;
  confidence: number;
  extractedFields: {
    fullNameNepali?: string;
    fullNameEnglish?: string;
    docNumber?: string;
    dobBs?: string;
    dobAd?: string;
    district?: string;
    municipalityWard?: string;
    fatherName?: string;
  };
  isValidForSelectedTask: boolean;
  validationMessageNepali: string;
  validationMessageEnglish: string;
  nextStepRecommendationNepali: string;
  nextStepRecommendationEnglish: string;
  errorDiagnosisNepali?: string;
  errorDiagnosisEnglish?: string;
  correctiveStepsNepali?: string[];
  correctiveStepsEnglish?: string[];
}

export interface QueueRequest {
  id: string;
  tokenNumber: string;
  citizenName: string;
  taskId: string;
  taskTitleNepali: string;
  taskTitleEnglish: string;
  departmentNepali: string;
  departmentEnglish: string;
  deskNameNepali: string;
  deskNameEnglish: string;
  submittedAt: string; // ISO string
  slaMinutes: number;
  elapsedMinutes: number;
  isDelayed: boolean;
  delayedByMinutes: number;
  status: 'PENDING_FIRST' | 'IN_PROCESSING' | 'COMPLETED';
  isNextToHandle: boolean;
  queuePosition: number;
  documentSummary: {
    isNagarikta: boolean;
    documentType: string;
    docNumber: string;
    verified: boolean;
  };
  escalationNoticeSent: boolean;
  escalationEmail?: {
    recipient: string;
    sentAt: string;
    subject: string;
    authority: string;
    content: string;
  };
}

export interface EscalationEmailLog {
  id: string;
  requestId: string;
  tokenNumber: string;
  citizenName: string;
  taskTitle: string;
  recipientEmail: string;
  subject: string;
  sentAt: string;
  delayedMinutes: number;
  slaMinutes: number;
  status: 'DISPATCHED_TO_UPPER_AUTHORITY';
  emailBody: string;
}
