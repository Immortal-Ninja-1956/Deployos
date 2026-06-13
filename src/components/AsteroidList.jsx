import AsteroidCard from './AsteroidCard';

export default function AsteroidList({ asteroids, onSelect, loading, isArcadeTheme, onFilterChange }) {
  return (
    <section className="my-10 select-none">
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
        <div className="grid gap-4">
          {asteroids.map((a) => (
            <AsteroidCard key={a.id} asteroid={a} onSelect={onSelect} isArcadeTheme={isArcadeTheme} />
          ))}
        </div>
      )}
    </section>
  );
}
