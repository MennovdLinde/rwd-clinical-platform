import { AuditEntry } from '../types';

interface Props { entries: AuditEntry[]; loading: boolean; }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AuditLog({ entries, loading }: Props) {
  if (loading) return <div className="centered"><div className="spinner" /></div>;
  if (entries.length === 0) return <div className="empty">No audit entries yet.</div>;

  return (
    <div className="audit-list">
      {entries.map((e) => (
        <div key={e.id} className="audit-item">
          <div className="audit-time">{timeAgo(e.timestamp)}</div>
          <div>
            <div className="audit-action">{e.action}</div>
            <div className="audit-who">{e.researcherName} · {e.resource}</div>
            {e.gdprBasis && <div className="audit-gdpr">Legal basis: {e.gdprBasis}</div>}
          </div>
          <div style={{ fontSize: 11, color: e.success ? '#22c55e' : '#ef4444' }}>
            {e.success ? '✓' : '✗'}
          </div>
        </div>
      ))}
    </div>
  );
}
