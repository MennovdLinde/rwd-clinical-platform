import { patients } from '../db/store';
import { DataQualityReport, Patient } from '../types';

export function generateQualityReport(trialId: string): DataQualityReport {
  const trialPatients = [...patients.values()].filter((p) => p.trialId === trialId);

  const total = trialPatients.length;
  if (total === 0) {
    return {
      trialId, totalPatients: 0, completeRecords: 0, partialRecords: 0,
      missingRecords: 0, averageCompleteness: 0, consentGranted: 0,
      consentWithdrawn: 0, remoteVisitPercent: 0, totalCarbonKg: 0,
      carbonSavedByRemoteKg: 0,
    };
  }

  const complete = trialPatients.filter((p) => p.dataQuality === 'complete').length;
  const partial  = trialPatients.filter((p) => p.dataQuality === 'partial').length;
  const missing  = trialPatients.filter((p) => p.dataQuality === 'missing').length;
  const avgCompleteness = Math.round(
    trialPatients.reduce((s, p) => s + p.completenessScore, 0) / total
  );

  const consentGranted   = trialPatients.filter((p) => p.consentStatus === 'granted').length;
  const consentWithdrawn = trialPatients.filter((p) => p.consentStatus === 'withdrawn').length;

  // Carbon metrics
  const allVisits = trialPatients.flatMap((p) => p.visits);
  const totalVisits = allVisits.length;
  const remoteVisits = allVisits.filter((v) => v.visitType === 'remote').length;
  const remoteVisitPercent = totalVisits > 0
    ? Math.round((remoteVisits / totalVisits) * 100) : 0;

  const totalCarbonKg = Math.round(
    trialPatients.reduce((s, p) => s + (p.carbonFootprintKg ?? 0), 0) * 10
  ) / 10;

  // Estimate: each remote visit saves ~25km round trip = ~5.25kg CO2
  const carbonSavedByRemoteKg = Math.round(remoteVisits * 5.25 * 10) / 10;

  return {
    trialId, totalPatients: total, completeRecords: complete,
    partialRecords: partial, missingRecords: missing,
    averageCompleteness: avgCompleteness, consentGranted, consentWithdrawn,
    remoteVisitPercent, totalCarbonKg, carbonSavedByRemoteKg,
  };
}

export function getAllTrialsReport(): DataQualityReport[] {
  const trialIds = [...new Set([...patients.values()].map((p) => p.trialId))];
  return trialIds.map(generateQualityReport);
}
