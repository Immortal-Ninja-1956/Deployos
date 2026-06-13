import AsteroidCard from './AsteroidCard';

export default function AsteroidList({ asteroids, onSelect, loading }) {
  return (
    <section className="my-10">
      <h2 className="font-display text-lg text-ink mb-3">This week&apos;s close approaches</h2>

      {loading ? (
        <div className="space-y-3" aria-label="Loading asteroid data">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[60px] rounded-xl bg-panel/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {asteroids.map((a) => (
            <AsteroidCard key={a.id} asteroid={a} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
