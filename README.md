<div align="center">

# ☄️ NearMiss

### *Mission-Control Interface for Near-Earth Asteroid Tracking*

**Built for ArcNight 2026 · Microsoft Innovations Club · VIT Chennai · SpaceTech Domain**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nearmiss.vercel.app-orange?style=for-the-badge&logo=vercel)](https://near-miss-ruby.vercel.app/)
[![NASA NeoWs](https://img.shields.io/badge/Data-NASA%20NeoWs%20API-blue?style=for-the-badge&logo=nasa)](https://api.nasa.gov)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![React 18](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

*Right now, NASA is tracking dozens of asteroids flying past Earth.*
*Here's how close — and what that actually means.*

</div>

---

## 🚀 The Problem

Space data is real. NASA publishes a live feed of every near-Earth asteroid tracked this week — their distances, velocities, sizes, and hazard classifications. The problem is that the raw numbers are completely opaque to anyone without an astrophysics background. What does **"0.034 AU"** mean? Is **"Potentially Hazardous"** a code-red emergency or just a label?

**NearMiss bridges that gap.** It takes the NASA Near-Earth Object (NeoWs) live feed and translates every data point into something a complete stranger can understand in five seconds. It replaces "0.034 AU" with a live, ticking closing-distance counter. It replaces abstract diameters with size comparisons to the Eiffel Tower or the Burj Khalifa. And it wraps each asteroid in a Gemini-powered, plain-language field report — no jargon, no alarm, just context.

---

## 💡 Features at a Glance

| Feature | Description |
|---|---|
| 🛰️ **Live NASA Feed** | Pulls 7-day asteroid approach data from NASA NeoWs, refreshed on every page load |
| ⏱️ **Live Closing-Distance Counter** | Ticks down in real time based on actual velocity — updated every second |
| 🗺️ **Radial Orbital Canvas** | Mission-control style interactive map of this week's approaches, rendered on HTML5 Canvas |
| 🌡️ **4-Tier Risk Classification** | Custom `Hazardous / Watch / Notable / Routine` system layered on top of NASA's PHA flag |
| 📏 **Human-Scale Size Comparisons** | 10-tier scale from "a car" to "dwarf planet Pluto" with visual comparison bars |
| 🤖 **AI Field Reports (Gemini)** | Location-aware, 3–4 sentence plain-language summaries generated per asteroid, on demand |
| 📡 **Local Sky Correlator** | Uses browser GPS to tell you where the asteroid is in your sky right now (compass + altitude + constellation) |
| 🔭 **NASA APOD Widget** | Astronomy Picture of the Day pulled from NASA's APOD API, shown alongside asteroid data |
| 🔍 **Global JPL Database Search** | Search any asteroid by name/designation across NASA's full Small Body Database |
| 📅 **Historical Date Navigation** | Browse past approach feeds by date (historical archive mode) |
| 📊 **Week-on-Week Delta Cards** | Compares current week's detections vs. the prior week for total count, hazardous count, and closest approach |
| 🎮 **Arcade Theme Toggle** | Full alternate retro-terminal theme with scan-line aesthetics, VT323 font, and neon glows |
| 🃏 **Shareable Scan Cards** | Generates a downloadable 800×600 canvas card per asteroid with mission-control telemetry layout |
| 📬 **Toast Notification System** | Non-blocking status messages for API events, rate limits, and fallback triggers |
| 🔇 **Zero-Break Demo Mode** | Automatically falls back to a built-in mock dataset if the NASA API is unreachable — the UI never breaks |

---

## 🧱 Architecture Overview

NearMiss is a **fully stateless, serverless application**. There is no database, no user accounts, and no persistent state beyond what the browser holds in memory. Every page load fetches live data.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (React 18)                      │
│                                                                 │
│  useAsteroidFeed() ──► /api/neo ──► NASA NeoWs API              │
│  useAsteroidFeed() ──► /api/neo?start={prev} ──► (week delta)   │
│                                                                 │
│  DetailModal ──────► /api/field-report ──► Google Gemini API    │
│  Local Sky Btn ──► navigator.geolocation ──► Gemini (+ coords) │
│                                                                 │
│  APODWidget ───────► /api/apod ──────────► NASA APOD API        │
│                                                                 │
│  GlobalSearch ─────► /api/search ────────► JPL SBDB API         │
│                                  └──────► JPL CAD API           │
│                                                                 │
│  OrbitalCanvas ────► (pure client, no extra API calls)          │
└─────────────────────────────────────────────────────────────────┘
         │                     │
         ▼                     ▼
  Vercel Edge CDN       Vercel Serverless Functions
  (frontend + cache)    (API key proxy + normalization)
```

All API keys are handled **exclusively in serverless functions** — they are never exposed to the browser. The frontend communicates only with `/api/*` routes on the same origin.

---

## ⚙️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 (functional components + hooks) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 (custom design system) |
| Canvas | HTML5 Canvas API (no libraries) |
| Fonts | Sora (headings), Inter (body), IBM Plex Mono (data) |
| Icons | Lucide React |

### Backend (Serverless)
| Route | Purpose | External API |
|---|---|---|
| `GET /api/neo` | NASA NeoWs proxy, normalization, 10-min cache | NASA NeoWs |
| `POST /api/field-report` | Gemini AI proxy, rate-limited, prompt-injection safe | Google Gemini 2.5 Flash |
| `GET /api/apod` | NASA APOD proxy, 1-hour cache | NASA APOD |
| `GET /api/search` | JPL SBDB + CAD dual-API search | JPL SBDB + JPL CAD |
| `GET /api/health` | Health check endpoint | — |

### Infrastructure
- **Hosting:** Vercel (zero-config, auto-detects Vite + `/api/` functions)
- **CDN Caching:** `s-maxage` headers on `/api/neo` (600s) and `/api/apod` (3600s)
- **No database. No auth. Fully stateless.**

---

## 🔬 Deep Dive: Key Systems

### 1. Data Pipeline

Raw NASA data is normalized in a single shared function (`api/_lib/normalize.js`), producing a clean, typed schema that every component consumes. This guarantees that the live feed and the offline mock dataset have exactly the same shape — no component ever needs to handle two data formats.

```
NASA NeoWs raw response
        │
        ▼
normalizeFeed()                   ← api/_lib/normalize.js
  ├── Flatten date-keyed objects
  ├── Parse miss distance (km → LD conversion: 1 LD = 384,400 km)
  ├── Parse velocity (km/s)
  ├── Extract diameter range (min/max, meters)
  └── Sort by missDistanceLD ASC
        │
        ▼
enrich()                          ← src/hooks/useAsteroidFeed.js
  ├── computeRisk() → riskLevel
  └── sizeLabel()  → sizeRef
        │
        ▼
React state (displayed everywhere)
```

### 2. Risk Classification System

NearMiss applies a custom 4-tier risk classification *on top of* NASA's binary `isHazardous` flag. This is not a prediction — it's a monitoring framing to help non-experts prioritize at a glance.

```js
// src/utils/risk.js
function computeRisk({ isHazardous, missDistanceLD, diameterMax }) {
  if (isHazardous)                               return 'hazardous'; // NASA PHA flag
  if (missDistanceLD < 10 && diameterMax > 50)   return 'watch';     // Close + large
  if (missDistanceLD < 20)                       return 'notable';   // Closer than average
  return 'routine';
}
```

Risk tiers cascade consistently through all visual layers — the canvas dot color, the card border glow, the detail modal panel style, the badge, and the shareable card all use the same risk color variables.

### 3. Gemini AI Field Reports

Each asteroid's detail modal fires a `POST /api/field-report` request. The serverless function:

1. **Sanitizes** all input fields against a strict whitelist (prevents prompt injection via asteroid name/data)
2. **Validates** latitude/longitude coordinates to prevent invalid or out-of-range GPS values
3. **Rate-limits** by IP: 10 req/min per IP, 30 req/min globally, with a 1.5s minimum interval
4. **Builds a structured prompt** calibrated for calm, non-alarmist science communication
5. **Optionally includes GPS coordinates** to generate a sky-localization sentence (compass direction, altitude angle, constellation)

```
POST /api/field-report
Body: { asteroid: {...}, latitude?: number, longitude?: number }

Prompt template (condensed):
  "Write 3 sentences:
   1. Size in human-scale comparison
   2. Hypothetical impact scenario (clearly framed)
   3. Why it will NOT hit Earth (using actual LD distance)
   [4. Where it is in YOUR sky right now, if GPS provided]"
```

The frontend uses `AbortController` + `Promise.race` for a 10-second timeout, and debounces rapid modal switches (350ms) to prevent quota drain from fast browsing.

### 4. Global JPL Database Search (`/api/search`)

This is the most complex API route. It hits **two separate NASA/JPL APIs** in sequence:

1. **JPL SBDB API** — queries the Small Body Database for an asteroid by name or designation. Handles three response cases:
   - `message.includes('not found')` → empty result
   - `list` key present → ambiguous match (multiple objects with that name), returns a selection grid
   - `object` key present → single exact match
2. **JPL CAD API** — for exact matches, fetches the full close-approach history (1950–2150) and finds the temporally-nearest approach to today, using Julian Date arithmetic.
3. **Size estimation fallback** — if no measured diameter exists, estimates size from absolute magnitude H using: `d = 10^((6.259 - H) / 5) × 1000 m` with ±30% uncertainty bounds.

The result is normalized to the same asteroid schema and opened directly in the detail modal.

### 5. Radial Orbital Canvas

`OrbitalCanvas.jsx` renders a stylized mission-control-style approach diagram on an HTML5 Canvas. It:

- Places Earth at the center, with animated concentric orbit rings
- Maps miss distance to radial position using a **log scale** (so 1 LD and 100 LD are both visible)
- Assigns each asteroid a deterministic angle using `hash.js` (a stable, collision-resistant integer hash of the asteroid's ID) — ensuring the map looks consistent across re-renders without being random
- Renders asteroid dots with risk-tier colors, labels, and click-to-select hit testing
- Animates with `requestAnimationFrame` via `useOrbitalAnimation.js` (8KB hook)

The canvas is **not** a real orbital simulation — true rendering would require a separate JPL lookup per asteroid for orbital elements, which adds unacceptable latency for a live hackathon build.

### 6. Resilient Fallback System

```
useAsteroidFeed() attempts:
  1. fetch('/api/neo')          ──► NASA API (live)
     └── on fail (any error):
  2. getMockAsteroids()         ──► Built-in mock dataset
     └── Sets isDemoData = true
     └── Shows toast: "Displaying simulated offline data."
```

The mock dataset is a hardcoded array of realistic-looking asteroids that partition cleanly into "this week" and "last week" buckets. Both the live and mock paths go through the same `enrich()` function, so every downstream component behaves identically regardless of the data source.

This was a deliberate engineering decision — **the app cannot crash during a live demo**, regardless of internet connectivity, rate limits, or API keys.

### 7. Live Closing-Distance Counter

`LiveCounter.jsx` + `liveDistance.js` compute a **real-time kilometer countdown** every second:

```
distance(t) = missDistanceKm - velocityKmS × (t - approachEpoch) / 1000
```

Post-approach, it counts back up (the asteroid is now receding). A `setInterval` in the component updates every 1000ms, using the asteroid's actual `velocityKmS` and `approachEpoch` from the NASA feed.

### 8. Shareable Scan Cards

`handleShareCard()` in `DetailModal.jsx` programmatically renders an 800×600 PNG using the Canvas 2D API — no screenshot libraries, no puppeteer, fully client-side:

1. Draws background, grid lines, and panel borders
2. Renders a procedural NearMiss logo (planet + asteroid bezier trajectory)
3. Draws animated size-comparison bars (human / reference object / asteroid)
4. Embeds the AI report excerpt or a fallback telemetry sentence
5. Adds watermark footer

Attempts `navigator.share()` (Web Share API) first for mobile, falls back to `navigator.clipboard.write()` for desktop image copy, then falls back to anchor-click download.

---

## 📐 Normalized Asteroid Schema

Every component in the app consumes data in exactly this shape — produced by both the live NASA feed and the offline mock:

```typescript
{
  id: string;                        // NASA SPK ID
  name: string;                      // Cleaned name (no parentheses)
  jplUrl: string;                    // NASA JPL lookup URL
  absoluteMagnitude: number;         // H magnitude (lower = larger/brighter)
  diameterMeters: {
    min: number;                     // Estimated diameter lower bound, meters
    max: number;                     // Estimated diameter upper bound, meters
  };
  isHazardous: boolean;              // NASA's Potentially Hazardous Asteroid flag
  approachDate: string;              // ISO 8601 timestamp of closest approach
  approachEpoch: number;             // ms since Unix epoch (for live counter math)
  velocityKmS: number;               // Relative velocity in km/s
  missDistanceKm: number;            // Miss distance in kilometers
  missDistanceLD: number;            // Miss distance in Lunar Distances (1 LD = 384,400 km)
  orbitingBody: string;              // Body being orbited (always "Earth" from this feed)

  // Enriched client-side (enrich() in useAsteroidFeed.js):
  riskLevel: "hazardous" | "watch" | "notable" | "routine";
  sizeRef: {
    max: number;                     // Reference object's real-world height, meters
    label: string;                   // e.g., "the Eiffel Tower"
    emoji: string;                   // e.g., "🗼"
  };
}
```

---

## 🎨 Design System

The entire UI is built around a **mission-control / planetary defense readout** aesthetic. Every design decision is intentional.

### Color Palette
```
Background: #0a0a12  (deep near-black "void")
Accent:     #f97316  (signal orange — live counter, key highlights)
---
Hazardous:  #ef4444  (red)
Watch:      #f97316  (orange)
Notable:    #eab308  (yellow)
Routine:    #22c55e  (green)
---
Cyan:       #22d3ee  (telemetry labels, canvas elements)
Dim:        #64748b  (secondary text)
```

### Typography
| Use | Font | Rationale |
|---|---|---|
| Display headings | Sora | Clean, geometric, space-appropriate |
| Body text | Inter | High legibility at small sizes |
| **All numbers** | IBM Plex Mono | Mission-control readout aesthetic — creates an immediate "data terminal" feel |

The monospace treatment for every distance, velocity, and timestamp is the design's signature — it makes the data feel like it's coming off a real tracking system.

### Arcade Theme
A full alternate theme is togglable via the header button. It swaps:
- Fonts: `Sora/Inter/IBM Plex Mono` → `VT323/Orbitron`  
- Borders: slate → neon cyan `#00F0FF`
- Accent: orange → hot pink `#FF007F`
- All text: Mixed case → `ALL CAPS` with `>` prompt prefixes
- Background: `0x0a0a12` → `0x05050A` (deeper void)

---

## 📁 Project Structure

```
nearmiss/
│
├── api/                          # Vercel Serverless Functions
│   ├── neo.js                    # NASA NeoWs proxy (GET, cached 10 min)
│   ├── field-report.js           # Gemini AI proxy (POST, rate-limited)
│   ├── apod.js                   # NASA APOD proxy (GET, cached 1 hr)
│   ├── search.js                 # JPL SBDB + CAD dual-search (GET)
│   ├── health.js                 # Health check endpoint (GET)
│   └── _lib/
│       └── normalize.js          # NASA raw feed → typed asteroid array
│
├── src/
│   ├── main.jsx                  # React root mount
│   ├── App.jsx                   # Root: data fetching, state, routing
│   ├── index.css                 # Tailwind base + custom design tokens + starfield
│   │
│   ├── hooks/
│   │   ├── useAsteroidFeed.js    # Live + fallback data loading, week-delta fetching
│   │   ├── useLiveTime.js        # Per-second clock hook for live counter
│   │   └── useOrbitalAnimation.js # Canvas animation loop (rAF-based)
│   │
│   ├── utils/
│   │   ├── risk.js               # computeRisk() + RISK_META color map
│   │   ├── sizeLabel.js          # 10-tier human-scale size classification
│   │   ├── liveDistance.js       # Real-time km distance computation
│   │   ├── historicalEvents.js   # 5-event impact analogue database
│   │   ├── hash.js               # Deterministic ID → canvas angle hash
│   │   ├── hitTest.js            # Canvas point-in-circle hit testing
│   │   └── asteroidShape.js      # Canvas asteroid polygon renderer
│   │
│   ├── data/
│   │   └── mockAsteroids.js      # Built-in offline dataset (same schema as live)
│   │
│   └── components/
│       ├── DisclaimerBanner.jsx  # Fixed top disclaimer (never removed)
│       ├── Header.jsx            # Logo + arcade theme toggle
│       ├── Hero.jsx              # Live count headline + nearest/drama/delta cards
│       ├── Controls.jsx          # Date picker, risk filter, sort, search
│       ├── OrbitalCanvas.jsx     # Interactive radial approach map
│       ├── AsteroidList.jsx      # Paginated, filterable card grid
│       ├── AsteroidCard.jsx      # Single asteroid card with risk badge
│       ├── DetailModal.jsx       # Full telemetry modal (AI report, sky scan, share)
│       ├── LiveCounter.jsx       # Real-time ticking kilometer display
│       ├── SizeComparison.jsx    # Visual size bar comparison (3 columns)
│       ├── APODWidget.jsx        # NASA Astronomy Picture of the Day
│       ├── HistoricalContext.jsx # Impact history reference section
│       ├── Toast.jsx             # Non-blocking status notification
│       └── Footer.jsx            # Disclaimer + attribution
│
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── vite.config.js                # Vite config (React plugin)
├── tailwind.config.js            # Custom design system tokens
└── package.json
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A free NASA API key (optional but recommended)
- A free Gemini API key (optional — AI reports degrade gracefully without it)

### 1. Get API Keys (both free, both instant, no card required)

**NASA API Key:**
1. Visit [api.nasa.gov](https://api.nasa.gov)
2. Enter your email and click "Sign Up"
3. Key arrives instantly in your inbox
4. Upgrades your rate limit from `DEMO_KEY` (~30 req/hr) to ~1,000 req/hr

**Gemini API Key:**
1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click "Create API Key"
4. Optional — without it, field reports show a fallback message; everything else works

> ⚠️ **Gemini model names change frequently.** If you get a 404 from `/api/field-report`, check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) for the current free-tier Flash model ID and update `GEMINI_MODEL` at the top of `api/field-report.js`. Currently set to `gemini-2.5-flash`.

### 2. Install & Configure

```bash
git clone https://github.com/your-username/nearmiss.git
cd nearmiss

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Edit `.env`:
```env
NASA_API_KEY=your_nasa_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run Locally

```bash
npm run dev
```

This starts the Vite dev server. **Note:** The `/api/*` serverless functions do NOT run under `npm run dev`. Any request to them returns a 404, and the app automatically falls back to demo data. This is expected behavior and fine for UI development.

To test the live API routes locally, install the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` runs the full serverless function emulation alongside the Vite frontend.

### 4. Deploy

```bash
# Push to GitHub (repo must be public per ArcNight rules)
git push origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new) and import the repository
2. Add environment variables in **Settings → Environment Variables**:
   - `NASA_API_KEY` = your NASA key
   - `GEMINI_API_KEY` = your Gemini key
3. Click Deploy

Vercel auto-detects the Vite frontend and the `api/` folder as serverless functions. No extra configuration needed.

---

## ✅ What's Real vs. What's Mocked

| Feature | Status | Notes |
|---|---|---|
| NASA NeoWs live feed | ✅ **Real** | `/api/neo` — proxied, 10-min CDN cache |
| Risk classification | ✅ **Real** | `computeRisk()` runs on live data |
| Live closing-distance counter | ✅ **Real** | Uses actual velocity from NASA feed, ticks every second |
| Radial approach map | ✅ **Real** | Canvas positions reflect real miss-distance ratios (log scale) |
| Gemini AI field reports | ✅ **Real** | Lazy-loaded per asteroid, rate-limited, degrades gracefully |
| Local sky correlator (GPS) | ✅ **Real** | Browser geolocation → Gemini prompt injection |
| JPL global asteroid search | ✅ **Real** | Hits live SBDB + CAD APIs |
| NASA APOD widget | ✅ **Real** | Daily astronomy photo from NASA |
| Week-on-week delta comparison | ✅ **Real** | Fetches two separate 7-day windows in parallel |
| Historical impact cards | ⚠️ Static | Chelyabinsk, Tunguska, Ries, Chicxulub — curated, not live |
| Size comparison icons | ℹ️ Emoji | No external assets — intentional |
| Demo fallback data | 🔄 Auto | Activates automatically on any API failure |

---

## 🧠 Challenges & Engineering Decisions

**Real-Time Math Without Janking the UI**
The live counter uses a `setInterval` (not `requestAnimationFrame`) at 1-second resolution — fast enough for a live feel, slow enough to not burn CPU. The orbital canvas animation uses `rAF` with a computed `deltaTime` to stay frame-rate independent.

**Prompt Injection Defense**
The asteroid name field is user-controlled data that gets embedded in an LLM prompt. `field-report.js` strips all non-alphanumeric characters from the name before building the prompt, whitelists only numeric fields from the asteroid object, and validates coordinate ranges strictly. A bad actor cannot inject arbitrary text into the Gemini prompt through a crafted asteroid name.

**Log-Scale Canvas**
A linear miss-distance scale on the orbital canvas would render everything either in a tiny cluster near Earth or all spread out at the edge. A log scale (base 10) distributes the approaches meaningfully while still reflecting relative distances accurately enough for visualization purposes.

**Deterministic Canvas Angles**
Asteroid angles on the radial map are computed as `hash(id) % 360`. This means the same asteroid always appears at the same angle, making the map feel stable across re-renders, date changes, and filter toggles — without introducing any randomness or storing per-session state.

---

## 🗺️ What's Next for NearMiss

- [ ] **True Orbital Rendering** — Fetch actual orbital elements from JPL Horizons and render real heliocentric paths
- [ ] **Push Notification Alerts** — Subscribe to email/SMS when a new "Hazardous" object is added to the feed
- [ ] **Comparative Timeline** — Year-over-year animated timeline of detection frequency
- [ ] **3D WebGL Scene** — Three.js orbital model with zoom and tilt
- [ ] **PWA Offline Mode** — Service worker to cache the last known feed for full offline browsing
- [ ] **Internationalization** — Translate unit systems and UI language for global accessibility

---

## 👥 Team

| Name | Role |
|---|---|
| Anshuman & Jyotirmaya | Full-Stack Engineering, UI/UX Design |
| Alok Kumar | AI Integration, Prompt Engineering |
| Abhishek Kumar | Data Pipeline, Visualization |

*Built in ~24 hours for ArcNight 2026.*

---

## ⚖️ License

MIT — see [LICENSE](./LICENSE) for details.

---

## 📄 *Disclaimer* 

> Data sourced from NASA JPL's Near-Earth Object program via the NeoWs API. These objects will **not** impact Earth unless explicitly classified as hazardous **and** stated as such by official NASA sources. NearMiss is an educational visualization tool, not an official planetary defense system. All AI-generated field reports are for informational context only and should not be interpreted as scientific predictions.

This disclaimer is displayed as a persistent banner at the top of the application at all times.

---

<div align="center">

Made with ☄️ and too much coffee during ArcNight 2026

*NASA data · Google Gemini AI · Open source*

</div>
