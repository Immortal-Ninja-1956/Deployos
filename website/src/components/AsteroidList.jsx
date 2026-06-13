import AsteroidCard from './AsteroidCard';

export default function AsteroidList({ asteroids, onSelect, loading }) {
  return (
    <section className="my-10 select-none">
      <h2 className="font-display text-xs text-cyan-400 glow-cyan mb-4 border-b-2 border-edge/30 pb-2">[ TARGET READOUT INDEX ]</h2>

      {loading ? (
        <div className="space-y-4" aria-label="Loading asteroid data">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[74px] arcade-panel bg-void/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {asteroids.map((a) => (
            <AsteroidCard key={a.id} asteroid={a} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
