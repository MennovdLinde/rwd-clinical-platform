export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type DataQuality = 'complete' | 'partial' | 'missing';
export type ConsentStatus = 'granted' | 'withdrawn' | 'pending';

export interface Patient {
  id: string;
  trialId: string;
  age: number;
  gender: Gender;
  conditionCode: string;
  conditionLabel: string;
  enrolledAt: string;
  consentStatus: ConsentStatus;
  dataQuality: DataQuality;
  completenessScore: number;
  carbonFootprintKg?: number;
}

export interface Trial {
  id: string;
  name: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  indication: string;
  sponsor: string;
  startDate: string;
  endDate?: string;
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  targetEnrollment: number;
  sites: number;
  gdprCompliant: boolean;
  dataRetentionYears: number;
}

export interface DataQualityReport {
  trialId: string;
  totalPatients: number;
  completeRecords: number;
  partialRecords: number;
  missingRecords: number;
  averageCompleteness: number;
  consentGranted: number;
  consentWithdrawn: number;
  remoteVisitPercent: number;
  totalCarbonKg: number;
  carbonSavedByRemoteKg: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  researcherName: string;
  action: string;
  resource: string;
  trialId?: string;
  ipAddress: string;
  success: boolean;
  gdprBasis?: string;
}
