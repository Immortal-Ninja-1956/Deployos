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
  const [prevAsteroids, setPrevAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const url = startDate ? `/api/neo?start=${startDate}` : '/api/neo';
        
        // Calculate previous week start date
        const baseDate = startDate ? new Date(startDate) : new Date();
        const prevDateObj = new Date(baseDate);
        prevDateObj.setDate(prevDateObj.getDate() - 7);
        const prevDateStr = prevDateObj.toISOString().split('T')[0];
        const prevUrl = `/api/neo?start=${prevDateStr}`;

        const [res, prevRes] = await Promise.all([fetch(url), fetch(prevUrl)]);
        if (!res.ok || !prevRes.ok) {
          if (res.status === 429 || prevRes.status === 429) throw new Error('RATE_LIMIT_EXCEEDED');
          throw new Error('API responded with error');
        }
        const [data, prevData] = await Promise.all([res.json(), prevRes.json()]);
        if (!data.asteroids || !data.asteroids.length) throw new Error('Empty feed');
        
        if (!cancelled) {
          setAsteroids(enrich(data.asteroids));
          setPrevAsteroids(enrich(prevData.asteroids || []));
          setIsDemoData(false);
        }
      } catch (err) {
        if (!cancelled) {
          const mock = getMockAsteroids(startDate);
          const baseTime = startDate ? new Date(startDate).getTime() : Date.now();
          
          // Partition mock data into current week (offset >= 0) and previous week (offset < 0)
          const currentMock = mock.filter(a => a.approachEpoch >= baseTime);
          const prevMock = mock.filter(a => a.approachEpoch < baseTime);
          
          setAsteroids(enrich(currentMock.length > 0 ? currentMock : mock));
          setPrevAsteroids(enrich(prevMock.length > 0 ? prevMock : mock.map(a => ({
            ...a,
            approachEpoch: a.approachEpoch - 7 * 24 * 3600 * 1000,
            approachDate: new Date(a.approachEpoch - 7 * 24 * 3600 * 1000).toISOString()
          }))));
          
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
    prevAsteroids,
    loading,
    isDemoData,
    toastMessage,
    clearToast: () => setToastMessage(null),
  };
}
