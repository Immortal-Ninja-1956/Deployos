import { useState, useEffect } from 'react';

export function useLiveTime(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const setupInterval = () => {
      // Slow down countdown to 10 seconds if user prefers reduced motion
      const actualInterval = mediaQuery.matches ? Math.max(intervalMs, 10000) : intervalMs;
      return setInterval(() => setNow(Date.now()), actualInterval);
    };

    let tick = setupInterval();

    const listener = () => {
      clearInterval(tick);
      tick = setupInterval();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      clearInterval(tick);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, [intervalMs]);

  return now;
}
