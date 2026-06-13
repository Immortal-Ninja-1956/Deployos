import { RISK_META } from '../utils/risk';
import { timeLabel } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

const badgeColors = {
  hazardous: 'bg-hazardous/20 border-hazardous text-hazardous shadow-glow-hazardous',
  watch: 'bg-watch/20 border-watch text-watch shadow-glow-watch',
  notable: 'bg-notable/20 border-notable text-notable shadow-glow-notable',
  routine: 'bg-routine/20 border-routine text-routine shadow-glow-routine',
};

const panelGlow = {
  hazardous: 'arcade-panel-hazardous hover:shadow-glow-hazardous-lg',
  watch: 'arcade-panel-watch hover:shadow-glow-watch-lg',
  notable: 'arcade-panel-notable hover:shadow-glow-notable-lg',
  routine: 'arcade-panel hover:shadow-glow-cyan-lg',
};

export default function AsteroidCard({ asteroid, onSelect, isArcadeTheme }) {
  const now = useLiveTime(60000);
  const meta = RISK_META[asteroid.riskLevel];
  const badgeClass = badgeColors[asteroid.riskLevel];
  const panelClass = panelGlow[asteroid.riskLevel] || panelGlow.routine;

  return (
    <button
      onClick={() => onSelect(asteroid)}
      className={`group flex items-center justify-between gap-4 transition-all duration-100 px-4 py-3 sm:px-5 sm:py-4 text-left w-full hover:scale-[1.01] active:scale-[0.99] ${panelClass}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span
          className={`shrink-0 w-3 h-3 border ${badgeClass}`}
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
          className={`font-display text-[9px] px-2 py-0.5 border hidden sm:inline-block ${badgeClass}`}
        >
          {meta.label.toUpperCase()}
        </span>
        <span
          className={`w-3 h-3 border sm:hidden ${badgeClass}`}
          aria-hidden="true"
        />
        <span className="text-edge group-hover:text-signal transition-colors font-display text-[10px] tracking-wide" aria-hidden="true">
          {isArcadeTheme ? '[SELECT]' : 'SELECT'}
        </span>
      </div>
    </button>
  );
}
