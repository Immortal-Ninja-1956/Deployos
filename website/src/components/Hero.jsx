import { useEffect, useState } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';

export default function Hero({ asteroids, loading, isDemoData }) {
  const [count, setCount] = useState(0);
  const target = asteroids.length;

  useEffect(() => {
    if (!target) return;
    let frame;
    const duration = 800;
    const start = performance.now();

    function step(ts) {
      const progress = Math.min(1, (ts - start) / duration);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const nearest = asteroids[0];

  return (
    <section className="pt-10 pb-8 sm:pt-16 sm:pb-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal/90 mb-4">
        Live near-earth object tracker
      </p>

      <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.08] tracking-tight text-ink max-w-3xl">
        Right now, NASA is tracking{' '}
        <span className="font-mono text-signal">{loading ? '\u2013' : count}</span>{' '}
        {target === 1 ? 'asteroid' : 'asteroids'} passing Earth this week.
      </h1>

      <p className="mt-4 max-w-2xl text-dim text-base sm:text-lg leading-relaxed">
        Most are harmless. A few are worth knowing about. NearMiss turns raw orbital data
        into something you can actually picture.
      </p>

      {nearest && (
        <div className="mt-10 rounded-2xl border border-edge bg-panel/60 backdrop-blur-sm p-5 sm:p-6 max-w-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
              Closest approach this week
            </span>
            <span
              className="font-mono text-xs px-2 py-1 rounded-full border"
              style={{
                color: RISK_META[nearest.riskLevel].color,
                borderColor: `${RISK_META[nearest.riskLevel].color}60`,
              }}
            >
              {RISK_META[nearest.riskLevel].label}
            </span>
          </div>

          <h2 className="font-display text-2xl text-ink mb-1">{nearest.name}</h2>
          <p className="text-dim text-sm mb-4">
            About the size of {nearest.sizeRef.label} {nearest.sizeRef.emoji} &middot;{' '}
            {nearest.missDistanceLD.toFixed(1)} lunar distances at closest
          </p>

          <LiveCounter asteroid={nearest} />
        </div>
      )}

      {isDemoData && (
        <p className="mt-4 text-xs font-mono text-dim/70">
          Showing simulated demo data &mdash; live NASA feed unavailable right now.
        </p>
      )}
    </section>
  );
}
