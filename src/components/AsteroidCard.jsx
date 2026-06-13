import { RISK_META } from '../utils/risk';
import { timeLabel } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

export default function AsteroidCard({ asteroid, onSelect }) {
  const now = useLiveTime(60000);
  const meta = RISK_META[asteroid.riskLevel];

  return (
    <button
      onClick={() => onSelect(asteroid)}
      className="group flex items-center justify-between gap-4 rounded-xl border border-edge bg-panel/40 hover:bg-panel/70 hover:border-edge/80 transition-colors px-4 py-3 sm:px-5 sm:py-4 text-left w-full"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ background: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-display text-base sm:text-lg text-ink truncate">{asteroid.name}</p>
          <p className="font-mono text-xs text-dim mt-0.5 truncate">
            {asteroid.sizeRef.label} &middot; {asteroid.missDistanceLD.toFixed(1)} LD &middot;{' '}
            {timeLabel(asteroid.approachEpoch, now)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className="font-mono text-xs px-2 py-1 rounded-full border hidden sm:inline-block"
          style={{ color: meta.color, borderColor: `${meta.color}60` }}
        >
          {meta.label}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full sm:hidden"
          style={{ background: meta.color }}
          aria-hidden="true"
        />
        <span className="text-dim group-hover:text-ink transition-colors text-lg" aria-hidden="true">
          &rarr;
        </span>
      </div>
    </button>
  );
}
