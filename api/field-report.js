// NOTE: Gemini model names change fairly often. If this model id 404s,
// check https://aistudio.google.com or https://ai.google.dev/gemini-api/docs/models
// for the current free-tier "Flash" model name and update GEMINI_MODEL below.
const GEMINI_MODEL = 'gemini-2.5-flash';

function buildPrompt(asteroid, latitude, longitude) {
  let locationSentence = '';
  if (latitude !== undefined && longitude !== undefined) {
    locationSentence = `\n4. Estimate where the object is in the observer's local sky right now based on their coordinates (Latitude: ${latitude}, Longitude: ${longitude}). Specify a compass direction (e.g., East-South-East), estimated altitude angle in degrees, and the constellation it is passing through. Make it sound scientifically plausible and clear.`;
  }

  return `You are a calm, curious science communicator writing for someone who just saw a scary asteroid headline. You will receive JSON data about one near-Earth asteroid. Write EXACTLY ${latitude !== undefined ? '4' : '3'} sentences:
1. Describe its size using a relatable human-scale comparison appropriate to its diameter in meters.
2. Describe, as a clearly-framed hypothetical ("if it were headed our way"), what an object this size could do on impact.
3. State plainly, using the actual miss distance in lunar distances (1 LD = 384,400 km), why this object will NOT hit Earth.${locationSentence}

If isHazardous is true, briefly explain that this is a size/distance classification used for monitoring purposes -- not a prediction of impact.

Never use alarmist language. Output plain text, no markdown, no preamble, no asterisks.

Asteroid data:
${JSON.stringify(asteroid)}`;
}

const ipRequests = new Map();
let globalRequests = [];
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_IP = 10;
const MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds

function checkRateLimit(ip) {
  const now = Date.now();
  
  // Clean up memory if Map grows too large
  if (ipRequests.size > 1000) {
    ipRequests.clear();
  }

  // Clean up global requests
  globalRequests = globalRequests.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (globalRequests.length >= 30) {
    return { limited: true, reason: 'GLOBAL_LIMIT_EXCEEDED' };
  }

  // Clean up IP requests
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }
  let timestamps = ipRequests.get(ip);
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  ipRequests.set(ip, timestamps);

  // Check minimum interval from the same IP
  if (timestamps.length > 0 && (now - timestamps[timestamps.length - 1] < MIN_REQUEST_INTERVAL)) {
    return { limited: true, reason: 'TOO_FAST' };
  }

  // Check max per minute
  if (timestamps.length >= MAX_REQUESTS_PER_IP) {
    return { limited: true, reason: 'RATE_LIMIT_EXCEEDED' };
  }

  // Record request
  timestamps.push(now);
  globalRequests.push(now);
  return { limited: false };
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'global';
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.limited) {
    res.setHeader('Retry-After', '2');
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: rateLimitStatus.reason === 'TOO_FAST' 
        ? 'Please wait a moment before requesting another report.' 
        : 'Rate limit exceeded. Please try again in a minute.'
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Not a hard failure -- the UI shows a friendly fallback message and
    // every other feature keeps working without this key.
    return res.status(200).json({ report: null, note: 'GEMINI_API_KEY not configured' });
  }

  let rawAsteroid = req.body;
  let rawLatitude = undefined;
  let rawLongitude = undefined;

  if (req.body && req.body.asteroid) {
    rawAsteroid = req.body.asteroid;
    rawLatitude = req.body.latitude;
    rawLongitude = req.body.longitude;
  }

  if (!rawAsteroid || !rawAsteroid.name) {
    return res.status(400).json({ error: 'Missing asteroid payload' });
  }

  // Sanitize coordinates and prevent injection
  let latitude = undefined;
  let longitude = undefined;

  if (rawLatitude !== undefined && rawLatitude !== null) {
    const lat = parseFloat(rawLatitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Invalid latitude parameter. Must be a number between -90 and 90.' });
    }
    latitude = lat;
  }

  if (rawLongitude !== undefined && rawLongitude !== null) {
    const lng = parseFloat(rawLongitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Invalid longitude parameter. Must be a number between -180 and 180.' });
    }
    longitude = lng;
  }

  // Whitelist and sanitize asteroid fields to prevent prompt injection via raw object values
  const asteroid = {
    name: String(rawAsteroid.name).replace(/[^\w\s\-\(\)]/gi, '').slice(0, 50),
    isHazardous: Boolean(rawAsteroid.isHazardous),
    diameterMeters: {
      min: Number(rawAsteroid.diameterMeters?.min || 0),
      max: Number(rawAsteroid.diameterMeters?.max || 0),
    },
    missDistanceLD: Number(rawAsteroid.missDistanceLD || 0),
    missDistanceKm: Number(rawAsteroid.missDistanceKm || 0),
    velocityKmS: Number(rawAsteroid.velocityKmS || 0),
    approachEpoch: Number(rawAsteroid.approachEpoch || 0),
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(asteroid, latitude, longitude) }] }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(200).json({ report: null, note: `Gemini error ${response.status}: ${detail}` });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    return res.status(200).json({ report: text });
  } catch (err) {
    return res.status(200).json({ report: null, note: `Gemini request failed: ${err.message}` });
  }
}
