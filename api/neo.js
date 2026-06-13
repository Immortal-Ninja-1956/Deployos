import { normalizeFeed } from './_lib/normalize.js';

function getDateRange(queryStart) {
  let start = new Date();
  if (queryStart) {
    const parsedStart = new Date(queryStart);
    if (!isNaN(parsedStart)) {
      start = parsedStart;
    }
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7); // NeoWs feed max window is 7 days

  const fmt = (d) => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const { start, end } = getDateRange(req.query?.start);

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'NASA API rate limit exceeded' });
      }
      return res.status(response.status).json({
        error: `NASA NeoWs API error: ${response.status}`,
      });
    }

    const data = await response.json();
    const asteroids = normalizeFeed(data);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({
      asteroids,
      elementCount: data.element_count,
      range: { start, end },
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch NASA NeoWs data',
      detail: err.message,
    });
  }
}
