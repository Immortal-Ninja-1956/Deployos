import { HISTORICAL_EVENTS } from '../utils/historicalEvents';

export default function HistoricalContext({ isArcadeTheme }) {
  // Show Chelyabinsk, Meteor Crater, Tunguska in the general dashboard view
  const displayEvents = HISTORICAL_EVENTS.slice(0, 3);

  return (
    <section className="my-12 select-none">
      <h2 className="font-display text-xs text-cyan-400 glow-cyan mb-2 border-b-2 border-edge/30 pb-2">
        {isArcadeTheme ? '[ HISTORICAL IMPACT DATA ]' : 'HISTORICAL IMPACT DATA'}
      </h2>
      <p className="text-dim text-sm mb-6 font-mono">
        OBJECTS OF CORRESPONDING SIZE HAVE PREVIOUSLY PENETRATED EARTH ATMOSPHERE.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {displayEvents.map((ev) => (
          <div key={ev.name} className="arcade-panel p-5 hover:shadow-glow-cyan">
            <p className="font-display text-[9px] text-signal glow-magenta">{ev.year}</p>
            <h3 className="font-arcade text-lg text-ink font-bold mt-2 tracking-wide uppercase">{ev.name}</h3>
            <p className="font-mono text-xs text-cyan-400 mt-1 mb-3 uppercase font-bold">EST SIZE: {ev.size}</p>
            <p className="text-sm text-ink/80 leading-relaxed font-mono">{ev.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
