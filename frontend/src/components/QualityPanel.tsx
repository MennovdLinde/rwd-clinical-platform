import { DataQualityReport } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props { report: DataQualityReport; }

const tooltipStyle = {
  backgroundColor: '#111827', border: '1px solid #374151',
  borderRadius: 8, color: '#f1f5f9', fontSize: 12,
};

export default function QualityPanel({ report }: Props) {
  const pieData = [
    { name: 'Complete', value: report.completeRecords, color: '#22c55e' },
    { name: 'Partial',  value: report.partialRecords,  color: '#eab308' },
    { name: 'Missing',  value: report.missingRecords,  color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const consentData = [
    { name: 'Granted',   value: report.consentGranted,                                       color: '#22c55e' },
    { name: 'Withdrawn', value: report.consentWithdrawn,                                      color: '#ef4444' },
    { name: 'Pending',   value: report.totalPatients - report.consentGranted - report.consentWithdrawn, color: '#eab308' },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* Carbon highlight */}
      <div className="carbon-highlight">
        <div>
          <div className="big">{report.carbonSavedByRemoteKg} kg</div>
          <div>CO₂ avoided via remote visits</div>
        </div>
        <div style={{ fontSize: 13, color: '#bbf7d0' }}>
          {report.remoteVisitPercent}% of visits done remotely ·{' '}
          {report.totalCarbonKg} kg total patient travel emissions
        </div>
      </div>

      <div className="quality-grid">
        {/* Data completeness bars */}
        <div className="card">
          <div className="card-title">Data Completeness</div>
          <div className="bar-wrap">
            <div className="bar-label">
              <span>Overall completeness</span>
              <span>{report.averageCompleteness}%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill blue" style={{ width: `${report.averageCompleteness}%` }} />
            </div>
          </div>
          <div className="bar-wrap">
            <div className="bar-label">
              <span>Complete records</span>
              <span>{report.completeRecords} / {report.totalPatients}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill complete" style={{ width: `${(report.completeRecords / report.totalPatients) * 100}%` }} />
            </div>
          </div>
          <div className="bar-wrap">
            <div className="bar-label">
              <span>Partial records</span>
              <span>{report.partialRecords}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill partial" style={{ width: `${(report.partialRecords / report.totalPatients) * 100}%` }} />
            </div>
          </div>
          <div className="bar-wrap">
            <div className="bar-label">
              <span>Missing records</span>
              <span>{report.missingRecords}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill missing" style={{ width: `${(report.missingRecords / report.totalPatients) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Quality pie */}
        <div className="card">
          <div className="card-title">Record Quality Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Consent */}
        <div className="card">
          <div className="card-title">Consent Status (GDPR)</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={consentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {consentData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Remote visits */}
        <div className="card">
          <div className="card-title">Remote Visit Adoption</div>
          <div style={{ paddingTop: 8 }}>
            <div className="bar-wrap">
              <div className="bar-label">
                <span>Remote visits</span>
                <span>{report.remoteVisitPercent}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill green" style={{ width: `${report.remoteVisitPercent}%` }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, lineHeight: 1.8 }}>
              <div>Total patient travel CO₂: <strong style={{ color: '#f1f5f9' }}>{report.totalCarbonKg} kg</strong></div>
              <div>Saved by remote visits: <strong style={{ color: '#22c55e' }}>{report.carbonSavedByRemoteKg} kg</strong></div>
              <div>Consent granted: <strong style={{ color: '#22c55e' }}>{report.consentGranted} patients</strong></div>
              <div>Consent withdrawn: <strong style={{ color: '#ef4444' }}>{report.consentWithdrawn} patients</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
