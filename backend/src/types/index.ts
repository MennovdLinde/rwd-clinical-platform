// FHIR-inspired patient data model (anonymized, mock data only)
// Based on HL7 FHIR R4 spec — simplified for MVP

export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type DataQuality = 'complete' | 'partial' | 'missing';
export type Role = 'admin' | 'researcher' | 'clinician' | 'auditor';
export type ConsentStatus = 'granted' | 'withdrawn' | 'pending';

export interface Patient {
  id: string;                    // anonymized UUID — never real name
  trialId: string;
  age: number;                   // age bucket, not exact DOB
  gender: Gender;
  conditionCode: string;         // ICD-10 code e.g. "C34.1" (lung cancer)
  conditionLabel: string;        // human-readable
  enrolledAt: string;            // ISO date
  consentStatus: ConsentStatus;
  dataQuality: DataQuality;
  completenessScore: number;     // 0–100
  visits: Visit[];
  carbonFootprintKg?: number;    // estimated travel CO2 for this patient
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: 'baseline' | 'follow-up' | 'final' | 'remote';
  outcomeRecorded: boolean;
  notes?: string;                // never PII, clinical observation only
  travelKm?: number;             // distance to site
}

export interface Trial {
  id: string;
  name: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  indication: string;            // disease area
  sponsor: string;
  startDate: string;
  endDate?: string;
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  targetEnrollment: number;
  sites: number;                 // number of clinical sites
  gdprCompliant: boolean;
  dataRetentionYears: number;
}

export interface Researcher {
  id: string;
  name: string;
  role: Role;
  institution: string;
  apiKey: string;                // for request auth
  accessLevel: 'read' | 'write' | 'admin';
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  researcherId: string;
  researcherName: string;
  action: string;                // e.g. "READ_PATIENT", "EXPORT_DATA"
  resource: string;              // e.g. "patient:abc-123"
  trialId?: string;
  ipAddress: string;
  success: boolean;
  gdprBasis?: string;            // legal basis e.g. "legitimate interest"
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
  remoteVisitPercent: number;    // % visits done remotely (lower travel = less CO2)
  totalCarbonKg: number;         // estimated CO2 from patient travel
  carbonSavedByRemoteKg: number; // CO2 avoided by remote visits
}
