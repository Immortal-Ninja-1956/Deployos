import { useEffect, useState } from 'react';
import { RISK_META } from '../utils/risk';
import LiveCounter from './LiveCounter';

export default function Hero({ 
  asteroids, 
  allCurrentAsteroids = [], 
  prevAsteroids = [], 
  selectedDate, 
  onSelect,
  loading, 
  isDemoData, 
  isArcadeTheme 
}) {
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
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const currCount = allCurrentAsteroids ? allCurrentAsteroids.length : 0;
  const prevCount = prevAsteroids ? prevAsteroids.length : 0;
  const deltaCount = currCount - prevCount;
  const pctCount = prevCount > 0 ? Math.round((deltaCount / prevCount) * 100) : (currCount > 0 ? 100 : 0);

  const currHaz = allCurrentAsteroids ? allCurrentAsteroids.filter(a => a.isHazardous).length : 0;
  const prevHaz = prevAsteroids ? prevAsteroids.filter(a => a.isHazardous).length : 0;
  const deltaHaz = currHaz - prevHaz;
  const pctHaz = prevHaz > 0 ? Math.round((deltaHaz / prevHaz) * 100) : (currHaz > 0 ? 100 : 0);

  const currMinDist = allCurrentAsteroids && allCurrentAsteroids.length > 0 
    ? Math.min(...allCurrentAsteroids.map(a => a.missDistanceLD)) 
    : 9999;
  const prevMinDist = prevAsteroids && prevAsteroids.length > 0 
    ? Math.min(...prevAsteroids.map(a => a.missDistanceLD)) 
    : 9999;
  
  let pctClose = 0;
  if (prevMinDist > 0 && prevMinDist < 9999 && currMinDist < 9999) {
    pctClose = Math.round(((currMinDist - prevMinDist) / prevMinDist) * 100);
  }

  const dramaScore = a => a.diameterMeters.max / a.missDistanceLD;
  const mostDramatic = asteroids.length > 0 
    ? [...asteroids].sort((a, b) => dramaScore(b) - dramaScore(a))[0]
    : null;
  const hasMultipleCards = nearest && mostDramatic && mostDramatic.id !== nearest.id;

  return (
    <section className="pt-8 pb-6 sm:pt-12 sm:pb-8">
      {/* Live / Archive Badge strip */}
      <div className="flex items-center gap-3 mb-6 select-none flex-wrap">
        {isToday ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-mono border border-hazardous text-hazardous bg-hazardous/10 rounded-sm animate-pulse shadow-sm">
            <span className="w-2 h-2 rounded-full bg-hazardous inline-block animate-ping" />
            LIVE BROADCAST: URGENT
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-mono border border-edge text-dim bg-panel rounded-sm shadow-sm">
            HISTORICAL DATA: ARCHIVE ({selectedDate})
          </span>
        )}
        
        {isArcadeTheme && (
          <span className="font-display text-[9px] uppercase tracking-wider text-signal glow-magenta ml-auto hidden sm:inline">
            SENSOR: {isDemoData ? 'OFFLINE SIMULATOR' : 'NASA NEOWS LIVE'} | UPDATED: {lastUpdated}
          </span>
        )}
      </div>

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
        <div className={`grid grid-cols-1 md:grid-cols-2 ${hasMultipleCards ? 'lg:grid-cols-3 max-w-6xl' : 'max-w-4xl'} gap-6 mt-8 w-full`}>
          {/* Nearest Vector Card */}
          <div className={`animate-fade-in ${
            nearest.riskLevel === 'hazardous' ? 'arcade-panel-hazardous' : 
            nearest.riskLevel === 'watch' ? 'arcade-panel-watch' : 
            nearest.riskLevel === 'notable' ? 'arcade-panel-notable' : 
            'arcade-panel'
          } p-5 sm:p-6 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-edge/30 pb-2">
                <span className="font-display text-[9px] uppercase tracking-wider text-dim">
                  NEAREST VECTOR ALERT {!hasMultipleCards && '● MAX DRAMA'}
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
                MISS DIST: {nearest.missDistanceLD.toFixed(1)} LD <span className="text-[10px] text-dim/60 font-mono font-normal">{isArcadeTheme ? '(1 LD ~ 384,400 KM)' : '(1 LD ~ 384,400 km)'}</span>
              </p>
            </div>

            <LiveCounter asteroid={nearest} />
          </div>

          {/* Most Dramatic Vector Card */}
          {hasMultipleCards && (
            <div className={`animate-fade-in ${
              mostDramatic.riskLevel === 'hazardous' ? 'arcade-panel-hazardous' : 
              mostDramatic.riskLevel === 'watch' ? 'arcade-panel-watch' : 
              mostDramatic.riskLevel === 'notable' ? 'arcade-panel-notable' : 
              'arcade-panel'
            } p-5 sm:p-6 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-edge/30 pb-2">
                  <span className="font-display text-[9px] uppercase tracking-wider text-rose-500 font-bold">
                    MOST DRAMATIC VECTOR
                  </span>
                  <span
                    className="font-display text-[9px] px-2 py-0.5 border uppercase"
                    style={{
                      color: `var(--color-${mostDramatic.riskLevel})`,
                      borderColor: `var(--color-${mostDramatic.riskLevel})`,
                      boxShadow: isArcadeTheme ? `0 0 5px var(--color-${mostDramatic.riskLevel})` : 'none'
                    }}
                  >
                    {RISK_META[mostDramatic.riskLevel].label}
                  </span>
                </div>

                <h2 className="font-arcade text-2xl text-ink font-bold mb-1 tracking-wide uppercase">{mostDramatic.name}</h2>
                <p className="text-dim text-sm mb-4 font-mono">
                  SIZE COMP: {mostDramatic.sizeRef.label.toUpperCase()} {mostDramatic.sizeRef.emoji} &middot;{' '}
                  MISS DIST: {mostDramatic.missDistanceLD.toFixed(1)} LD
                </p>
                
                <p className="text-[10px] text-dim/95 font-mono mb-4 uppercase leading-relaxed">
                  * Drama index compares inverse size-to-distance threat factors. The closest approach is not always the largest threat.
                </p>
              </div>

              <div className="flex justify-between items-end">
                <LiveCounter asteroid={mostDramatic} />
                <button
                  onClick={() => onSelect(mostDramatic)}
                  className="bg-void border border-edge hover:border-signal text-ink px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer select-none font-bold whitespace-nowrap ml-4 mb-0.5"
                >
                  {isArcadeTheme ? '[ VIEW ]' : 'View Details'}
                </button>
              </div>
            </div>
          )}

          {/* Delta Comparison Card */}
          <div className="arcade-panel p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-edge/30 pb-2">
                <span className="font-display text-[9px] uppercase tracking-wider text-dim">
                  {isToday ? 'LIVE THREAT DELTA (TODAY vs LAST WEEK)' : 'FEED COMPARE (SELECTED vs PREV WEEK)'}
                </span>
                <span className="font-display text-[9px] px-2 py-0.5 border border-edge text-dim uppercase">
                  {isToday ? 'LIVE COMPARISON' : 'HISTORICAL COMPARE'}
                </span>
              </div>

              <h3 className="font-arcade text-lg text-ink font-bold mb-4 tracking-wide uppercase">
                {isToday ? 'Today vs. Last Week' : 'Selected vs. Prev Week'}
              </h3>

              <div className="space-y-4 font-mono text-xs">
                {/* Total count delta */}
                <div className="flex justify-between items-center pb-2 border-b border-edge/10">
                  <span className="text-dim uppercase">TOTAL DETECTIONS</span>
                  <div className="text-right">
                    <div className="text-ink font-bold">{currCount} objects</div>
                    <div className={`text-[10px] font-bold ${deltaCount >= 0 ? 'text-hazardous' : 'text-routine'}`}>
                      {deltaCount >= 0 ? '+' : ''}{deltaCount} ({pctCount >= 0 ? '+' : ''}{pctCount}% vs prev week)
                    </div>
                  </div>
                </div>

                {/* Hazardous count delta */}
                <div className="flex justify-between items-center pb-2 border-b border-edge/10">
                  <span className="text-dim uppercase">HAZARDOUS DETECTIONS</span>
                  <div className="text-right">
                    <div className="text-ink font-bold">{currHaz} threats</div>
                    <div className={`text-[10px] font-bold ${deltaHaz >= 0 ? 'text-hazardous' : 'text-routine'}`}>
                      {deltaHaz >= 0 ? '+' : ''}{deltaHaz} ({pctHaz >= 0 ? '+' : ''}{pctHaz}% vs prev week)
                    </div>
                  </div>
                </div>

                {/* Nearest miss delta */}
                <div className="flex justify-between items-center">
                  <span className="text-dim uppercase">CLOSEST APPROACH</span>
                  <div className="text-right">
                    <div className="text-ink font-bold">
                      {currMinDist < 9999 ? `${currMinDist.toFixed(2)} LD` : 'N/A'}
                    </div>
                    <div className={`text-[10px] font-bold ${pctClose <= 0 ? 'text-hazardous' : 'text-routine'}`}>
                      {pctClose <= 0 ? '▼' : '▲'} {Math.abs(pctClose)}% {pctClose <= 0 ? 'closer' : 'farther'} approach
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-dim/60 font-mono mt-4 leading-normal uppercase">
              * Delta metrics compare the selected 7-day approach feed against the preceding 7-day baseline to map threat fluctuation.
            </p>
          </div>
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
