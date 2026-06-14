export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA APOD API error: ${response.status}`);
    }
    const data = await response.json();

    // Limit explanation to first 3 sentences
    const rawExplanation = data.explanation || '';
    const sentences = rawExplanation.match(/[^.!?]+[.!?]+(\s|$)/g) || [rawExplanation];
    const briefExplanation = sentences.slice(0, 3).join('').trim();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      title: data.title || 'Astronomy Picture of the Day',
      explanation: briefExplanation || 'Exploring the universe, one image at a time.',
      url: data.url || 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&auto=format&fit=crop&q=60',
      mediaType: data.media_type || 'image',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch NASA APOD data',
      detail: err.message,
    });
  }
}
