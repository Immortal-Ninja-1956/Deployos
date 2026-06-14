import { currentDistanceKm } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

export default function LiveCounter({ asteroid }) {
  const now = useLiveTime(1000);
  const distance = currentDistanceKm(asteroid, now);
  const approaching = asteroid.approachEpoch > now;

  const AU_KM = 149597870.7;
  const useAU = distance >= 10000000; // 10^7 km

  const diff = Math.abs(asteroid.approachEpoch - now);
  const secs = Math.floor((diff / 1000) % 60);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const pad = (num) => String(num).padStart(2, '0');
  const countdownStr = days > 0 
    ? `${days}D ${pad(hours)}:${pad(mins)}:${pad(secs)}`
    : `${pad(hours)}:${pad(mins)}:${pad(secs)}`;

  return (
    <div className="select-none">
      <div className="font-mono text-3xl sm:text-4xl font-bold text-routine glow-green tracking-widest">
        {useAU 
          ? (distance / AU_KM).toFixed(4)
          : Math.round(distance).toLocaleString()}
        <span className="text-lg sm:text-xl text-dim ml-2 font-normal">
          {useAU ? 'AU' : 'KM'}
        </span>
      </div>
      <p className="text-sm text-dim mt-1.5 font-mono uppercase tracking-wider">
        {approaching ? '>> CLOSING IN' : '<< RECEDING'} AT {asteroid.velocityKmS.toFixed(1)} KM/S
      </p>

      {/* Countdown timer */}
      <div className="font-mono text-xs sm:text-sm mt-3 pt-3 border-t border-edge/20 flex items-center gap-2 tracking-widest font-bold">
        {approaching ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hazardous opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-hazardous"></span>
            </span>
            <span className="text-hazardous">
              CLOSEST APPROACH IN {countdownStr}
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-dim inline-block" />
            <span className="text-dim">
              PASSED EARTH {countdownStr} AGO
            </span>
          </>
        )}
      </div>
    </div>
  );
}
