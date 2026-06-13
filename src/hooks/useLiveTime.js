import { useState, useEffect } from 'react';

export function useLiveTime(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(tick);
  }, [intervalMs]);

  return now;
}
