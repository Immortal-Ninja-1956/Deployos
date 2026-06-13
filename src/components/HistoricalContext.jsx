const EVENTS = [
  {
    name: 'Chelyabinsk, Russia',
    year: '2013',
    size: '~20 m',
    detail:
      'Exploded in the atmosphere with the force of roughly 30 Hiroshima-sized bombs. The shockwave injured around 1,500 people, mostly from shattered glass \u2014 the object itself never reached the ground intact.',
  },
  {
    name: 'Tunguska, Siberia',
    year: '1908',
    size: '~50\u201360 m',
    detail:
      'Flattened an estimated 2,000 square kilometers of forest. The remote location meant no recorded casualties, but it remains the largest impact event in recorded history.',
  },
  {
    name: 'Meteor Crater, Arizona',
    year: '~50,000 years ago',
    size: '~50 m',
    detail:
      'Left a crater over a kilometer wide and 170 meters deep \u2014 still clearly visible today. A reminder that even "small" objects leave permanent marks.',
  },
];

export default function HistoricalContext() {
  return (
    <section className="my-12">
      <h2 className="font-display text-lg text-ink mb-1">For scale &mdash; past impacts</h2>
      <p className="text-dim text-sm mb-4">
        Objects similar in size to several this week have hit Earth before.
      </p>

      <div className="grid sm:grid-cols-3 gap-3">
        {EVENTS.map((ev) => (
          <div key={ev.name} className="rounded-xl border border-edge bg-panel/40 p-4">
            <p className="font-mono text-xs text-signal">{ev.year}</p>
            <h3 className="font-display text-base text-ink mt-1">{ev.name}</h3>
            <p className="font-mono text-xs text-dim mt-1 mb-2">Estimated size: {ev.size}</p>
            <p className="text-sm text-ink/80 leading-relaxed">{ev.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
