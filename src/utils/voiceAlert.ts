import { LanguageCode } from '../types/sentinel';

let activeAudioCtx: AudioContext | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let playbackSeq = 0;

// Cache generated WAV blobs during session so Replay is instant
const clientTtsAudioCache = new Map<string, Blob>();

const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ur: 'ur-PK',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
};

export interface VoiceAvailabilityInfo {
  available: boolean;
  voiceName: string | null;
  langTag: string | null;
}

function findExactDeviceVoice(voices: SpeechSynthesisVoice[], language: LanguageCode): SpeechSynthesisVoice | null {
  const targetLang = SPEECH_LANG_MAP[language] ?? 'en-US';
  const baseLang = targetLang.split('-')[0].toLowerCase();

  return (
    voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(`${baseLang}-`) || v.lang.toLowerCase() === baseLang) ??
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

async function waitForDeviceVoice(language: LanguageCode, timeoutMs = 450): Promise<SpeechSynthesisVoice | null> {
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

export function playAerospaceAlertChime(isCritical: boolean): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (activeAudioCtx && activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume();
    }
    const ctx = activeAudioCtx ?? new AudioCtx();
    activeAudioCtx = ctx;

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
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  if (activeHtmlAudio) {
    try {
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

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
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

  const cleaned = text.trim();
  if (muted || !cleaned) {
    onEnd();
    return { started: false };
  }

  // Cancel any prior speech/audio and establish new sequence token
  stopVoiceBroadcast();
  const seq = playbackSeq;

  // Create audio element synchronously during user gesture for Safari/mobile compatibility
  const preAllocatedAudio = typeof Audio !== 'undefined' ? new Audio() : null;

  // 1. Check strict matching-language device speechSynthesis voice
  const deviceVoice = await waitForDeviceVoice(language, 450);
  if (seq !== playbackSeq) {
    return { started: false };
  }

  if (deviceVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    if (withAlertChime) {
      playAerospaceAlertChime(isCritical);
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = deviceVoice.lang;
    utterance.voice = deviceVoice;
    utterance.rate = Math.max(0.65, Math.min(1.5, rate));
    utterance.pitch = 1.0;

    return await new Promise((resolve) => {
      let finished = false;
      let startedSpeaking = false;

      const finish = (errored = false) => {
        if (finished) return;
        finished = true;
        if (errored && !startedSpeaking) {
          onUnavailable?.('playback-failed');
        }
        onEnd();
        if (!startedSpeaking && errored) {
          resolve({ started: false, voiceUnavailable: true });
        }
      };

      utterance.onstart = () => {
        startedSpeaking = true;
      };
      utterance.onend = () => finish(false);
      utterance.onerror = () => finish(true);

      const delay = withAlertChime ? (isCritical ? 520 : 250) : 20;
      setTimeout(() => {
        if (seq !== playbackSeq) {
          finish(false);
          resolve({ started: false });
          return;
        }
        try {
          synth.speak(utterance);
          resolve({ started: true, mode: 'device' });
        } catch {
          finish(true);
        }
      }, delay);

      setTimeout(() => finish(false), 38000);
    });
  }

  // 2. Fallback to online Gemini TTS (/api/tts) when internet is available
  const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (offlineMode || browserOffline) {
    onUnavailable?.('offline');
    onEnd();
    return { started: false, voiceUnavailable: true };
  }

  const cacheKey = `${language}:${cleaned.slice(0, 750)}`;
  let audioBlob = clientTtsAudioCache.get(cacheKey) ?? null;

  if (!audioBlob) {
    onLoadingChange?.(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 16000);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleaned.slice(0, 750),
            language,
          }),
        });
        if (!res.ok) {
          throw new Error(`TTS HTTP ${res.status}`);
        }
        const data = (await res.json()) as {
          ok?: boolean;
          audioBase64?: string;
          mimeType?: string;
        };
        if (!data.ok || !data.audioBase64) {
          throw new Error('TTS returned no audio');
        }
        audioBlob = base64ToBlob(data.audioBase64, data.mimeType || 'audio/wav');
        if (clientTtsAudioCache.size >= 20) {
          const oldest = clientTtsAudioCache.keys().next().value;
          if (oldest) clientTtsAudioCache.delete(oldest);
        }
        clientTtsAudioCache.set(cacheKey, audioBlob);
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      onLoadingChange?.(false);
      if (seq === playbackSeq) {
        onUnavailable?.('no-voice');
        onEnd();
      }
      return { started: false, voiceUnavailable: true };
    }
    onLoadingChange?.(false);
  }

  if (seq !== playbackSeq || !preAllocatedAudio) {
    onEnd();
    return { started: false };
  }

  if (withAlertChime) {
    playAerospaceAlertChime(isCritical);
  }

  const objectUrl = URL.createObjectURL(audioBlob);
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
    onEnd();
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
