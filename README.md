# NearMiss

**Right now, NASA is tracking dozens of asteroids flying past Earth. Here's how close — and what that actually means.**

Built for **ArcNight 2026** (Microsoft Innovations Club, VIT Chennai) — SpaceTech domain.

NearMiss takes NASA's live Near-Earth Object feed and turns raw numbers like
"0.034 AU" into something a stranger can understand in five seconds: a live
closing-distance counter, a radial map of this week's approaches, human-scale
size comparisons, and an AI-generated "field report" for each object.

---

## What's real vs. what's mocked

| Feature | Status |
|---|---|
| NASA NeoWs live feed | **Real** — `/api/neo` |
| Risk classification | **Real** — `src/utils/risk.js` |
| Size comparison labels & bars | **Real** |
| Live closing-distance counter | **Real**, ticks every second |
| Radial approach map (canvas) | **Real** |
| Gemini field reports | **Real**, lazy-loaded per asteroid |
| Size comparison icons | Emoji (no external assets needed) |
| Historical impact cards | Static content (Chelyabinsk, Tunguska, Meteor Crater) |
| Demo data | Auto-fallback if `/api/neo` is unreachable — see below |

The app is **resilient by design**: if the NASA feed or the API route is
unreachable for any reason (no internet during a demo, key not set yet,
rate limit hit), the frontend automatically falls back to a built-in mock
dataset with the same shape, and shows a small "demo data" note. The UI
never breaks — this is the safety net for live judging.

---

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Hosting:** Vercel (frontend + serverless functions, zero extra config)
- **Backend:** Two Vercel serverless functions
  - `/api/neo` — proxies NASA NeoWs, hides your API key, normalizes the response
  - `/api/field-report` — proxies Gemini, hides your API key, generates a
    3-sentence plain-language summary per asteroid
- **AI:** Gemini (Flash tier, free quota)
- **No database. No auth. Fully stateless.**

---

## Getting your API keys (both free, both instant, no card required)

1. **NASA:** go to [api.nasa.gov](https://api.nasa.gov), enter your email,
   get a key immediately. This raises your rate limit from `DEMO_KEY`'s
   ~30 req/hr to ~1,000 req/hr — you won't get close to that limit, but
   `DEMO_KEY` can get throttled if your whole team is testing against it
   at once.
2. **Gemini:** go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey),
   sign in, create a key. This is optional — without it, the app works
   fully, the "field report" section just shows a fallback message.

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

> ⚠️ **Note on the Gemini model name** (`api/field-report.js`): Google
> renames/retires Flash model versions periodically. If you get a 404 from
> Gemini, check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
> for the current free-tier "Flash" model id and update the
> `GEMINI_MODEL` constant at the top of that file.

---

## Running it

### Local development

```bash
npm install
npm run dev
```

This runs the Vite dev server. **The `/api/*` serverless functions do not
run under plain `npm run dev`** — any request to them will fail, and the
app will automatically show demo data instead. This is fine for UI work.

To test the real API routes locally, install the Vercel CLI and run:

```bash
npm install -g vercel
vercel dev
```

### Deploying

Push this repo to GitHub (must be **public** per ArcNight rules), then:

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add `NASA_API_KEY` and `GEMINI_API_KEY` as environment variables in the
   Vercel project settings (Settings → Environment Variables).
3. Deploy. Vercel automatically detects the Vite frontend and the
   `api/` folder as serverless functions — no extra config needed.

---

## Project structure

```
nearmiss/
├── api/
│   ├── neo.js              # NASA NeoWs proxy + normalization
│   ├── field-report.js     # Gemini proxy — per-asteroid field report
│   └── _lib/
│       └── normalize.js    # Shared: raw NASA feed -> normalized schema
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Data fetching, live clock, layout
│   ├── index.css            # Tailwind + starfield background
│   ├── data/
│   │   └── mockAsteroids.js # Offline/demo fallback dataset
│   ├── utils/
│   │   ├── risk.js          # Risk tier classification + color metadata
│   │   ├── sizeLabel.js      # Human-scale size comparisons
│   │   ├── liveDistance.js   # Live counter + relative time labels
│   │   └── hash.js            # Deterministic id -> angle for canvas
│   └── components/
│       ├── DisclaimerBanner.jsx
│       ├── Hero.jsx
│       ├── OrbitalCanvas.jsx     # Radial approach map (signature visual)
│       ├── AsteroidList.jsx
│       ├── AsteroidCard.jsx
│       ├── DetailModal.jsx
│       ├── SizeComparison.jsx
│       ├── LiveCounter.jsx
│       ├── HistoricalContext.jsx
│       └── Footer.jsx
├── .env.example
└── README.md
```

---

## Normalized asteroid shape

Both the live API and the mock dataset produce objects in this shape —
every component downstream consumes exactly this:

```ts
{
  id: string;
  name: string;
  jplUrl: string;
  absoluteMagnitude: number;
  diameterMeters: { min: number; max: number };
  isHazardous: boolean;
  approachDate: string;     // ISO timestamp
  approachEpoch: number;    // ms since epoch
  velocityKmS: number;
  missDistanceKm: number;
  missDistanceLD: number;   // 1 LD = 384,400 km
  orbitingBody: string;

  // added client-side by App.jsx:
  riskLevel: "hazardous" | "watch" | "notable" | "routine";
  sizeRef: { max: number; label: string; emoji: string };
}
```

---

## Design notes

- **Dark theme is intentional**, not a default — this is a space app and
  the entire palette (`tailwind.config.js`) is built around it: deep
  near-black background, a warm signal-orange accent reserved for the live
  counter and key highlights, and four risk colors (hazardous / watch /
  notable / routine) used consistently across the canvas, cards, and modal.
- **Typography:** Sora (display/headings), Inter (body), IBM Plex Mono
  (every number — distances, velocities, timestamps). The mono treatment
  for data is the "mission control readout" signature that ties the whole
  UI together.
- **The radial canvas** is a stylized diagram, not a real orbital
  simulation — distance from Earth (center) maps to miss distance on a log
  scale, angle is a deterministic hash of each asteroid's id. This was a
  deliberate scope cut: true orbital element rendering would need a
  separate NASA `lookup` call per asteroid, which isn't worth the latency
  for a 24-hour build.

---

## Disclaimer (required, do not remove)

> Data sourced from NASA JPL's Near-Earth Object program. These objects
> will **not** impact Earth unless explicitly classified as hazardous
> **and** stated otherwise.

This is shown as a banner at the top of the app at all times.
