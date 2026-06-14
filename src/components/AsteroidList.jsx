import { useState } from 'react';
import AsteroidCard from './AsteroidCard';

const PAGE_SIZE = 12;
const PEEK_COUNT = 3; // ghost cards shown behind the curtain

export default function AsteroidList({ asteroids, onSelect, loading, isArcadeTheme, onFilterChange }) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = !showAll && asteroids.length > PAGE_SIZE;
  const displayed = showAll ? asteroids : asteroids.slice(0, PAGE_SIZE);
  const peekItems = hasMore ? asteroids.slice(PAGE_SIZE, PAGE_SIZE + PEEK_COUNT) : [];

  return (
    <section className="my-10 select-none">
      {/* heading stays within parent bounds */}
      <h2 className="font-display text-xs text-cyan-400 glow-cyan mb-4 border-b-2 border-edge/30 pb-2">
        {isArcadeTheme ? '[ TARGET READOUT INDEX ]' : 'TARGET READOUT INDEX'}
      </h2>

      {loading ? (
        <div className="space-y-4" aria-label="Loading asteroid data">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[74px] arcade-panel bg-void/50 animate-pulse" />
          ))}
        </div>
      ) : asteroids.length === 0 ? (
        <div className="arcade-panel bg-void/30 p-8 text-center flex flex-col items-center justify-center gap-4">
          <p className="font-mono text-sm text-dim leading-relaxed">
            {isArcadeTheme ? '> NO OBJECTS MATCH CURRENT SCAN PARAMETERS' : 'No objects match current scan parameters.'}
          </p>
          <button
            onClick={() => onFilterChange && onFilterChange('all')}
            className="bg-void border-2 border-edge hover:border-signal text-edge hover:text-signal px-4 py-2 font-display text-[10px] sm:text-xs tracking-widest cursor-pointer select-none transition-all hover:scale-[1.03] active:scale-95"
          >
            {isArcadeTheme ? '[ RESET FILTERS ]' : 'RESET FILTERS'}
          </button>
        </div>
      ) : (
        <>
          {/* Main visible grid — bleeds 24px past heading on each side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mx-6 px-6">
            {displayed.map((a) => (
              <AsteroidCard key={a.id} asteroid={a} onSelect={onSelect} isArcadeTheme={isArcadeTheme} />
            ))}
          </div>

          {/* Peek / reveal zone */}
          {hasMore && (
            <div className="relative mt-4 -mx-6 px-6">
              {/* Ghost cards — blurred & dimmed peek */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-none select-none">
                {peekItems.map((a) => (
                  <div key={a.id} className="opacity-30 blur-[2px] scale-[0.97] origin-top transition-none">
                    <AsteroidCard asteroid={a} onSelect={() => {}} isArcadeTheme={isArcadeTheme} />
                  </div>
                ))}
              </div>

              {/* Gradient curtain */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(7,14,28,0.55) 40%, rgba(7,14,28,0.92) 100%)',
                }}
              />

              {/* Centred reveal button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-auto">
                <button
                  onClick={() => setShowAll(true)}
                  className="
                    relative z-10
                    bg-void/80 backdrop-blur-sm
                    border-2 border-signal/60 hover:border-signal
                    text-signal hover:text-ink
                    hover:bg-signal/20
                    px-6 py-2.5
                    font-display text-xs tracking-[0.2em]
                    cursor-pointer
                    transition-all duration-200
                    hover:scale-[1.04] active:scale-95
                    shadow-[0_0_16px_rgba(0,255,200,0.18)] hover:shadow-[0_0_28px_rgba(0,255,200,0.38)]
                  "
                >
                  {isArcadeTheme
                    ? `[ REVEAL ${asteroids.length - PAGE_SIZE} MORE OBJECTS ]`
                    : `↓ SHOW ${asteroids.length - PAGE_SIZE} MORE`}
                </button>
                <p className="font-mono text-[10px] text-dim/60 tracking-widest">
                  {asteroids.length - PAGE_SIZE} targets hidden
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
