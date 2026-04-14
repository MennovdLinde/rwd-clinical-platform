// Realistic mock data — anonymized FHIR-style patients across 2 trials
// All data is synthetic. No real patient information.

import { v4 as uuid } from 'uuid';
import { Patient, Trial, Researcher, Visit } from '../types';
import { patients, trials, researchers } from './store';

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const TRIALS: Trial[] = [
  {
    id: 'trial-001',
    name: 'ALPINE-1: Lung Cancer Biomarker Study',
    phase: 'III',
    indication: 'Non-small cell lung cancer (NSCLC)',
    sponsor: 'Novartis AG',
    startDate: isoDate(365),
    status: 'active',
    targetEnrollment: 120,
    sites: 8,
    gdprCompliant: true,
    dataRetentionYears: 15,
  },
  {
    id: 'trial-002',
    name: 'BASEL-RWD: Cardiovascular Risk Profiling',
    phase: 'II',
    indication: 'Cardiovascular disease prevention',
    sponsor: 'Roche Diagnostics',
    startDate: isoDate(180),
    status: 'recruiting',
    targetEnrollment: 80,
    sites: 5,
    gdprCompliant: true,
    dataRetentionYears: 10,
  },
];

function makeVisits(patientId: string, count: number): Visit[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    patientId,
    visitDate: isoDate(randomBetween(10, 300 - i * 30)),
    visitType: i === 0 ? 'baseline' : i === count - 1 ? 'final' : Math.random() > 0.3 ? 'follow-up' : 'remote',
    outcomeRecorded: Math.random() > 0.15,
    travelKm: Math.random() > 0.3 ? randomBetween(5, 120) : 0,
  }));
}

function makePatient(trialId: string, index: number): Patient {
  const id = uuid();
  const visitCount = randomBetween(2, 6);
  const visits = makeVisits(id, visitCount);
  const completeness = randomBetween(55, 100);
  const travelKg = visits.reduce((sum, v) => sum + (v.travelKm ?? 0) * 0.21, 0); // 0.21 kg CO2/km by car

  const conditions = trialId === 'trial-001'
    ? [{ code: 'C34.1', label: 'Malignant neoplasm of upper lobe, bronchus or lung' }]
    : [
        { code: 'I25.1', label: 'Atherosclerotic heart disease of native coronary artery' },
        { code: 'I10', label: 'Essential (primary) hypertension' },
        { code: 'E11', label: 'Type 2 diabetes mellitus' },
      ];
  const condition = conditions[index % conditions.length];

  return {
    id,
    trialId,
    age: randomBetween(3, 8) * 10,   // age buckets: 30, 40, 50 ... 80
    gender: (['male', 'female', 'other'] as const)[index % 3],
    conditionCode: condition.code,
    conditionLabel: condition.label,
    enrolledAt: isoDate(randomBetween(30, 300)),
    consentStatus: Math.random() > 0.05 ? 'granted' : Math.random() > 0.5 ? 'withdrawn' : 'pending',
    dataQuality: completeness >= 85 ? 'complete' : completeness >= 60 ? 'partial' : 'missing',
    completenessScore: completeness,
    visits,
    carbonFootprintKg: Math.round(travelKg * 10) / 10,
  };
}

export function seedData(): void {
  // Trials
  TRIALS.forEach((t) => trials.set(t.id, t));

  // Patients: 45 for trial-001, 28 for trial-002
  for (let i = 0; i < 45; i++) patients.set(uuid(), makePatient('trial-001', i));
  for (let i = 0; i < 28; i++) patients.set(uuid(), makePatient('trial-002', i));

  // Researchers
  const researcherList: Researcher[] = [
    {
      id: uuid(),
      name: 'Dr. Sarah Müller',
      role: 'admin',
      institution: 'University Hospital Basel',
      apiKey: 'rwd-admin-key',
      accessLevel: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Dr. Jan van Berg',
      role: 'researcher',
      institution: 'Novartis AG',
      apiKey: 'rwd-researcher-key',
      accessLevel: 'read',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      name: 'Prof. Elena Kovic',
      role: 'clinician',
      institution: 'Roche Diagnostics Basel',
      apiKey: 'rwd-clinician-key',
      accessLevel: 'write',
      createdAt: new Date().toISOString(),
    },
  ];
  researcherList.forEach((r) => researchers.set(r.apiKey, r));

  console.log(
    `[seed] ${trials.size} trials, ${patients.size} patients, ${researchers.size} researchers loaded`
  );
}
