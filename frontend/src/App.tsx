import { useEffect, useState, useCallback } from 'react';
import { Trial, Patient, DataQualityReport, AuditEntry } from './types';
import TrialCards from './components/TrialCards';
import QualityPanel from './components/QualityPanel';
import PatientTable from './components/PatientTable';
import AuditLog from './components/AuditLog';

const BASE = import.meta.env.VITE_API_URL ?? 'https://rwd-clinical-platform-api-549365bb5f89.herokuapp.com';

// Demo API keys (match seed data)
const ADMIN_KEY      = 'rwd-admin-key';
const RESEARCHER_KEY = 'rwd-researcher-key';

type Tab = 'overview' | 'patients' | 'audit';

export default function App() {
  const [trials, setTrials]         = useState<Trial[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<string | null>(null);
  const [report, setReport]         = useState<DataQualityReport | null>(null);
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [tab, setTab]               = useState<Tab>('overview');
  const [qualityFilter, setQualityFilter] = useState('');
  const [loading, setLoading]       = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Fetch trials on mount
  useEffect(() => {
    fetch(`${BASE}/api/trials`, { headers: { Authorization: `Bearer ${RESEARCHER_KEY}` } })
      .then((r) => r.json())
      .then((data: Trial[]) => { setTrials(data); if (data.length > 0) setSelectedTrial(data[0].id); })
      .finally(() => setLoading(false));
  }, []);

  // Fetch quality report + patients when trial changes
  const fetchTrialData = useCallback(async (trialId: string) => {
    setPatientsLoading(true);
    const [rep, pats] = await Promise.all([
      fetch(`${BASE}/api/trials/${trialId}/quality`, { headers: { Authorization: `Bearer ${RESEARCHER_KEY}` } }).then((r) => r.json()),
      fetch(`${BASE}/api/patients?trialId=${trialId}${qualityFilter ? `&quality=${qualityFilter}` : ''}`, { headers: { Authorization: `Bearer ${RESEARCHER_KEY}` } }).then((r) => r.json()),
    ]);
    setReport(rep);
    setPatients(Array.isArray(pats) ? pats : []);
    setPatientsLoading(false);
  }, [qualityFilter]);

  useEffect(() => {
    if (selectedTrial) fetchTrialData(selectedTrial);
  }, [selectedTrial, fetchTrialData]);

  // Fetch audit log when tab opens (admin key needed)
  useEffect(() => {
    if (tab !== 'audit') return;
    fetch(`${BASE}/api/audit`, { headers: { Authorization: `Bearer ${ADMIN_KEY}` } })
      .then((r) => r.json())
      .then((data) => setAuditEntries(Array.isArray(data) ? data : []));
  }, [tab]);

  const selectedTrialObj = trials.find((t) => t.id === selectedTrial);

  if (loading) {
    return <div className="centered"><div className="spinner" /><span>Loading clinical data...</span></div>;
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div>
          <h1>RWD Clinical Platform</h1>
          <div className="subtitle">
            Real-world data pipeline for clinical trials · GDPR Article 89 compliant
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="gdpr-badge">GDPR ✓</span>
          <span className="gdpr-badge" style={{ background: '#052e16', color: '#22c55e', borderColor: '#166534' }}>
            Audit logged
          </span>
        </div>
      </div>

      {/* Stat row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="label">Active Trials</div>
          <div className="value blue">{trials.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Patients</div>
          <div className="value">{report?.totalPatients ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Completeness</div>
          <div className="value blue">{report?.averageCompleteness ?? '—'}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Consent Granted</div>
          <div className="value green">{report?.consentGranted ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">CO₂ Saved (remote)</div>
          <div className="value green">{report?.carbonSavedByRemoteKg ?? '—'} kg</div>
        </div>
      </div>

      {/* Trial selector */}
      <div className="card-title" style={{ marginBottom: 12 }}>Select Trial</div>
      <TrialCards trials={trials} selectedId={selectedTrial} onSelect={setSelectedTrial} />

      {/* Tabs */}
      {selectedTrialObj && (
        <>
          <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
            Viewing: <strong style={{ color: 'var(--text)' }}>{selectedTrialObj.name}</strong>
          </div>
          <div className="tabs">
            {(['overview', 'patients', 'audit'] as Tab[]).map((t) => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'audit' && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--muted)' }}>(admin)</span>}
              </button>
            ))}
          </div>

          {tab === 'overview' && report && <QualityPanel report={report} />}

          {tab === 'patients' && (
            <div className="card">
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  Patients ({patients.length})
                </div>
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}
                >
                  <option value="">All quality levels</option>
                  <option value="complete">Complete only</option>
                  <option value="partial">Partial only</option>
                  <option value="missing">Missing only</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Data minimised — PII never stored · IDs anonymised
                </span>
              </div>
              <PatientTable patients={patients} loading={patientsLoading} />
            </div>
          )}

          {tab === 'audit' && (
            <div className="card">
              <div className="card-title">Audit Trail — All Data Access Events</div>
              <AuditLog entries={auditEntries} loading={false} />
            </div>
          )}
        </>
      )}

      <div className="footer">
        FHIR R4-inspired data model · GDPR Art. 89 (scientific research) ·
        All patient data is synthetic — no real PII ·
        Built with TypeScript + React
      </div>
    </div>
  );
}
