const LD_KM = 384400;

/**
 * Demo dataset used when /api/neo is unreachable (e.g. running `vite dev`
 * without `vercel dev`, or NASA's feed being briefly unavailable during a
 * live demo). Timestamps are generated relative to "now" so the live
 * counters and countdowns always look current, regardless of when this
 * runs.
 *
 * Shape matches the normalized output of api/_lib/normalize.js exactly,
 * minus risk/sizeRef, which App.jsx computes for both real and mock data.
 */
export function getMockAsteroids(baseDateStr = null) {
  const now = baseDateStr ? new Date(baseDateStr).getTime() : Date.now();
  const HOUR = 3.6e6;
  const DAY = 24 * HOUR;

  const raw = [
    {
      id: 'mock-2025-qf7',
      name: '2025 QF7',
      diameterMeters: { min: 140, max: 310 },
      isHazardous: true,
      approachOffset: 5 * HOUR,
      velocityKmS: 18.3,
      missDistanceLD: 4.8,
      absoluteMagnitude: 19.4,
    },
    {
      id: 'mock-2024-zr5',
      name: '2024 ZR5',
      diameterMeters: { min: 500, max: 1100 },
      isHazardous: true,
      approachOffset: 6 * DAY,
      velocityKmS: 25.4,
      missDistanceLD: 12.3,
      absoluteMagnitude: 17.1,
    },
    {
      id: 'mock-2024-pt3',
      name: '2024 PT3',
      diameterMeters: { min: 60, max: 130 },
      isHazardous: false,
      approachOffset: DAY + 4 * HOUR,
      velocityKmS: 11.5,
      missDistanceLD: 8.2,
      absoluteMagnitude: 21.0,
    },
    {
      id: 'mock-2026-dm4',
      name: '2026 DM4',
      diameterMeters: { min: 22, max: 49 },
      isHazardous: false,
      approachOffset: 18 * HOUR,
      velocityKmS: 13.0,
      missDistanceLD: 16.7,
      absoluteMagnitude: 23.2,
    },
    {
      id: 'mock-2026-ab1',
      name: '2026 AB1',
      diameterMeters: { min: 15, max: 34 },
      isHazardous: false,
      approachOffset: -3 * HOUR,
      velocityKmS: 9.8,
      missDistanceLD: 14.6,
      absoluteMagnitude: 23.8,
    },
    {
      id: 'mock-2025-lk9',
      name: '2025 LK9',
      diameterMeters: { min: 5, max: 11 },
      isHazardous: false,
      approachOffset: 2 * DAY,
      velocityKmS: 6.2,
      missDistanceLD: 38.2,
      absoluteMagnitude: 26.5,
    },
    {
      id: 'mock-2026-cc2',
      name: '2026 CC2',
      diameterMeters: { min: 350, max: 780 },
      isHazardous: false,
      approachOffset: 3 * DAY + 12 * HOUR,
      velocityKmS: 22.1,
      missDistanceLD: 55.0,
      absoluteMagnitude: 17.9,
    },
    {
      id: 'mock-2025-wx1',
      name: '2025 WX1',
      diameterMeters: { min: 2, max: 4 },
      isHazardous: false,
      approachOffset: -DAY,
      velocityKmS: 5.1,
      missDistanceLD: 70.5,
      absoluteMagnitude: 28.4,
    },
  ];

  return raw.map((a) => {
    const approachEpoch = now + a.approachOffset;
    return {
      id: a.id,
      name: a.name,
      jplUrl: '#',
      absoluteMagnitude: a.absoluteMagnitude,
      diameterMeters: a.diameterMeters,
      isHazardous: a.isHazardous,
      approachDate: new Date(approachEpoch).toISOString(),
      approachEpoch,
      velocityKmS: a.velocityKmS,
      missDistanceKm: a.missDistanceLD * LD_KM,
      missDistanceLD: a.missDistanceLD,
      orbitingBody: 'Earth',
    };
  });
}
