import { getGenerativeModel, InferenceMode, InferenceSource } from 'firebase/ai';
import { firebaseAi } from '../firebase';
import {
  AiProviderKind,
  HelperMessage,
  LanguageCode,
  LocalModelSupport,
  SolarWeatherState,
} from '../types/sentinel';

let firebaseAiCloudBlockedUntil = 0;

interface GlobalLanguageModelApi {
  availability?: () => Promise<string>;
  capabilities?: () => Promise<{ available?: string }>;
}

function getBrowserLanguageModelApi(): GlobalLanguageModelApi | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    LanguageModel?: GlobalLanguageModelApi;
    ai?: { languageModel?: GlobalLanguageModelApi };
  };
  return w.LanguageModel ?? w.ai?.languageModel ?? null;
}

export async function probeOnDeviceLocalModel(): Promise<{
  support: LocalModelSupport;
  detail: string;
}> {
  const api = getBrowserLanguageModelApi();
  if (!api) {
    return {
      support: 'unsupported',
      detail: 'Browser does not expose Built-in On-Device LanguageModel API',
    };
  }

  try {
    if (typeof api.availability === 'function') {
      const status = await api.availability();
      if (status === 'available' || status === 'readily') {
        return { support: 'available', detail: 'On-Device Built-in Model is ready' };
      }
      if (status === 'downloadable' || status === 'after-download') {
        return { support: 'downloadable', detail: 'On-Device model requires browser download' };
      }
    }
    if (typeof api.capabilities === 'function') {
      const cap = await api.capabilities();
      if (cap?.available === 'readily') {
        return { support: 'available', detail: 'On-Device Built-in Model is ready' };
      }
      if (cap?.available === 'after-download') {
        return { support: 'downloadable', detail: 'On-Device model requires browser download' };
      }
    }
    return { support: 'unsupported', detail: 'On-device model unavailable on this browser' };
  } catch {
    return { support: 'unsupported', detail: 'On-device model check failed' };
  }
}

const PURE_LANGUAGE_SYSTEM: Record<LanguageCode, string> = {
  en: 'Respond in simple, warm, everyday spoken English with zero words from other languages. Keep answers short (2 to 3 clear sentences).',
  ur: 'Respond strictly in simple, everyday spoken Urdu script (عام بول چال کی آسان اردو) with ZERO English words, acronyms, or difficult bookish words. Keep answers friendly and short (2 to 3 simple sentences).',
  hi: 'Respond strictly in simple, everyday spoken Hindi (रोज़मर्रा की आसान हिन्दी) in Devanagari script with ZERO English words. Keep answers short (2 to 3 simple sentences).',
  te: 'Respond strictly in simple, everyday spoken Telugu (సులభమైన రోజువారీ తెలుగు) with ZERO English words. Keep answers short (2 to 3 simple sentences).',
  kn: 'Respond strictly in simple, everyday spoken Kannada (ಸರಳ ಆಡುಭಾಷೆಯ ಕನ್ನಡ) with ZERO English words. Keep answers short (2 to 3 simple sentences).',
};

function buildContextPrompt(
  question: string,
  language: LanguageCode,
  solar: SolarWeatherState | null,
  history: HelperMessage[]
): { system: string; fullPrompt: string } {
  let telemetryLine = 'Telemetry unavailable right now.';
  if (solar) {
    let cacheAgeMinutes: number | string = 'unknown';
    const parsedMs = new Date(solar.fetchedAtIso).getTime();
    if (!Number.isNaN(parsedMs)) {
      cacheAgeMinutes = Math.max(0, Math.round((Date.now() - parsedMs) / 60000));
    }
    const forecastSummary = (solar.forecastDays ?? [])
      .slice(0, 3)
      .map(
        (d) =>
          `day+${d.dayOffset}(${d.dateIso}):G=${d.gScale},R_minor=${d.rMinorProb ?? 'na'}%,S=${d.sProb ?? 'na'}%`
      )
      .join('; ');
    telemetryLine = `Telemetry source=${solar.source}, cacheAgeMinutes=${cacheAgeMinutes}, fetchedAt=${solar.fetchedAtIso}, flare=${solar.flareClass ?? 'unavailable'}(at=${solar.xrayObservedAtIso ?? 'na'}), kp=${solar.kpIndex ?? 'unavailable'}(at=${solar.kpObservedAtIso ?? 'na'}), geomagneticScale=${solar.geomagneticScale}, solarWind=${solar.solarWindSpeed ?? 'unavailable'}km/s(at=${solar.windObservedAtIso ?? 'na'}), radioScale=${solar.radioBlackoutScale}, radiationScale=${solar.radiationScale}, alerts=${solar.alerts.length}, activeWarningKp=${solar.activeWarningKp ?? 'none'}, feedDiscrepancyKind=${solar.feedDiscrepancyKind ?? 'none'}, forecast3Days=[${forecastSummary || 'na'}].`;
  }

  const system = [
    'You are Space Sentinel Helper.',
    PURE_LANGUAGE_SYSTEM[language],
    'Honesty & scientific accuracy rules: Only cite numbers present in the telemetry. NOAA G1 storm starts strictly at Kp 5 (Kp 0-4 is G0, Kp 4 is unrest NOT G1). If source=offline-cache, explicitly state it is previously saved data and state its age from cacheAgeMinutes. If feedDiscrepancyKind is warning-higher-than-live or forecast-higher-than-live, clearly distinguish calm current Kp from upcoming warnings/forecasts. If solar wind or exact local GPS meter drift is unavailable, say plainly it is not shown here. Do not print raw URLs in prose.',
    telemetryLine,
  ].join(' ');

  const recent = history
    .slice(-6)
    .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');

  const fullPrompt = recent ? `${recent}\nUser: ${question}` : question;
  return { system, fullPrompt };
}

export type AiErrorKind = 'none' | 'offline-no-local' | 'timeout' | 'rate-limit' | 'network';

export async function askHybridSentinel(params: {
  question: string;
  language: LanguageCode;
  solar: SolarWeatherState | null;
  history: HelperMessage[];
  offlineMode: boolean;
  preferOnDeviceFirst: boolean;
  localModelSupport?: LocalModelSupport;
  offlineUnavailableMsg: string;
  networkUnavailableMsg: string;
  timeoutUnavailableMsg?: string;
  rateLimitUnavailableMsg?: string;
}): Promise<{
  text: string;
  provider: AiProviderKind;
  errorKind: AiErrorKind;
  canRetry: boolean;
}> {
  const {
    question,
    language,
    solar,
    history,
    offlineMode,
    preferOnDeviceFirst,
    localModelSupport,
    offlineUnavailableMsg,
    networkUnavailableMsg,
    timeoutUnavailableMsg,
    rateLimitUnavailableMsg,
  } = params;

  const { system, fullPrompt } = buildContextPrompt(question, language, solar, history);
  const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // Check real local model capability dynamically if unknown
  const resolvedLocalSupport =
    localModelSupport ?? (await probeOnDeviceLocalModel()).support;

  // 1. Offline Mode OR browser physically offline -> ONLY_ON_DEVICE if supported
  if (offlineMode || isBrowserOffline) {
    if (resolvedLocalSupport === 'available') {
      try {
        const localModel = getGenerativeModel(firebaseAi, {
          mode: InferenceMode.ONLY_ON_DEVICE,
          onDeviceParams: {
            createOptions: {
              initialPrompts: [{ role: 'system', content: [{ type: 'text', value: system }] }],
            },
          },
        });
        const result = await localModel.generateContent(fullPrompt);
        const text = result.response.text().trim();
        if (text) {
          return {
            text,
            provider: 'firebase-ai-on-device',
            errorKind: 'none',
            canRetry: false,
          };
        }
      } catch {
        // Fall through to honest offline unavailable message
      }
    }

    return {
      text: offlineUnavailableMsg,
      provider: 'offline-unavailable',
      errorKind: 'offline-no-local',
      canRetry: true,
    };
  }

  // 2. Native Firebase AI Logic Hybrid Inference (PREFER_ON_DEVICE / PREFER_IN_CLOUD)
  const onDeviceOptions = {
    createOptions: {
      initialPrompts: [{ role: 'system' as const, content: [{ type: 'text' as const, value: system }] }],
    },
  };

  const isFirebaseCloudInCooldown = Date.now() < firebaseAiCloudBlockedUntil;

  if (!isFirebaseCloudInCooldown) {
    try {
      const hybridModel = getGenerativeModel(firebaseAi, {
        mode: preferOnDeviceFirst ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.PREFER_IN_CLOUD,
        onDeviceParams: onDeviceOptions,
        inCloudParams: {
          model: 'gemini-2.5-flash',
          systemInstruction: system,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase AI Logic timeout')), 15000)
      );
      const result = await Promise.race([hybridModel.generateContent(fullPrompt), timeoutPromise]);
      const text = result.response.text().trim();
      if (text) {
        firebaseAiCloudBlockedUntil = 0;
        const source = result.response.inferenceSource;
        return {
          text,
          provider:
            source === InferenceSource.ON_DEVICE ? 'firebase-ai-on-device' : 'firebase-ai-cloud',
          errorKind: 'none',
          canRetry: false,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/401|403|404|permission_denied|unauthenticated|forbidden/i.test(msg)) {
        // Short cooldown so transient token warm-up issues recover without hammering blocked requests
        firebaseAiCloudBlockedUntil = Date.now() + 45000;
      }
    }
  }

  // If Firebase AI Cloud is temporarily in cooldown but user prefers on-device & browser supports it, still attempt ONLY_ON_DEVICE
  if (Date.now() < firebaseAiCloudBlockedUntil && preferOnDeviceFirst && resolvedLocalSupport === 'available') {
    try {
      const localModel = getGenerativeModel(firebaseAi, {
        mode: InferenceMode.ONLY_ON_DEVICE,
        onDeviceParams: onDeviceOptions,
      });
      const result = await localModel.generateContent(fullPrompt);
      const text = result.response.text().trim();
      if (text) {
        return {
          text,
          provider: 'firebase-ai-on-device',
          errorKind: 'none',
          canRetry: false,
        };
      }
    } catch {
      // Proceed to server-side Gemini backup
    }
  }

  // 4. Verified Server-Side @google/genai endpoint (/api/gemini/chat) with 1 clean automatic retry
  let lastErrorKind: AiErrorKind = 'network';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        signal: AbortSignal.timeout(22000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          language,
          telemetry: solar ?? {},
          history: history.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        if (data.reply?.trim()) {
          return {
            text: data.reply.trim(),
            provider: 'server-gemini',
            errorKind: 'none',
            canRetry: false,
          };
        }
      } else {
        const errPayload = (await res.json().catch(() => ({}))) as { errorCode?: string };
        if (errPayload.errorCode === 'rate_limit' || res.status === 429) {
          lastErrorKind = 'rate-limit';
          break;
        }
        if (errPayload.errorCode === 'timeout' || res.status === 504) {
          lastErrorKind = 'timeout';
          break;
        }
        lastErrorKind = 'network';
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/abort|timeout/i.test(msg)) {
        lastErrorKind = 'timeout';
        break;
      }
      lastErrorKind = 'network';
    }

    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, 450));
    }
  }

  // 5. Honest failure with retry support (never fabricate a fake AI answer)
  const resolvedErrorText =
    lastErrorKind === 'rate-limit' && rateLimitUnavailableMsg
      ? rateLimitUnavailableMsg
      : lastErrorKind === 'timeout' && timeoutUnavailableMsg
        ? timeoutUnavailableMsg
        : networkUnavailableMsg;

  return {
    text: resolvedErrorText,
    provider: 'offline-unavailable',
    errorKind: lastErrorKind,
    canRetry: true,
  };
}
