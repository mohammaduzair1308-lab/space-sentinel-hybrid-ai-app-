import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in very simple, warm, everyday spoken English that anyone can easily understand. Avoid technical jargon and long academic words. Do not mix in words from any other language.',
  ur: 'Respond strictly in simple, everyday conversational Urdu (عام بول چال کی آسان اردو) that someone with basic schooling can understand right away. Use ONLY Urdu script. Do NOT use any English words, Latin letters, acronyms (like GPS, NOAA, Kp, AM, PM), or difficult literary/Persianized words. Say "سرکاری خلائی مرکز" instead of NOAA, "راستہ بتانے والا نظام" instead of GPS, and explain numbers clearly in plain Urdu.',
  hi: 'Respond strictly in simple, everyday spoken Hindi (रोज़मर्रा की आसान बोलचाल की हिन्दी) in Devanagari script. Do NOT use any English words, Latin letters, or heavy Sanskritized textbook words. Say "सरकारी अंतरिक्ष केंद्र" instead of NOAA and "रास्ता बताने वाला सिस्टम" instead of GPS.',
  te: 'Respond strictly in simple, everyday spoken Telugu (రోజువారీ సులభమైన తెలుగు) in Telugu script. Do NOT use any English words, Latin letters, or heavy literary words. Explain space weather in plain everyday language.',
  kn: 'Respond strictly in simple, everyday spoken Kannada (ದಿನನಿತ್ಯದ ಸರಳ ಆಡುಭಾಷೆಯ ಕನ್ನಡ) in Kannada script. Do NOT use any English words, Latin letters, or difficult textbook words. Explain space weather in plain everyday language.',
};

const TTS_STYLE_BY_LANG: Record<string, string> = {
  en: 'Warm, clear, friendly everyday English speaker at a calm, easy-to-follow pace.',
  ur: 'Warm, clear, natural everyday Pakistani Urdu speaker pronouncing Urdu clearly at a calm pace.',
  hi: 'Warm, clear, natural everyday Indian Hindi speaker at a calm, easy pace.',
  te: 'Warm, clear, natural everyday Telugu speaker at a calm, easy pace.',
  kn: 'Warm, clear, natural everyday Kannada speaker at a calm, easy pace.',
};

// Small in-memory cache for repeated UI prompts & Easy Use sections
const ttsCache = new Map<string, { audioBase64: string; mimeType: string; ttsProvider: string }>();
const geminiTtsCooldownUntil = new Map<string, number>();

const FALLBACK_TTS_LANG_MAP: Record<string, string> = {
  ur: 'ur',
  en: 'en',
  hi: 'hi',
  te: 'te',
  kn: 'kn',
};

function trimTextAtBoundary(raw: string, maxLen = 920): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const slice = cleaned.slice(0, maxLen);
  const lastStop = Math.max(
    slice.lastIndexOf('۔'),
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?'),
    slice.lastIndexOf(' '),
  );
  return lastStop > maxLen * 0.6 ? slice.slice(0, lastStop + 1).trim() : slice.trim();
}

function splitTextForFallbackTts(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const segments = cleaned.split(/(?<=[۔.!?،,;:\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const seg of segments) {
    const candidate = current ? `${current} ${seg}` : seg;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      current = '';
    }
    if (seg.length <= maxLen) {
      current = seg;
    } else {
      const words = seg.split(' ');
      for (const w of words) {
        const nextWord = current ? `${current} ${w}` : w;
        if (nextWord.length <= maxLen) {
          current = nextWord;
        } else {
          if (current) chunks.push(current);
          current = w.slice(0, maxLen);
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function fetchFallbackTtsChunk(url: string, timeoutMs = 9000): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124.0 Mobile Safari/537.36',
          Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
        },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 256) return buf;
      }
    } catch {
      // Retry once on transient error
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function generateFallbackTtsAudio(
  text: string,
  language: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  const tl = FALLBACK_TTS_LANG_MAP[language] ?? 'en';
  const chunks = splitTextForFallbackTts(text, 180);
  if (chunks.length === 0) return null;

  const mp3Parts: Buffer[] = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunk)}`;
    const buf = await fetchFallbackTtsChunk(url, 9000);
    if (!buf) return null;
    mp3Parts.push(buf);
  }

  const combined = Buffer.concat(mp3Parts);
  if (combined.length < 256) return null;
  return {
    audioBase64: combined.toString('base64'),
    mimeType: 'audio/mpeg',
  };
}

function getSharedAiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 10000): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'SpaceSentinelHybridAI/1.0 (NOAA SWPC Client)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`[NOAA] HTTP ${res.status} ${res.statusText} from ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[NOAA] ${isAbort ? `Timeout after ${timeoutMs}ms` : 'Request failed'} for ${url}: ${msg}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithRetry(url: string, timeoutMs = 10000, retries = 1): Promise<unknown | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchJsonWithTimeout(url, timeoutMs);
    if (result !== null) return result;
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
}

function parseNoaaUtcMsServer(raw: unknown): number {
  if (typeof raw !== 'string') return 0;
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(trimmed)) {
    const ms = Date.parse(`${trimmed.replace(' ', 'T')}Z`);
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ms = Date.parse(`${trimmed}T00:00:00Z`);
    return Number.isNaN(ms) ? 0 : ms;
  }
  const ms = Date.parse(trimmed);
  return Number.isNaN(ms) ? 0 : ms;
}

function toIsoOrNull(raw: unknown): string | null {
  const ms = parseNoaaUtcMsServer(raw);
  return ms > 0 ? new Date(ms).toISOString() : null;
}

interface SolarLivePayload {
  source: 'live-noaa';
  fetchedAt: string;
  officialSourceUrl: string;
  partial: boolean;
  observationTimes: {
    kpObservedAtIso: string | null;
    xrayObservedAtIso: string | null;
    windObservedAtIso: string | null;
    scalesUpdatedAtIso: string | null;
  };
  kpJson: Array<Record<string, unknown>>;
  xrayJson: Array<Record<string, unknown>>;
  plasmaJson: Array<Record<string, unknown>>;
  alertsJson: Array<Record<string, unknown>>;
  scalesJson: Record<string, unknown> | null;
}

let inFlightSolarFetch: Promise<SolarLivePayload | null> | null = null;

async function fetchLiveNoaaPayload(): Promise<SolarLivePayload | null> {
  const [kpPrimary, xrayPrimary, windPrimary, alertsRaw, scalesRaw] = await Promise.all([
    fetchJsonWithRetry('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', 10000, 1),
    fetchJsonWithRetry('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json', 10000, 1),
    fetchJsonWithRetry('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json', 14000, 1),
    fetchJsonWithRetry('https://services.swpc.noaa.gov/products/alerts.json', 9000, 1),
    fetchJsonWithRetry('https://services.swpc.noaa.gov/products/noaa-scales.json', 9000, 1),
  ]);

  let kpSource: unknown = kpPrimary;
  if (!Array.isArray(kpSource) || kpSource.length === 0) {
    console.warn('[NOAA] Primary 1m Kp feed unavailable/empty, trying products/noaa-planetary-k-index.json');
    kpSource = await fetchJsonWithRetry(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
      9000,
      1
    );
  }

  const kpRows = (Array.isArray(kpSource) ? kpSource : [])
    .filter((row): row is Record<string, unknown> => {
      if (!row || typeof row !== 'object') return false;
      const r = row as Record<string, unknown>;
      const val = r.estimated_kp ?? r.kp_index ?? r.Kp ?? r.kp;
      return typeof val === 'number' ? Number.isFinite(val) : Number.isFinite(Number(val));
    })
    .sort((a, b) => parseNoaaUtcMsServer(a.time_tag) - parseNoaaUtcMsServer(b.time_tag))
    .slice(-36);

  const xrayRowsAll = (Array.isArray(xrayPrimary) ? xrayPrimary : []).filter(
    (row): row is Record<string, unknown> => {
      if (!row || typeof row !== 'object') return false;
      const r = row as Record<string, unknown>;
      return typeof r.flux === 'number' && Number.isFinite(r.flux) && r.flux > 0;
    }
  );
  const longWaveXray = xrayRowsAll.filter(
    (r) => typeof r.energy !== 'string' || r.energy.includes('0.1-0.8')
  );
  const xrayRows = (longWaveXray.length > 0 ? longWaveXray : xrayRowsAll)
    .sort((a, b) => parseNoaaUtcMsServer(a.time_tag) - parseNoaaUtcMsServer(b.time_tag))
    .slice(-90);

  let windRows: Array<Record<string, unknown>> = [];
  if (Array.isArray(windPrimary)) {
    const validObjects = windPrimary
      .filter((row): row is Record<string, unknown> => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        const spd = Number(r.proton_speed);
        return Number.isFinite(spd) && spd > 0;
      })
      .sort((a, b) => parseNoaaUtcMsServer(b.time_tag) - parseNoaaUtcMsServer(a.time_tag));

    const activeRows = validObjects.filter((r) => r.active !== false);
    windRows = (activeRows.length > 0 ? activeRows : validObjects).slice(0, 12);
  }

  if (windRows.length === 0) {
    console.warn('[NOAA] Primary RTSW solar wind feed unavailable/empty, trying products/summary/solar-wind-speed.json');
    const windFallback = await fetchJsonWithRetry(
      'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
      8000,
      1
    );
    if (Array.isArray(windFallback)) {
      windRows = windFallback
        .filter((row): row is Record<string, unknown> => {
          if (!row || typeof row !== 'object') return false;
          const r = row as Record<string, unknown>;
          const spd = Number(r.proton_speed ?? r.WindSpeed);
          return Number.isFinite(spd) && spd > 0;
        })
        .map((r) => ({
          time_tag: r.time_tag ?? r.TimeStamp ?? null,
          proton_speed: Number(r.proton_speed ?? r.WindSpeed),
          proton_density: r.proton_density ?? null,
          active: true,
        }))
        .slice(0, 12);
    } else if (windFallback && typeof windFallback === 'object') {
      const r = windFallback as Record<string, unknown>;
      const spd = Number(r.proton_speed ?? r.WindSpeed);
      if (Number.isFinite(spd) && spd > 0) {
        windRows = [
          {
            time_tag: r.time_tag ?? r.TimeStamp ?? null,
            proton_speed: spd,
            proton_density: r.proton_density ?? null,
            active: true,
          },
        ];
      }
    }
  }

  const alertsRows = (Array.isArray(alertsRaw) ? alertsRaw : [])
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .slice(0, 8);

  const scalesObj =
    scalesRaw && typeof scalesRaw === 'object' && !Array.isArray(scalesRaw)
      ? (scalesRaw as Record<string, unknown>)
      : null;

  const hasKp = kpRows.length > 0;
  const hasXray = xrayRows.length > 0;
  const hasWind = windRows.length > 0;
  const hasScales = scalesObj !== null;

  if (!hasKp && !hasXray && !hasWind && !hasScales) {
    console.error('[NOAA] All primary and backup NOAA SWPC feeds failed.');
    return null;
  }

  const latestKp = kpRows[kpRows.length - 1];
  const latestXray = xrayRows[xrayRows.length - 1];
  const latestWind = windRows[0];
  const scale0 =
    scalesObj && scalesObj['0'] && typeof scalesObj['0'] === 'object'
      ? (scalesObj['0'] as Record<string, unknown>)
      : null;
  const scalesUpdatedAtIso =
    scale0?.DateStamp && scale0?.TimeStamp
      ? toIsoOrNull(`${String(scale0.DateStamp)}T${String(scale0.TimeStamp)}`)
      : null;

  const partial = !hasKp || !hasXray || !hasWind;
  if (partial) {
    console.warn(
      `[NOAA] Partial live payload: kp=${hasKp}, xray=${hasXray}, wind=${hasWind}, scales=${hasScales}`
    );
  }

  return {
    source: 'live-noaa',
    fetchedAt: new Date().toISOString(),
    officialSourceUrl: 'https://www.swpc.noaa.gov/',
    partial,
    observationTimes: {
      kpObservedAtIso: toIsoOrNull(latestKp?.time_tag),
      xrayObservedAtIso: toIsoOrNull(latestXray?.time_tag),
      windObservedAtIso: toIsoOrNull(latestWind?.time_tag),
      scalesUpdatedAtIso,
    },
    kpJson: kpRows,
    xrayJson: xrayRows,
    plasmaJson: windRows,
    alertsJson: alertsRows,
    scalesJson: scalesObj,
  };
}

function classifyGeminiError(err: unknown): { status: number; errorCode: string; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (/timeout|abort/i.test(msg)) {
    return { status: 504, errorCode: 'timeout', message: msg };
  }
  if (/429|quota|rate/i.test(msg)) {
    return { status: 429, errorCode: 'rate_limit', message: msg };
  }
  if (/401|403|api key|permission/i.test(msg)) {
    return { status: 502, errorCode: 'auth', message: msg };
  }
  return { status: 502, errorCode: 'unavailable', message: msg };
}

function getClientIp(req: express.Request): string {
  // Relies on Express `app.set('trust proxy', 1)` (Render single reverse-proxy hop) instead of raw X-Forwarded-For parsing.
  const rawIp = req.ip || req.socket?.remoteAddress || '';
  const normalized = rawIp.replace(/^::ffff:/i, '').trim();
  return normalized || 'unknown';
}

interface RateLimitConfig {
  name: string;
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Lightweight in-memory fixed-window per-IP rate limiter.
 * Limitation: Counters live in Node process memory, so they reset on server restart/deploy
 * and are not shared across multiple horizontal server instances.
 */
function createInMemoryRateLimiter(config: RateLimitConfig): express.RequestHandler {
  const buckets = new Map<string, RateLimitEntry>();
  const MAX_ENTRIES = 5000;

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, Math.min(config.windowMs, 60_000));
  cleanupTimer.unref?.();

  return (req, res, next) => {
    try {
      const now = Date.now();
      const ip = getClientIp(req);
      const existing = buckets.get(ip);

      let entry: RateLimitEntry;
      if (!existing || existing.resetAt <= now) {
        if (buckets.size >= MAX_ENTRIES) {
          for (const [key, val] of buckets.entries()) {
            if (val.resetAt <= now) buckets.delete(key);
          }
          if (buckets.size >= MAX_ENTRIES) {
            const oldestKey = buckets.keys().next().value;
            if (oldestKey) buckets.delete(oldestKey);
          }
        }
        entry = { count: 1, resetAt: now + config.windowMs };
        buckets.set(ip, entry);
      } else {
        existing.count += 1;
        entry = existing;
      }

      const remaining = Math.max(0, config.maxRequests - entry.count);
      const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

      res.setHeader('RateLimit-Limit', String(config.maxRequests));
      res.setHeader('RateLimit-Remaining', String(remaining));
      res.setHeader('RateLimit-Reset', String(resetSeconds));
      res.setHeader('X-RateLimit-Limit', String(config.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

      if (entry.count > config.maxRequests) {
        res.setHeader('Retry-After', String(resetSeconds));
        console.warn(`[RateLimit] ${config.name} limit exceeded`);
        res.status(429).json({
          ok: false,
          errorCode: 'rate_limit',
          error: 'Too many requests. Please wait a moment and try again.',
          retryAfterSeconds: resetSeconds,
        });
        return;
      }

      next();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[RateLimit] Limiter fallback on ${config.name}: ${msg}`);
      next();
    }
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  const chatRateLimiter = createInMemoryRateLimiter({
    name: 'gemini-chat',
    windowMs: 60_000,
    maxRequests: 20,
  });

  const ttsRateLimiter = createInMemoryRateLimiter({
    name: 'tts',
    windowMs: 60_000,
    maxRequests: 30,
  });

  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      ttsConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/solar/live', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');

    if (!inFlightSolarFetch) {
      inFlightSolarFetch = fetchLiveNoaaPayload().finally(() => {
        inFlightSolarFetch = null;
      });
    }

    const payload = await inFlightSolarFetch;
    if (!payload) {
      res.status(503).json({
        errorCode: 'noaa_unreachable',
        error: 'Unable to reach official space weather servers',
      });
      return;
    }

    res.json(payload);
  });

  app.post('/api/gemini/chat', chatRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        errorCode: 'config',
        error: 'GEMINI_API_KEY is not configured on the server',
      });
      return;
    }

    const body = req.body ?? {};
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const language = typeof body.language === 'string' ? body.language : 'en';
    const telemetry = body.telemetry ?? {};
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!question) {
      res.status(400).json({ errorCode: 'bad_request', error: 'Question is required' });
      return;
    }

    const langRule = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en;

    const fetchedIso =
      typeof telemetry.fetchedAtIso === 'string' && telemetry.fetchedAtIso
        ? telemetry.fetchedAtIso
        : typeof telemetry.lastUpdated === 'string'
          ? telemetry.lastUpdated
          : null;
    let cacheAgeMinutes: number | null = null;
    if (fetchedIso) {
      const parsedMs = new Date(fetchedIso).getTime();
      if (!Number.isNaN(parsedMs)) {
        cacheAgeMinutes = Math.max(0, Math.round((Date.now() - parsedMs) / 60000));
      }
    }

    const forecastSummary = Array.isArray(telemetry.forecastDays)
      ? telemetry.forecastDays
          .slice(0, 3)
          .map(
            (d: {
              dayOffset?: number;
              dateIso?: string;
              gScale?: string;
              rMinorProb?: number | null;
              rMajorProb?: number | null;
              sProb?: number | null;
            }) =>
              `day+${String(d.dayOffset ?? '?')}(${String(d.dateIso ?? '')}):G=${String(d.gScale ?? 'G0')},R_minor=${String(d.rMinorProb ?? 'na')}%,R_major=${String(d.rMajorProb ?? 'na')}%,S=${String(d.sProb ?? 'na')}%`
          )
          .join('; ')
      : 'unavailable';

    const yesterdaySummary = telemetry.yesterdayPeak
      ? `R=${String(telemetry.yesterdayPeak.rScale ?? 'R0')},S=${String(telemetry.yesterdayPeak.sScale ?? 'S0')},G=${String(telemetry.yesterdayPeak.gScale ?? 'G0')}`
      : 'unavailable';

    const systemInstruction = [
      'You are Space Sentinel Helper, a warm, helpful everyday guide who explains space weather simply.',
      langRule,
      'Strict scientific & honesty rules:',
      '1. Rely ONLY on the telemetry context below. Never invent measurements or local GPS meter drift; if solar wind or exact local GPS meter drift is unavailable/null, state plainly in everyday words that exact local measurement is not shown here.',
      '2. Exact NOAA G-scale: Kp 0-4 is below storm threshold (G0; Kp 4 is active unrest, NOT G1 storm). G1 minor storm starts strictly at Kp 5, G2 at Kp 6, G3 at Kp 7, G4 at Kp 8, G5 at Kp 9. Never call Kp 4 a G1 storm.',
      '3. Offline cache honesty: If source=offline-cache, clearly tell the user in everyday words that this is previously saved data AND state how old it is based on cacheAgeMinutes (e.g., X minutes or X hours old). If source=simulated, clarify it is only a practice example.',
      '4. Feed discrepancy transparency: If feedDiscrepancyKind is warning-higher-than-live or forecast-higher-than-live, explain clearly that live 1-minute readings right now are calm while an active short-term warning or 3-day outlook expects higher levels during its timeframe.',
      '5. Keep answers short (2 to 4 simple, friendly sentences). Do NOT include raw URLs in your text reply — verified official links are already attached below every message in the app.',
      `Telemetry context: source=${String(telemetry.source ?? 'unknown')}, cacheAgeMinutes=${cacheAgeMinutes ?? 'unknown'}, fetchedAtIso=${String(fetchedIso ?? 'unknown')}, flareClass=${String(telemetry.flareClass ?? 'unavailable')}, xrayObservedAtIso=${String(telemetry.xrayObservedAtIso ?? 'unavailable')}, kpIndex=${String(telemetry.kpIndex ?? 'unavailable')}, kpObservedAtIso=${String(telemetry.kpObservedAtIso ?? 'unavailable')}, geomagneticScale=${String(telemetry.geomagneticScale ?? 'unknown')}, solarWindSpeed=${String(telemetry.solarWindSpeed ?? 'unavailable')}, windObservedAtIso=${String(telemetry.windObservedAtIso ?? 'unavailable')}, radioScale=${String(telemetry.radioBlackoutScale ?? 'unknown')}, radiationScale=${String(telemetry.radiationScale ?? 'unknown')}, activeAlertsCount=${Array.isArray(telemetry.alerts) ? telemetry.alerts.length : 0}, activeWarningKp=${String(telemetry.activeWarningKp ?? 'none')}, feedDiscrepancyKind=${String(telemetry.feedDiscrepancyKind ?? 'none')}, forecast3Days=[${forecastSummary}], yesterdayPeak=[${yesterdaySummary}], officialSourceUrl=${String(telemetry.officialSourceUrl ?? 'https://www.swpc.noaa.gov/')}.`,
    ].join(' ');


    try {
      const ai = getSharedAiClient(apiKey);
      const conversationText = history
        .map((m: { sender?: string; text?: string }) =>
          `${m.sender === 'user' ? 'User' : 'Assistant'}: ${String(m.text ?? '')}`
        )
        .join('\n');

      const prompt = conversationText ? `${conversationText}\nUser: ${question}` : question;

      // Use fast verified flash-lite model with MINIMAL thinking for low-latency multilingual replies, with gemini-4-hydrogen backup
      const modelsToTry = [
        { name: 'gemini-3.1-flash-lite', timeoutMs: 14000, thinkingLevel: ThinkingLevel.MINIMAL },
        { name: 'gemini-4-hydrogen', timeoutMs: 14000, thinkingLevel: ThinkingLevel.LOW },
      ];

      let text = '';
      let usedModel = '';
      let lastErr: unknown = null;

      for (const target of modelsToTry) {
        try {
          const response = await Promise.race([
            ai.models.generateContent({
              model: target.name,
              contents: prompt,
              config: {
                systemInstruction,
                thinkingConfig: {
                  thinkingLevel: target.thinkingLevel,
                },
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`${target.name} timeout`)), target.timeoutMs)
            ),
          ]);
          const candidate = (response.text ?? '').trim();
          if (candidate) {
            text = candidate;
            usedModel = target.name;
            break;
          }
        } catch (err) {
          lastErr = err;
        }
      }

      if (!text) {
        const classified = classifyGeminiError(lastErr);
        res.status(classified.status).json({
          errorCode: classified.errorCode,
          error: classified.message,
        });
        return;
      }

      res.json({
        reply: text,
        provider: 'server-gemini',
        model: usedModel,
      });
    } catch (err) {
      const classified = classifyGeminiError(err);
      res.status(classified.status).json({
        errorCode: classified.errorCode,
        error: classified.message,
      });
    }
  });

  app.post('/api/tts', ttsRateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = req.body ?? {};
    const rawText = typeof body.text === 'string' ? body.text.trim() : '';
    const language = typeof body.language === 'string' ? body.language : 'en';
    const text = trimTextAtBoundary(rawText, 920);

    if (!text) {
      res.status(400).json({ ok: false, errorCode: 'bad_request', error: 'Text is required' });
      return;
    }

    const cacheKey = `${language}:${text}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.json({ ok: true, ...cached, cached: true });
      return;
    }

    let base64Audio: string | undefined;
    let mimeType = 'audio/wav';
    let ttsProvider = 'gemini-tts';
    let lastGeminiErr: unknown = null;

    // 1. Try Gemini TTS models (skipping models currently in 429 quota cooldown)
    if (apiKey) {
      const ai = getSharedAiClient(apiKey);
      const style = TTS_STYLE_BY_LANG[language] ?? TTS_STYLE_BY_LANG.en;
      const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];

      for (const modelName of ttsModels) {
        const cooldownUntil = geminiTtsCooldownUntil.get(modelName) ?? 0;
        if (Date.now() < cooldownUntil) continue;

        try {
          const response = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text,
                      speechMetadata: {
                        style,
                      },
                    },
                  ],
                },
              ],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`${modelName} TTS generation timeout`)), 20000)
            ),
          ]);

          const parts = response.candidates?.[0]?.content?.parts ?? [];
          const audioPart = parts.find((p) => p.inlineData?.data);
          const candidateAudio = audioPart?.inlineData?.data;
          if (candidateAudio) {
            base64Audio = candidateAudio;
            mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';
            ttsProvider = modelName;
            break;
          }
        } catch (err) {
          lastGeminiErr = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          if (/429|RESOURCE_EXHAUSTED|quota|rate/i.test(errMsg)) {
            // Avoid hitting exhausted Free Tier TTS quota on every subsequent tap
            geminiTtsCooldownUntil.set(modelName, Date.now() + 10 * 60 * 1000);
          }
          console.warn(`[TTS] ${modelName} failed, falling back:`, errMsg.slice(0, 180));
        }
      }
    }

    // 2. Fallback to reliable server-side multilingual TTS when Gemini TTS quota is exhausted or unavailable
    if (!base64Audio) {
      const fallbackResult = await generateFallbackTtsAudio(text, language);
      if (fallbackResult) {
        base64Audio = fallbackResult.audioBase64;
        mimeType = fallbackResult.mimeType;
        ttsProvider = 'server-fallback-tts';
      }
    }

    if (!base64Audio) {
      const classified = lastGeminiErr
        ? classifyGeminiError(lastGeminiErr)
        : {
            status: apiKey ? 502 : 503,
            errorCode: apiKey ? 'tts_unavailable' : 'config',
            message: apiKey
              ? 'Unable to synthesize speech audio right now'
              : 'TTS service is unavailable',
          };
      res.status(classified.status).json({
        ok: false,
        errorCode: classified.errorCode,
        error: classified.message,
      });
      return;
    }

    if (ttsCache.size >= 40) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, { audioBase64: base64Audio, mimeType, ttsProvider });

    res.json({
      ok: true,
      audioBase64: base64Audio,
      mimeType,
      ttsProvider,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Space Sentinel server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
