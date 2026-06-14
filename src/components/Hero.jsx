import { useEffect, useState } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';

export default function Hero({ asteroids, loading, isDemoData, isArcadeTheme }) {
  const [count, setCount] = useState(0);
  const target = asteroids.length;
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  });

  useEffect(() => {
    if (!loading) {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }
  }, [loading]);

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
    <section className="pt-8 pb-6 sm:pt-12 sm:pb-8">
      {/* Arcade cabinet header strip */}
      {isArcadeTheme && (
        <div className="flex items-center justify-between border-b-2 border-edge/30 pb-2 mb-6 font-display text-[9px] sm:text-[10px] tracking-wider text-signal select-none">
          <span className="animate-text-blink text-routine glow-green">
            ● SENSOR: {isDemoData ? 'OFFLINE SIMULATOR' : 'NASA NEOWS LIVE'}
          </span>
          <span className="hidden sm:inline">OBJECTS IN FEED: {target}</span>
          <span>LAST UPDATED: {lastUpdated}</span>
        </div>
      )}

      {isArcadeTheme && (
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-4 glow-cyan select-none">
          [ SYSTEM DIODE READOUT ]
        </p>
      )}

      <h1 className="font-arcade text-3xl sm:text-5xl font-black leading-[1.2] tracking-wide text-ink max-w-3xl">
        NASA RADAR TRACKING{' '}
        <span className="font-display text-2xl sm:text-4xl text-signal glow-magenta ml-1 mr-1 animate-pulse">
          {loading ? '\u2013' : count}
        </span>{' '}
        {target === 1 ? 'OBJECT' : 'OBJECTS'} PASSING EARTH.
      </h1>

      <p className="mt-4 max-w-2xl text-dim text-sm sm:text-base leading-relaxed font-mono">
        {isArcadeTheme 
          ? '> ESTIMATING TRAJECTORIES. REAL-TIME DATA STREAM SYNCHRONIZED WITH NASA JPL SENSORS.' 
          : 'Estimating trajectories. Real-time data stream synchronized with NASA JPL sensors.'}
      </p>

      {nearest && (
        <div className={`mt-8 animate-fade-in ${
          nearest.riskLevel === 'hazardous' ? 'arcade-panel-hazardous' : 
          nearest.riskLevel === 'watch' ? 'arcade-panel-watch' : 
          nearest.riskLevel === 'notable' ? 'arcade-panel-notable' : 
          'arcade-panel'
        } p-5 sm:p-6 max-w-xl`}>
          <div className="flex items-center justify-between mb-3 border-b border-edge/30 pb-2">
            <span className="font-display text-[9px] uppercase tracking-wider text-dim">
              NEAREST VECTOR ALERT
            </span>
            <span
              className="font-display text-[9px] px-2 py-0.5 border uppercase"
              style={{
                color: `var(--color-${nearest.riskLevel})`,
                borderColor: `var(--color-${nearest.riskLevel})`,
                boxShadow: isArcadeTheme ? `0 0 5px var(--color-${nearest.riskLevel})` : 'none'
              }}
            >
              {RISK_META[nearest.riskLevel].label}
            </span>
          </div>

          <h2 className="font-arcade text-2xl text-ink font-bold mb-1 tracking-wide uppercase">{nearest.name}</h2>
          <p className="text-dim text-sm mb-4 font-mono">
            SIZE COMP: {nearest.sizeRef.label.toUpperCase()} {nearest.sizeRef.emoji} &middot;{' '}
            MISS DIST: {nearest.missDistanceLD.toFixed(1)} LD <span className="text-[10px] text-dim/60 font-mono font-normal">{isArcadeTheme ? '(1 LD = 384,400 KM)' : '(1 LD = 384,400 km)'}</span>
          </p>

          <LiveCounter asteroid={nearest} />
        </div>
      )}

      {isDemoData && (
        <p className="mt-4 text-sm font-mono text-signal/80 animate-pulse">
          {isArcadeTheme 
            ? '>> MONITOR STATUS: OFFLINE. DEMO PROTOCOL RUNNING.' 
            : 'Monitor status: Offline. Demo protocol running.'}
        </p>
      )}
    </section>
  );
}
