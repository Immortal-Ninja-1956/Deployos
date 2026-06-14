import { currentDistanceKm } from '../utils/liveDistance';
import { useLiveTime } from '../hooks/useLiveTime';

export default function LiveCounter({ asteroid }) {
  const now = useLiveTime(1000);
  const distance = currentDistanceKm(asteroid, now);
  const approaching = asteroid.approachEpoch > now;

  const AU_KM = 149597870.7;
  const useAU = distance >= 10000000; // 10^7 km

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
    </div>
  );
}
