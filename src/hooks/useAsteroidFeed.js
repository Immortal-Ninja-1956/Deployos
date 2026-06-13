import { useState, useEffect } from 'react';
import { getMockAsteroids } from '../data/mockAsteroids';
import { computeRisk } from '../utils/risk';
import { sizeLabel } from '../utils/sizeLabel';

function enrich(list) {
  return list
    .map((a) => ({
      ...a,
      riskLevel: computeRisk({
        isHazardous: a.isHazardous,
        missDistanceLD: a.missDistanceLD,
        diameterMax: a.diameterMeters.max,
      }),
      sizeRef: sizeLabel(a.diameterMeters.max),
    }))
    .sort((a, b) => a.missDistanceLD - b.missDistanceLD);
}

export function useAsteroidFeed(startDate = null) {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const url = startDate ? `/api/neo?start=${startDate}` : '/api/neo';
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 429) throw new Error('RATE_LIMIT_EXCEEDED');
          throw new Error(`API responded ${res.status}`);
        }
        const data = await res.json();
        if (!data.asteroids || !data.asteroids.length) throw new Error('Empty feed');
        if (!cancelled) {
          setAsteroids(enrich(data.asteroids));
          setIsDemoData(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAsteroids(enrich(getMockAsteroids()));
          setIsDemoData(true);
          setToastMessage(
            err.message === 'RATE_LIMIT_EXCEEDED'
              ? 'NASA API rate limit reached. Displaying simulated offline data.'
              : 'Could not connect to live API. Displaying simulated offline data.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [startDate]);

  return {
    asteroids,
    loading,
    isDemoData,
    toastMessage,
    clearToast: () => setToastMessage(null),
  };
}
