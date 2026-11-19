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

// Small in-memory cache for repeated UI prompts (Welcome intro / Alert scripts)
const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();

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

async function fetchJsonWithTimeout(url: string, timeoutMs = 7000): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithRetry(url: string, timeoutMs = 7000, retries = 1): Promise<unknown | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchJsonWithTimeout(url, timeoutMs);
    if (result !== null) return result;
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
  return null;
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      ttsConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/solar/live', async (_req, res) => {
    const [kpJson, xrayJson, plasmaJson, alertsJson, scalesJson] = await Promise.all([
      fetchJsonWithRetry('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'),
      fetchJsonWithRetry('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json'),
      fetchJsonWithRetry('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json'),
      fetchJsonWithRetry('https://services.swpc.noaa.gov/products/alerts.json'),
      fetchJsonWithRetry('https://services.swpc.noaa.gov/products/noaa-scales.json'),
    ]);

    if (!kpJson && !xrayJson && !scalesJson) {
      res.status(503).json({
        errorCode: 'noaa_unreachable',
        error: 'Unable to reach official space weather servers',
      });
      return;
    }

    res.json({
      source: 'live-noaa',
      fetchedAt: new Date().toISOString(),
      officialSourceUrl: 'https://www.swpc.noaa.gov/',
      partial: !kpJson || !xrayJson || !plasmaJson,
      kpJson: Array.isArray(kpJson) ? kpJson.slice(-36) : [],
      xrayJson: Array.isArray(xrayJson) ? xrayJson.slice(-90) : [],
      plasmaJson: Array.isArray(plasmaJson) ? plasmaJson.slice(0, 12) : [],
      alertsJson: Array.isArray(alertsJson) ? alertsJson.slice(0, 8) : [],
      scalesJson: scalesJson ?? null,
    });
  });

  app.post('/api/gemini/chat', async (req, res) => {
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

  app.post('/api/tts', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        errorCode: 'config',
        error: 'GEMINI_API_KEY is not configured on the server',
      });
      return;
    }

    const body = req.body ?? {};
    const rawText = typeof body.text === 'string' ? body.text.trim() : '';
    const language = typeof body.language === 'string' ? body.language : 'en';
    const text = rawText.slice(0, 750);

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

    try {
      const ai = getSharedAiClient(apiKey);
      const style = TTS_STYLE_BY_LANG[language] ?? TTS_STYLE_BY_LANG.en;

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
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
          setTimeout(() => reject(new Error('TTS generation timeout')), 14000)
        ),
      ]);

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const audioPart = parts.find((p) => p.inlineData?.data);
      const base64Audio = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        res.status(502).json({
          ok: false,
          errorCode: 'empty_audio',
          error: 'No audio bytes returned by TTS model',
        });
        return;
      }

      if (ttsCache.size >= 24) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, { audioBase64: base64Audio, mimeType });

      res.json({
        ok: true,
        audioBase64: base64Audio,
        mimeType,
      });
    } catch (err) {
      const classified = classifyGeminiError(err);
      res.status(classified.status).json({
        ok: false,
        errorCode: classified.errorCode,
        error: classified.message,
      });
    }
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
