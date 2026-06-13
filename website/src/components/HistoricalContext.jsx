const EVENTS = [
  {
    name: 'Chelyabinsk, Russia',
    year: '2013',
    size: '~20 M',
    detail:
      'EXPLODED IN THE ATMOSPHERE WITH THE FORCE OF ROUGHLY 30 HIROSHIMA-SIZED BOMBS. SHOCKWAVE INJURED 1,500 PEOPLE, MOSTLY FROM SHATTERED GLASS. OBJECT NEVER REACHED THE GROUND INTACT.',
  },
  {
    name: 'Tunguska, Siberia',
    year: '1908',
    size: '~50-60 M',
    detail:
      'FLATTENED AN ESTIMATED 2,000 SQUARE KILOMETERS OF FOREST. REMOTE LOCATION RESULTED IN ZERO RECORDED CASUALTIES, BUT IT REMAINS THE LARGEST IMPACT EVENT IN RECORDED HISTORY.',
  },
  {
    name: 'Meteor Crater, Arizona',
    year: '~50,000 YRS AGO',
    size: '~50 M',
    detail:
      'LEFT A CRATER OVER A KILOMETER WIDE AND 170 METERS DEEP. CLEARLY VISIBLE TODAY, REMINDING US THAT EVEN SMALL VECTOR OBJECTS LEAVE PERMANENT SCARS.',
  },
];

export default function HistoricalContext({ isArcadeTheme }) {
  return (
    <section className="my-12 select-none">
      <h2 className="font-display text-xs text-cyan-400 glow-cyan mb-2 border-b-2 border-edge/30 pb-2">
        {isArcadeTheme ? '[ HISTORICAL IMPACT DATA ]' : 'HISTORICAL IMPACT DATA'}
      </h2>
      <p className="text-dim text-sm mb-6 font-mono">
        OBJECTS OF CORRESPONDING SIZE HAVE PREVIOUSLY PENETRATED EARTH ATMOSPHERE.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {EVENTS.map((ev) => (
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
