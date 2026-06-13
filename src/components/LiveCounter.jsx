import { currentDistanceKm } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

export default function LiveCounter({ asteroid }) {
  const now = useLiveTime(1000);
  const distance = currentDistanceKm(asteroid, now);
  const approaching = asteroid.approachEpoch > now;

  return (
    <div>
      <div className="font-mono text-3xl sm:text-4xl font-semibold text-ink tabular-nums tracking-tight">
        {Math.round(distance).toLocaleString()}
        <span className="text-lg sm:text-xl text-dim ml-1.5">km</span>
      </div>
      <p className="text-xs text-dim mt-1 font-mono">
        {approaching ? '\u2192 closing' : '\u2190 moving away'} at {asteroid.velocityKmS.toFixed(1)} km/s
      </p>
    </div>
  );
}
