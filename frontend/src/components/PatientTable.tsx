import { Patient } from '../types';

interface Props { patients: Patient[]; loading: boolean; }

export default function PatientTable({ patients, loading }: Props) {
  if (loading) return <div className="centered"><div className="spinner" /></div>;
  if (patients.length === 0) return <div className="empty">No patients found for this filter.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Condition</th>
            <th>Consent</th>
            <th>Data Quality</th>
            <th>Completeness</th>
            <th>Carbon (kg)</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                {p.id.slice(0, 8)}...
              </td>
              <td>{p.age}</td>
              <td>{p.gender}</td>
              <td>
                <span title={p.conditionLabel} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {p.conditionCode}
                </span>
                <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.conditionLabel}
                </div>
              </td>
              <td><span className={`badge ${p.consentStatus}`}>{p.consentStatus}</span></td>
              <td><span className={`badge ${p.dataQuality}`}>{p.dataQuality}</span></td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 4, background: '#1f2937', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${p.completenessScore}%`, height: '100%', borderRadius: 2,
                      background: p.completenessScore >= 85 ? '#22c55e' : p.completenessScore >= 60 ? '#eab308' : '#ef4444',
                    }} />
                  </div>
                  <span style={{ fontSize: 12 }}>{p.completenessScore}%</span>
                </div>
              </td>
              <td style={{ color: p.carbonFootprintKg && p.carbonFootprintKg > 50 ? '#eab308' : '#22c55e' }}>
                {p.carbonFootprintKg?.toFixed(1) ?? '—'}
              </td>
              <td style={{ color: '#94a3b8', fontSize: 12 }}>{p.enrolledAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
