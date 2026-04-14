import { Trial } from '../types';

interface Props {
  trials: Trial[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TrialCards({ trials, selectedId, onSelect }: Props) {
  if (trials.length === 0) return <div className="empty">No trials found.</div>;

  return (
    <div className="trial-grid">
      {trials.map((t) => (
        <div
          key={t.id}
          className={`trial-card ${selectedId === t.id ? 'selected' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          <div className="trial-name">{t.name}</div>
          <div className="trial-meta">
            {t.sponsor} · {t.sites} sites · {t.targetEnrollment} patients target
          </div>
          <div className="trial-tags">
            <span className="tag phase">Phase {t.phase}</span>
            <span className={`tag ${t.status}`}>{t.status}</span>
            {t.gdprCompliant && <span className="tag gdpr">GDPR ✓</span>}
            <span className="tag">{t.dataRetentionYears}yr retention</span>
          </div>
        </div>
      ))}
    </div>
  );
}
