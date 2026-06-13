// NOTE: Gemini model names change fairly often. If this model id 404s,
// check https://aistudio.google.com or https://ai.google.dev/gemini-api/docs/models
// for the current free-tier "Flash" model name and update GEMINI_MODEL below.
const GEMINI_MODEL = 'gemini-2.5-flash';

function buildPrompt(asteroid) {
  return `You are a calm, curious science communicator writing for someone who just saw a scary asteroid headline. You will receive JSON data about one near-Earth asteroid. Write EXACTLY 3 sentences:
1. Describe its size using a relatable human-scale comparison appropriate to its diameter in meters.
2. Describe, as a clearly-framed hypothetical ("if it were headed our way"), what an object this size could do on impact.
3. State plainly, using the actual miss distance in lunar distances (1 LD = 384,400 km), why this object will NOT hit Earth.

If isHazardous is true, briefly explain that this is a size/distance classification used for monitoring purposes -- not a prediction of impact.

Never use alarmist language. Output plain text, no markdown, no preamble, no asterisks.

Asteroid data:
${JSON.stringify(asteroid)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Not a hard failure -- the UI shows a friendly fallback message and
    // every other feature keeps working without this key.
    return res.status(200).json({ report: null, note: 'GEMINI_API_KEY not configured' });
  }

  const asteroid = req.body;
  if (!asteroid || !asteroid.name) {
    return res.status(400).json({ error: 'Missing asteroid payload' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(asteroid) }] }],
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
