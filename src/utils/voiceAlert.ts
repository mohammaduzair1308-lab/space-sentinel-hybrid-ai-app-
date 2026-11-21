import { LanguageCode } from '../types/sentinel';

let activeAudioCtx: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let playbackSeq = 0;

interface CachedAudioEntry {
  arrayBuffer: ArrayBuffer;
  mimeType: string;
}

// Cache synthesized audio buffers during session so Replay and section re-opens are instant
const clientTtsAudioCache = new Map<string, CachedAudioEntry>();

const SPEECH_LANG_CANDIDATES: Record<LanguageCode, string[]> = {
  ur: ['ur-IN', 'ur-PK', 'ur'],
  en: ['en-US', 'en-GB', 'en-IN', 'en'],
  hi: ['hi-IN', 'hi'],
  te: ['te-IN', 'te'],
  kn: ['kn-IN', 'kn'],
};

export interface VoiceAvailabilityInfo {
  available: boolean;
  voiceName: string | null;
  langTag: string | null;
}

function findExactDeviceVoice(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const candidates = SPEECH_LANG_CANDIDATES[language] ?? ['en-US'];

  for (const tag of candidates) {
    const exactLocal = voices.find(
      (v) => v.localService && v.lang.toLowerCase() === tag.toLowerCase()
    );
    if (exactLocal) return exactLocal;
  }

  for (const tag of candidates) {
    const exactAny = voices.find((v) => v.lang.toLowerCase() === tag.toLowerCase());
    if (exactAny) return exactAny;
  }

  const baseLang = candidates[0].split('-')[0].toLowerCase();
  return (
    voices.find(
      (v) =>
        v.localService &&
        (v.lang.toLowerCase().startsWith(`${baseLang}-`) || v.lang.toLowerCase() === baseLang)
    ) ??
    voices.find(
      (v) => v.lang.toLowerCase().startsWith(`${baseLang}-`) || v.lang.toLowerCase() === baseLang
    ) ??
    null
  );
}

export function checkVoiceAvailability(language: LanguageCode): VoiceAvailabilityInfo {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { available: false, voiceName: null, langTag: null };
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return { available: false, voiceName: null, langTag: null };
  }

  const exactVoice = findExactDeviceVoice(voices, language);
  if (!exactVoice) {
    return { available: false, voiceName: null, langTag: null };
  }

  return {
    available: true,
    voiceName: exactVoice.name,
    langTag: exactVoice.lang,
  };
}

async function waitForDeviceVoice(
  language: LanguageCode,
  timeoutMs = 250
): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const synth = window.speechSynthesis;
  const immediate = synth.getVoices();
  if (immediate && immediate.length > 0) {
    return findExactDeviceVoice(immediate, language);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener?.('voiceschanged', onChanged);
      const loaded = synth.getVoices();
      resolve(loaded && loaded.length > 0 ? findExactDeviceVoice(loaded, language) : null);
    };
    const onChanged = () => finish();
    synth.addEventListener?.('voiceschanged', onChanged);
    setTimeout(finish, timeoutMs);
  });
}

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
    activeAudioCtx = new AudioCtx();
  }
  return activeAudioCtx;
}

// Synchronously unlock AudioContext inside user tap so Android Chrome & Safari allow async /api/tts audio later
function unlockAudioContextSync(): AudioContext | null {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
    const silentBuffer = ctx.createBuffer(1, 1, 22050);
    const silentSource = ctx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(ctx.destination);
    silentSource.start(0);
    return ctx;
  } catch {
    return null;
  }
}

export function playAerospaceAlertChime(isCritical: boolean): void {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const tones = isCritical ? [880, 1174.66, 880, 1318.51] : [659.25, 880];

    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isCritical ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);

      gain.gain.setValueAtTime(0.001, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.13, now + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.13);
    });
  } catch {
    // Ignore audio context block
  }
}

export function stopVoiceBroadcast(): void {
  playbackSeq += 1;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }
    } catch {
      // Ignore cancel errors
    }
  }

  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop(0);
      activeBufferSource.disconnect();
    } catch {
      // Ignore already stopped source
    }
    activeBufferSource = null;
  }

  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.onended = null;
      activeHtmlAudio.onerror = null;
      activeHtmlAudio.pause();
      activeHtmlAudio.src = '';
    } catch {
      // Ignore audio element stop errors
    }
    activeHtmlAudio = null;
  }

  if (activeObjectUrl) {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch {
      // Ignore revoke errors
    }
    activeObjectUrl = null;
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function trimSpeechText(raw: string, maxLen = 920): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const slice = cleaned.slice(0, maxLen);
  const lastStop = Math.max(
    slice.lastIndexOf('۔'),
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?'),
    slice.lastIndexOf(' ')
  );
  return lastStop > maxLen * 0.6 ? slice.slice(0, lastStop + 1).trim() : slice.trim();
}

async function trySpeakWithDeviceVoice(
  cleaned: string,
  language: LanguageCode,
  deviceVoice: SpeechSynthesisVoice,
  seq: number,
  options: {
    rate: number;
    withAlertChime: boolean;
    isCritical: boolean;
    onEnd: () => void;
  }
): Promise<'started' | 'failed' | 'cancelled'> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return 'failed';
  }
  const synth = window.speechSynthesis;
  const { rate, withAlertChime, isCritical, onEnd } = options;

  if (withAlertChime) {
    playAerospaceAlertChime(isCritical);
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang =
    deviceVoice.lang || SPEECH_LANG_CANDIDATES[language]?.[0] || 'en-US';
  utterance.voice = deviceVoice;
  utterance.rate = Math.max(0.65, Math.min(1.5, rate));
  utterance.pitch = 1.0;

  return await new Promise<'started' | 'failed' | 'cancelled'>((resolve) => {
    let settledStart = false;
    let ended = false;
    let safetyEndTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanupTimers = () => {
      if (safetyEndTimer) clearTimeout(safetyEndTimer);
    };

    const handleComplete = () => {
      if (ended) return;
      ended = true;
      cleanupTimers();
      if (seq === playbackSeq) {
        onEnd();
      }
    };

    const startWatchdog = setTimeout(() => {
      if (settledStart) return;
      settledStart = true;
      try {
        synth.cancel();
      } catch {
        // Ignore
      }
      resolve(seq === playbackSeq ? 'failed' : 'cancelled');
    }, 1500);

    utterance.onstart = () => {
      if (seq !== playbackSeq) {
        clearTimeout(startWatchdog);
        try {
          synth.cancel();
        } catch {
          // Ignore
        }
        if (!settledStart) {
          settledStart = true;
          resolve('cancelled');
        }
        return;
      }
      if (!settledStart) {
        settledStart = true;
        clearTimeout(startWatchdog);
        resolve('started');
      }
      safetyEndTimer = setTimeout(handleComplete, 45000);
    };

    utterance.onend = () => {
      clearTimeout(startWatchdog);
      if (!settledStart) {
        settledStart = true;
        resolve(seq === playbackSeq ? 'failed' : 'cancelled');
        return;
      }
      handleComplete();
    };

    utterance.onerror = () => {
      clearTimeout(startWatchdog);
      if (!settledStart) {
        settledStart = true;
        try {
          synth.cancel();
        } catch {
          // Ignore
        }
        resolve(seq === playbackSeq ? 'failed' : 'cancelled');
        return;
      }
      handleComplete();
    };

    const delay = withAlertChime ? (isCritical ? 480 : 220) : 0;
    const triggerSpeak = () => {
      if (seq !== playbackSeq) {
        clearTimeout(startWatchdog);
        if (!settledStart) {
          settledStart = true;
          resolve('cancelled');
        }
        return;
      }
      try {
        synth.speak(utterance);
        synth.resume?.();
      } catch {
        clearTimeout(startWatchdog);
        if (!settledStart) {
          settledStart = true;
          resolve('failed');
        }
      }
    };

    if (delay > 0) {
      setTimeout(triggerSpeak, delay);
    } else {
      triggerSpeak();
    }
  });
}

async function fetchServerTtsAudio(
  cleaned: string,
  language: LanguageCode
): Promise<CachedAudioEntry | null> {
  const cacheKey = `${language}:${cleaned}`;
  const cached = clientTtsAudioCache.get(cacheKey);
  if (cached) return cached;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 24000);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleaned,
          language,
        }),
      });
      if (!res.ok) {
        if (attempt === 0 && res.status >= 500) {
          await new Promise((r) => setTimeout(r, 350));
          continue;
        }
        return null;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        audioBase64?: string;
        mimeType?: string;
      };
      if (!data.ok || !data.audioBase64) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 350));
          continue;
        }
        return null;
      }
      const entry: CachedAudioEntry = {
        arrayBuffer: base64ToArrayBuffer(data.audioBase64),
        mimeType: data.mimeType || 'audio/wav',
      };
      if (clientTtsAudioCache.size >= 40) {
        const oldest = clientTtsAudioCache.keys().next().value;
        if (oldest) clientTtsAudioCache.delete(oldest);
      }
      clientTtsAudioCache.set(cacheKey, entry);
      return entry;
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 350));
        continue;
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

export interface SpeakBroadcastOptions {
  rate?: number;
  muted?: boolean;
  offlineMode?: boolean;
  withAlertChime?: boolean;
  isCritical?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onEnd: () => void;
  onUnavailable?: (reason: 'offline' | 'no-voice' | 'playback-failed') => void;
}

export async function speakBroadcast(
  text: string,
  language: LanguageCode,
  options: SpeakBroadcastOptions
): Promise<{ started: boolean; mode?: 'device' | 'online-tts'; voiceUnavailable?: boolean }> {
  const {
    rate = 1.0,
    muted = false,
    offlineMode = false,
    withAlertChime = false,
    isCritical = false,
    onLoadingChange,
    onEnd,
    onUnavailable,
  } = options;

  const cleaned = trimSpeechText(text, 920);
  if (muted || !cleaned) {
    onEnd();
    return { started: false };
  }

  // Cancel any prior speech/audio and unlock AudioContext synchronously during user gesture
  stopVoiceBroadcast();
  const seq = playbackSeq;
  const unlockedCtx = unlockAudioContextSync();
  const preAllocatedAudio = typeof Audio !== 'undefined' ? new Audio() : null;

  const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const isOffline = offlineMode || browserOffline;

  // 1. Check device speechSynthesis voice (supports ur-IN, ur-PK, ur, etc.)
  const deviceVoice = await waitForDeviceVoice(language, 250);
  if (seq !== playbackSeq) {
    return { started: false };
  }

  // When online, only try Web Speech first if device has an actual local (offline-installed) voice;
  // when offline, try any matching device voice. If device voice fails or times out, fall through to /api/tts when online.
  const shouldTryDeviceVoice =
    Boolean(deviceVoice) && (isOffline || Boolean(deviceVoice?.localService));

  if (deviceVoice && shouldTryDeviceVoice) {
    const deviceStatus = await trySpeakWithDeviceVoice(cleaned, language, deviceVoice, seq, {
      rate,
      withAlertChime,
      isCritical,
      onEnd,
    });
    if (deviceStatus === 'started') {
      return { started: true, mode: 'device' };
    }
    if (deviceStatus === 'cancelled' || seq !== playbackSeq) {
      return { started: false };
    }
    // If failed while online, continue automatically into tier 2 (/api/tts)
  }

  // 2. If offline and no working local voice succeeded, honestly report offline voice unavailability
  if (isOffline) {
    onUnavailable?.('offline');
    onEnd();
    return { started: false, voiceUnavailable: true };
  }

  // 3. Online Tier: Gemini TTS / server fallback Urdu TTS (/api/tts) with caching + automatic retry
  const cacheKey = `${language}:${cleaned}`;
  const hasCache = clientTtsAudioCache.has(cacheKey);
  if (!hasCache) {
    onLoadingChange?.(true);
  }
  const entry = await fetchServerTtsAudio(cleaned, language);
  if (!hasCache) {
    onLoadingChange?.(false);
  }

  if (seq !== playbackSeq) {
    onEnd();
    return { started: false };
  }

  if (!entry) {
    onUnavailable?.('no-voice');
    onEnd();
    return { started: false, voiceUnavailable: true };
  }

  if (withAlertChime) {
    playAerospaceAlertChime(isCritical);
  }

  // 4. Primary Player: Unlocked AudioContext.decodeAudioData (Android Chrome & iOS Safari safe after async fetch)
  const ctx = unlockedCtx ?? getOrCreateAudioContext();
  if (ctx) {
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Pass a sliced copy because decodeAudioData detaches the ArrayBuffer
      const audioBuffer = await ctx.decodeAudioData(entry.arrayBuffer.slice(0));
      if (seq !== playbackSeq) {
        onEnd();
        return { started: false };
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = Math.max(0.75, Math.min(1.5, rate));
      source.connect(ctx.destination);
      activeBufferSource = source;

      source.onended = () => {
        if (activeBufferSource === source) {
          activeBufferSource = null;
        }
        try {
          source.disconnect();
        } catch {
          // Ignore
        }
        if (seq === playbackSeq) {
          onEnd();
        }
      };

      source.start(0);
      return { started: true, mode: 'online-tts' };
    } catch {
      // Fall through to HTMLAudioElement backup below
    }
  }

  // 5. Backup Player: HTMLAudioElement with Blob URL
  if (!preAllocatedAudio) {
    onUnavailable?.('playback-failed');
    onEnd();
    return { started: false, voiceUnavailable: true };
  }

  const blob = new Blob([entry.arrayBuffer], { type: entry.mimeType });
  const objectUrl = URL.createObjectURL(blob);
  activeObjectUrl = objectUrl;
  activeHtmlAudio = preAllocatedAudio;
  preAllocatedAudio.src = objectUrl;
  preAllocatedAudio.playbackRate = Math.max(0.75, Math.min(1.5, rate));

  let finished = false;
  const cleanupAudio = (failed = false) => {
    if (finished) return;
    finished = true;
    if (activeHtmlAudio === preAllocatedAudio) {
      activeHtmlAudio = null;
    }
    if (activeObjectUrl === objectUrl) {
      URL.revokeObjectURL(objectUrl);
      activeObjectUrl = null;
    }
    if (failed) {
      onUnavailable?.('playback-failed');
    }
    if (seq === playbackSeq) {
      onEnd();
    }
  };

  preAllocatedAudio.onended = () => cleanupAudio(false);
  preAllocatedAudio.onerror = () => cleanupAudio(true);

  try {
    await preAllocatedAudio.play();
    return { started: true, mode: 'online-tts' };
  } catch {
    cleanupAudio(true);
    return { started: false, voiceUnavailable: true };
  }
}
