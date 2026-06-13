import { RISK_META } from '../utils/risk';
import { timeLabel } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

export default function AsteroidCard({ asteroid, onSelect }) {
  const now = useLiveTime(60000);
  const meta = RISK_META[asteroid.riskLevel];

  const panelClass = 
    asteroid.riskLevel === 'hazardous' ? 'arcade-panel-hazardous hover:shadow-[0_0_15px_#FF0055]' :
    asteroid.riskLevel === 'watch' ? 'arcade-panel-watch hover:shadow-[0_0_15px_#FF8800]' :
    asteroid.riskLevel === 'notable' ? 'arcade-panel-notable hover:shadow-[0_0_15px_#FFD700]' :
    'arcade-panel hover:shadow-[0_0_15px_#00F0FF]';

  return (
    <button
      onClick={() => onSelect(asteroid)}
      className={`group flex items-center justify-between gap-4 transition-all duration-100 px-4 py-3 sm:px-5 sm:py-4 text-left w-full hover:scale-[1.01] active:scale-[0.99] ${panelClass}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span
          className="shrink-0 w-3 h-3 border"
          style={{ 
            background: `${meta.color}30`, 
            borderColor: meta.color, 
            boxShadow: `0 0 6px ${meta.color}` 
          }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-arcade text-base sm:text-lg text-ink font-bold tracking-wide truncate uppercase">{asteroid.name}</p>
          <p className="font-mono text-sm text-dim mt-0.5 truncate">
            SIZE COMP: {asteroid.sizeRef.label.toUpperCase()} &middot; RANGE: {asteroid.missDistanceLD.toFixed(1)} LD &middot;{' '}
            {timeLabel(asteroid.approachEpoch, now).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 select-none">
        <span
          className="font-display text-[9px] px-2 py-0.5 border hidden sm:inline-block"
          style={{ 
            color: meta.color, 
            borderColor: `${meta.color}80`, 
            boxShadow: `0 0 5px ${meta.color}` 
          }}
        >
          {meta.label.toUpperCase()}
        </span>
        <span
          className="w-3 h-3 border sm:hidden"
          style={{ 
            background: `${meta.color}30`, 
            borderColor: meta.color, 
            boxShadow: `0 0 6px ${meta.color}` 
          }}
          aria-hidden="true"
        />
        <span className="text-cyan-400 group-hover:text-signal transition-colors font-display text-[10px] tracking-wide" aria-hidden="true">
          [SELECT]
        </span>
      </div>
    </button>
  );
}
