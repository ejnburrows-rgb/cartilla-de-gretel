import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, stopSpeech } from "./speech-playback";

/**
 * Gretel voice — neutral, child-friendly Spanish browser TTS with pluggable provider architecture.
 * Web Speech API only by default: free/offline when the device exposes a local voice.
 */
export type GretelVoiceHandlers = { onStart?: () => void; onEnd?: () => void };

export type GretelVoiceProviderType = "browser-tts" | "recorded-audio" | "cloud-tts" | "custom";

export interface GretelVoiceProviderConfig {
  type: GretelVoiceProviderType;
  name: string;
  primaryVoiceName?: string;
  fallbackVoiceName?: string;
  pitch?: number;
  rate?: number;
  speakFn?: (text: string, handlers: GretelVoiceHandlers) => Promise<void>;
}

const MUTE_KEY = "cartilla.gretel.voice.muted";
const FRIENDLY_HINTS = /child|niña|nina|girl|kids|junior|zira|samantha|karen|tessa|fiona|paulina|sabina|dalia|elvira|ximena|helena|monica|mónica|lucia|laura|sara|maria|soledad|esperanza|paloma|carmen/i;
const LATAM = new Set(["es-mx", "es-us", "es-419", "es-la"]);

export const GRETEL_PRIMARY_VOICE = "Leda";
export const GRETEL_FALLBACK_VOICE = "Sulafat";

const DEFAULT_PROVIDER_CONFIG: GretelVoiceProviderConfig = {
  type: "browser-tts",
  name: "Browser Native TTS (Neutral LatAm Spanish)",
  primaryVoiceName: GRETEL_PRIMARY_VOICE,
  fallbackVoiceName: GRETEL_FALLBACK_VOICE,
  pitch: 1.1,
  rate: 0.94,
};

let activeProviderConfig: GretelVoiceProviderConfig = { ...DEFAULT_PROVIDER_CONFIG };
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;
let lastSpokenVoiceName = "none";
let mutedMemory = false;

export function getGretelVoiceProviderConfig(): GretelVoiceProviderConfig {
  return { ...activeProviderConfig };
}

export function setGretelVoiceProviderConfig(config: GretelVoiceProviderConfig): void {
  activeProviderConfig = { ...config };
  cachedVoice = null;
}

export function resetGretelVoiceProviderConfig(): void {
  activeProviderConfig = { ...DEFAULT_PROVIDER_CONFIG };
  cachedVoice = null;
}

export function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = (voice.lang || "").toLowerCase();
  if (!lang.startsWith("es")) return -1;
  let score = LATAM.has(lang) ? 100000 : 5000;
  const primary = activeProviderConfig.primaryVoiceName || GRETEL_PRIMARY_VOICE;
  const fallback = activeProviderConfig.fallbackVoiceName || GRETEL_FALLBACK_VOICE;

  // Voice labels are literal OS/browser strings, not regular expressions.
  const voiceName = voice.name.toLowerCase();
  if (voiceName.includes(primary.toLowerCase())) score += 1000000;
  else if (voiceName.includes(fallback.toLowerCase())) score += 900000;

  if (FRIENDLY_HINTS.test(voice.name)) score += 2500;
  if (/natural|neural|online|premium|enhanced/i.test(voice.name)) score += 300;
  if (/google/i.test(voice.name)) score += 200;
  if (/microsoft/i.test(voice.name)) score += 150;
  if (typeof navigator !== "undefined" && !navigator.onLine) score += voice.localService ? 3000 : -2000;
  return score;
}

export function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const ranked = window.speechSynthesis.getVoices()
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice ?? null;
}

export function getAvailableGretelVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices()
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.voice);
}

function ensureVoices(): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const tryPick = () => {
      cachedVoice = pickVoice();
      if (cachedVoice) resolve();
    };
    tryPick();
    if (cachedVoice) return;
    const synth = window.speechSynthesis;
    const once = () => {
      tryPick();
      synth.removeEventListener("voiceschanged", once);
      resolve();
    };
    synth.addEventListener("voiceschanged", once);
    setTimeout(resolve, 1200);
  });
  return voicesReady;
}

export function isGretelVoiceMuted(): boolean {
  if (mutedMemory) return true;
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return mutedMemory;
  }
}

export function setGretelVoiceMuted(muted: boolean): void {
  mutedMemory = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      /* memory flag remains authoritative */
    }
  }
  if (muted) cancelGretelSpeech();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cartilla:audio-settings"));
}

export function getSelectedGretelVoiceName(): string {
  return lastSpokenVoiceName;
}

export function cancelGretelSpeech(): void {
  stopSpeech();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
}

export async function speakAsGretel(text: string, handlers: GretelVoiceHandlers = {}): Promise<void> {
  if (!text?.trim() || isGretelVoiceMuted()) {
    handlers.onEnd?.();
    return;
  }

  if (activeProviderConfig.type !== "browser-tts" && activeProviderConfig.speakFn) {
    const token = claimSpeech("gretel");
    let started = false;
    let ended = false;
    const start = () => {
      if (started || ended || !speechIsCurrent(token)) return;
      started = true;
      window.dispatchEvent(new CustomEvent("gretel:speak_start"));
      handlers.onStart?.();
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      if (speechIsCurrent(token)) releaseSpeech(token);
      if (started) window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
      handlers.onEnd?.();
    };
    registerSpeechCleanup(token, finish);
    start();
    try {
      lastSpokenVoiceName = `${activeProviderConfig.name} (${activeProviderConfig.type})`;
      await activeProviderConfig.speakFn(text, { onStart: start, onEnd: finish });
    } catch {
      /* handled gracefully */
    } finally {
      finish();
    }
    return;
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    handlers.onEnd?.();
    return;
  }

  const token = claimSpeech("gretel");
  await ensureVoices();
  if (!speechIsCurrent(token) || isGretelVoiceMuted()) {
    handlers.onEnd?.();
    return;
  }

  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text.trim());
      const voice = cachedVoice ?? pickVoice();
      cachedVoice = voice;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "es-MX";
        lastSpokenVoiceName = `${voice.name} (${voice.lang})`;
      } else {
        utterance.lang = "es-MX";
        lastSpokenVoiceName = "es-MX lang-hint (no voice object)";
      }

      utterance.pitch = activeProviderConfig.pitch ?? 1.1;
      utterance.rate = activeProviderConfig.rate ?? 0.94;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (!speechIsCurrent(token)) return;
        window.dispatchEvent(new CustomEvent("gretel:speak_start"));
        handlers.onStart?.();
      };

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        releaseSpeech(token);
        window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
        handlers.onEnd?.();
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      registerSpeechCleanup(token, finish);
      synth.speak(utterance);
    } catch {
      releaseSpeech(token);
      window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
      handlers.onEnd?.();
      resolve();
    }
  });
}

export const HOME_GREETING = "Bienvenidos a la Cartilla de Gretel. Vamos a aprender a leer juntos.";
export function buildHomeIntroLines(): string[] { return [HOME_GREETING]; }

export type IntroCatalogSlice = {
  n: number;
  kind: string;
  title: string;
  subtitle?: string;
  letter?: string;
  vowel?: string;
};

export function buildLessonIntroLines(entry: IntroCatalogSlice): string[] {
  if (entry.kind === "intro") {
    return ["¡Hola! Vamos a conocer las vocales.", ...(entry.subtitle?.trim() ? [entry.subtitle.trim()] : [])];
  }
  if (entry.kind === "vowel" && entry.vowel) {
    return [`¡Hola! Vamos a la lección de la vocal ${entry.vowel.toUpperCase()}.`];
  }
  if (entry.kind === "consonant" && entry.letter) {
    return [`¡Hola! Vamos a la lección de la letra ${entry.letter}.`];
  }
  return [`¡Hola! ${entry.title}.`];
}

export function buildSuccessLine(): string {
  const options = ["¡Muy bien!", "¡Excelente!", "¡Lo lograste!", "¡Qué bien!"];
  return options[Math.floor(Math.random() * options.length)]!;
}

export function buildMissLine(): string {
  const options = ["Inténtalo otra vez.", "Casi. Prueba otra vez.", "Tú puedes."];
  return options[Math.floor(Math.random() * options.length)]!;
}
