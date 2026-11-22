# Space Sentinel Hybrid AI (خلائی نگہبان)

**Space Sentinel Hybrid AI (خلائی نگہبان)** is a multilingual, voice-friendly space weather monitoring and advisory web application. It translates live solar and geomagnetic telemetry from NOAA’s Space Weather Prediction Center (SWPC) into plain, everyday language—defaulting to Urdu alongside English, Hindi, Telugu, and Kannada—with hybrid cloud/on-device AI and a practical offline local guide for mobile users.

- **Live Demo:** https://space-sentinel-hybrid-ai-app.onrender.com
- **GitHub Repository:** https://github.com/mohammaduzair1308-lab/space-sentinel-hybrid-ai-app-

---

## Purpose & Problem Solved

Official space weather reports (X-ray solar flare classes, `Kp` geomagnetic indices, real-time solar wind speeds, and SWPC alerts) are typically technical, English-only, and difficult for everyday users or people with limited reading and typing comfort to interpret.

Space Sentinel Hybrid AI solves this by:
- Converting complex scientific telemetry into clear, everyday explanations (such as whether phone maps, GPS, signals, or power systems are affected).
- Offering a dedicated **Easy Use (`آسان استعمال`)** mode with large numbered touch buttons, one-tap prompts, and spoken voice output.
- Preserving scientific honesty—clearly separating current 1-minute readings from upcoming warnings/forecasts, displaying exact cache age when offline, and avoiding exaggerated storm claims (e.g., `Kp 4` is active unrest, while `G1` storms begin at `Kp 5`).

---

## Key Features

- **Dual Interface Modes (`WelcomeView`):**
  - **Easy Use Mode (`EasyUseView`):** Six large numbered buttons (*Today’s Space Weather, Sun Status, Earth Impact, Danger Warnings, Listen to All in Voice, Ask AI*), voice command menu navigation, and one-tap AI questions.
  - **Full Information Mode:** Interactive dashboard (`HomeDashboardView`), historical trend charts (`SolarTrendChart`), orbital visualization (`OrbitalCanvas`), deep-dive space weather topics (`SpaceWeatherView`), 3-day official NOAA forecast & alerts (`AlertsView`), standalone HTML report export, saved favorites, and full multi-thread AI chat (`SpaceHelperView`).
- **Live NOAA Space Weather Feed (`/api/solar/live`):**
  - Fetches live JSON feeds from `services.swpc.noaa.gov` (`planetary_k_index_1m.json` with `noaa-planetary-k-index.json` fallback, `xrays-6-hour.json`, `rtsw_wind_1m.json` with `solar-wind-speed.json` fallback, `alerts.json`, and `noaa-scales.json`).
  - Tracks true measurement timestamps (`kpObservedAtIso`, `xrayObservedAtIso`, `windObservedAtIso`) and falls back transparently to `localStorage` cached snapshots with visible age labels when offline.
- **Hybrid AI Architecture (`src/utils/hybridAi.ts`):**
  - **Firebase AI Logic (`firebase/ai`):** Uses `GoogleAIBackend` (`gemini-2.5-flash`) with real hybrid routing:
    - `InferenceMode.PREFER_ON_DEVICE`: Used for short, single-turn English prompts when on-device preference is enabled—runs **Gemini Nano** on supported Desktop Chrome (`window.LanguageModel`) if ready, otherwise seamlessly runs `gemini-2.5-flash` in Firebase Cloud.
    - `InferenceMode.ONLY_IN_CLOUD`: Used for Urdu, Hindi, Telugu, Kannada, longer English prompts, and multi-turn chat conversations.
    - `InferenceMode.ONLY_ON_DEVICE`: Used when offline (or when Cloud is temporarily unavailable) on Desktop Chrome if Gemini Nano is initialized for short, single-turn English questions.
  - **Explicit Model Initialization & Runtime Proof:** Users can click **Initialize / Download Gemini Nano** (in **Settings** or inline in **Ask AI** when supported) to invoke `GenerativeModel.initializeDeviceModel(onDownloadProgress)` with real download progress percentage. Every reply checks `result.response.inferenceSource` (`InferenceSource.ON_DEVICE` vs `InferenceSource.IN_CLOUD`) to display its true source badge.
  - **Server-Side Gemini Backup (`/api/gemini/chat`):** Uses `@google/genai` on Express (`gemini-3.1-flash-lite` with `gemini-4-hydrogen` fallback) grounded in live/cached telemetry if client-side Firebase AI Logic cannot complete.
  - **Offline Local Guide (`src/utils/offlineAiEngine.ts`):** Runs 100% locally with zero network calls when internet is unavailable and on-device Gemini Nano cannot handle the request (such as on mobile Chrome or for Urdu/non-English/multi-turn chats).
- **Firebase App Check (`src/firebase.ts`):**
  - Integrates `ReCaptchaEnterpriseProvider` with auto token refresh for Firebase AI Logic and Firebase requests.
- **5 Languages (`src/data/localization.ts`):**
  - **Urdu** (`ur`, default RTL), **English** (`en`), **Hindi** (`hi`), **Telugu** (`te`), and **Kannada** (`kn`), with localized digits and timestamps.
- **Multilingual Voice & TTS (`src/utils/voiceAlert.ts` & `/api/tts`):**
  - Checks local browser `SpeechSynthesis` voices first (including `ur-IN`, `ur-PK`, `ur`) and automatically uses `/api/tts` (`gemini-3.8-flash-lite-tts` / `gemini-3.8-flash-tts` with chunked audio fallback) via Web Audio `AudioContext` for mobile Chrome and Safari compatibility.
- **Offline App-Shell Caching (`public/sw.js`):**
  - Production-only lightweight Service Worker caches static app-shell assets so the app can still open and run its Offline Local Guide when mobile data is turned off, without intercepting `/api/*` endpoints.
- **Cloud Sync (Optional):**
  - Google Sign-In (`firebase/auth`) and per-user Cloud Firestore persistence (`conversations`, `favorites`, and profile language settings).

---

## Online AI vs. Offline Local Guide (Honest Capabilities)

Space Sentinel clearly distinguishes between four AI execution paths using real runtime `inferenceSource` checks and never mislabels offline behavior:

1. **On-Device Gemini Nano (`ON_DEVICE — Gemini Nano` / `firebase-ai-on-device`):**
   - Runs **only** on supported Desktop Chrome exposing `window.LanguageModel` after explicit `initializeDeviceModel()` readiness, for short single-turn English prompts (both online via `InferenceMode.PREFER_ON_DEVICE` and offline via `InferenceMode.ONLY_ON_DEVICE`), verified directly via `result.response.inferenceSource === InferenceSource.ON_DEVICE`.
   - **Important limitation:** Production **Android mobile Chrome** does not currently expose Gemini Nano (`window.LanguageModel`) to standard web apps, and downloading large WebGPU models (400 MB–1.5 GB) is impractical on typical mobile devices. The app probes `window.LanguageModel` honestly and reports `"unsupported"` when absent—it never falsely claims Gemini Nano is running on Android Chrome.
2. **Firebase AI Logic Cloud (`IN_CLOUD — Firebase AI Logic` / `firebase-ai-cloud`):**
   - Primary online cloud path (`gemini-2.5-flash` via `GoogleAIBackend`) for Urdu, Hindi, Telugu, Kannada, multi-turn chats (`ONLY_IN_CLOUD`), and English fallback when Gemini Nano is not yet downloaded (`PREFER_ON_DEVICE` verified via `InferenceSource.IN_CLOUD`).
3. **Server Gemini Backup (`SERVER BACKUP — /api/gemini/chat` / `server-gemini`):**
   - Authenticated Express fallback using `@google/genai` grounded in live/cached telemetry whenever client-side Firebase AI Logic encounters network, quota, or App Check interruption.
4. **Offline Local Guide (`OFFLINE LOCAL GUIDE — Saved Local Data` / `offline-local-guide`):**
   - A fast, deterministic, zero-download local Q&A engine (`src/utils/offlineAiEngine.ts`) built for real mobile offline reliability and non-English offline support.
   - When internet is disconnected on Android Chrome—or for Urdu, Hindi, Telugu, Kannada, and multi-turn questions offline—it answers core questions (current solar storm state, phone GPS/maps impact, `Kp` number meaning, solar flares, solar wind, tomorrow’s outlook/warnings, human/grid safety, and offline behavior) using the device’s cached NOAA telemetry.
   - Replies are transparently labeled **OFFLINE LOCAL GUIDE — Saved Local Data** / **OFFLINE LOCAL GUIDE — محفوظ مقامی معلومات**.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4, Lucide React, Motion
- **Backend:** Node.js, Express 4, `tsx` (dev runner), `@google/genai`
- **Firebase:** Firebase Web SDK v13 (`firebase/app`, `firebase/ai`, `firebase/app-check`, `firebase/auth`, `firebase/firestore`)
- **External Data Source:** NOAA Space Weather Prediction Center (SWPC) public JSON feeds

---

## How to Use the App

1. **Choose a Mode:** On the welcome screen, pick **Easy Use (`آسان استعمال`)** for large numbered buttons and voice-guided reading, or **Full Information (`مکمل معلومات`)** for charts, technical scales, and chat history.
2. **Select Language:** Switch anytime between Urdu, English, Hindi, Telugu, and Kannada from the header or **Settings**.
3. **Check Live Space Weather:** View current solar flare level, `Kp` magnetic index, solar wind speed, active NOAA alerts, and 3-day outlook. Tap **Refresh** to fetch live telemetry.
4. **Listen Aloud:** Tap **Listen (`سنیں`)** on Easy Use sections, alerts, or AI replies to hear spoken explanations.
5. **Ask AI (Online or Offline):** Tap a starter question, type a question, or use the mic button (where browser speech recognition is supported). You can also toggle **Test Offline Mode** in **Settings** to verify cached telemetry and the Offline Local Guide.

---

## Installation & Running Locally

### Prerequisites
- Node.js 20+ and `npm`
- A Gemini API key (for server-side `/api/gemini/chat` and `/api/tts`)
- Optional: A Firebase project (`firebase-applet-config.json`) with Auth, Firestore, Firebase AI Logic, and App Check (reCAPTCHA Enterprise) configured

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohammaduzair1308-lab/space-sentinel-hybrid-ai-app-.git
   cd space-sentinel-hybrid-ai-app-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your own values (never commit `.env`):
   ```bash
   cp .env.example .env
   ```

4. **Run in development mode (port `3000`):**
   ```bash
   npm run dev
   ```

5. **Type-check and build for production:**
   ```bash
   npm run lint
   npm run build
   ```

6. **Start production server:**
   ```bash
   NODE_ENV=production npm start
   ```

---

## Environment Variables

Only variable **names** are listed below—never commit actual keys or tokens to the repository:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Server-only | Authenticates `/api/gemini/chat` and `/api/tts` requests with Google Gemini via `@google/genai`. |
| `APP_URL` | Server / Deployment | Optional deployment base URL. |
| `PORT` | Server | Optional HTTP port (defaults to `3000`). |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | Client build-time | Public reCAPTCHA Enterprise Site Key injected at Vite build time for Firebase App Check. |
| `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN` | Dev build-time (optional) | Explicit opt-in debug token for local development only (never enabled automatically or committed). |

---

## Security & Firebase App Check

- **Server-Side API Key Protection:** `GEMINI_API_KEY` is read strictly inside `server.ts` and is never exposed in client-side Vite bundles.
- **Firebase App Check:** `src/firebase.ts` initializes `ReCaptchaEnterpriseProvider` whenever `VITE_FIREBASE_APPCHECK_SITE_KEY` is provided in the build environment. Auto debug-token forcing (`FIREBASE_APPCHECK_DEBUG_TOKEN = true`) is disabled unless explicitly opted in during development, ensuring production deployments (e.g., Render) perform valid reCAPTCHA Enterprise attestation for Firebase AI Logic (`X-Firebase-AppCheck`).
- **Firestore Security Rules (`firestore.rules`):** Default-deny catch-all rule (`allow read, write: if false`), strict authentication checks (`isSignedIn`, `isVerifiedUser`), owner-only access (`request.auth.uid == userId`), field allowlists, and type/size validation across profiles, conversations, messages, and favorites.

---

## Future Plans

- **True On-Device Mobile LLM Integration:** Connect directly to native mobile browser AI / WebNN / Android AICore APIs once Android Chrome exposes local Gemini Nano inference to standard web apps.
- **Offline Audio Briefings Cache:** Pre-cache synthesized Urdu/multilingual audio summaries in Cache Storage / IndexedDB for instant offline playback even on phones without local Urdu TTS voices.
- **Full Installable PWA Support:** Add a Web App Manifest and adaptive app icons (`192x192`, `512x512`, `apple-touch-icon`) for one-tap home-screen installation on Android and iOS.
- **Expanded Regional Impact Advisories:** Add optional user-selected latitude/region presets for aurora visibility and high-latitude aviation or power-grid notes.

---

## License

This project is licensed under the **Apache License 2.0** (`Copyright 2026 Mohammad Hasib`). See the [LICENSE](./LICENSE) file for the full license text or view it online at https://www.apache.org/licenses/LICENSE-2.0.

