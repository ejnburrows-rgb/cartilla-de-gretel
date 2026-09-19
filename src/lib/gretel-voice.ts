/**
 * Gretel voice — neutral, child-friendly Spanish browser TTS.
 * Web Speech API only: free/offline when the device exposes a local voice.
 */
export type GretelVoiceHandlers = { onStart?: () => void; onEnd?: () => void };

const MUTE_KEY = "cartilla.gretel.voice.muted";
const FRIENDLY_HINTS = /child|niña|nina|girl|kids|junior|zira|samantha|karen|tessa|fiona|paulina|sabina|dalia|elvira|ximena|helena|monica|mónica|lucia|laura|sara|maria|soledad|esperanza|paloma|carmen/i;
const LATAM = new Set(["es-mx", "es-us", "es-419", "es-la"]);
let cached: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;
let lastSpokenVoiceName = "none";
let mutedMemory = false;

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = (voice.lang || "").toLowerCase();
  if (!lang.startsWith("es")) return -1;
  let score = LATAM.has(lang) ? 100000 : 5000;
  if (FRIENDLY_HINTS.test(voice.name)) score += 2500;
  if (/natural|neural|online|premium|enhanced/i.test(voice.name)) score += 300;
  if (/google/i.test(voice.name)) score += 200;
  if (/microsoft/i.test(voice.name)) score += 150;
  if (typeof navigator !== "undefined" && !navigator.onLine) score += voice.localService ? 3000 : -2000;
  return score;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const ranked = window.speechSynthesis.getVoices()
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice ?? null;
}

function ensureVoices(): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const tryPick = () => {
      cached = pickVoice();
      if (cached) resolve();
    };
    tryPick();
    if (cached) return;
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
}

export function getSelectedGretelVoiceName(): string {
  return lastSpokenVoiceName;
}

export function cancelGretelSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* no-op */
  }
  window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
}

export async function speakAsGretel(text: string, handlers: GretelVoiceHandlers = {}): Promise<void> {
  if (!text?.trim() || isGretelVoiceMuted()) {
    handlers.onEnd?.();
    return;
  }
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    handlers.onEnd?.();
    return;
  }
  await ensureVoices();
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      const voice = cached ?? pickVoice();
      cached = voice;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "es-MX";
        lastSpokenVoiceName = `${voice.name} (${voice.lang})`;
      } else {
        utterance.lang = "es-MX";
        lastSpokenVoiceName = "es-MX lang-hint (no voice object)";
      }
      // Warm and clear rather than artificially high/shrill.
      utterance.pitch = 1.1;
      utterance.rate = 0.94;
      utterance.volume = 1;
      utterance.onstart = () => {
        window.dispatchEvent(new CustomEvent("gretel:speak_start"));
        handlers.onStart?.();
      };
      const finish = () => {
        window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
        handlers.onEnd?.();
        resolve();
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      synth.speak(utterance);
    } catch {
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
