/**
 * gretel-voice — little-girl Spanish TTS for Gretel host.
 * Uses Web Speech API only (no clone, no paid keys, no audiobook pipeline).
 * Tuned for young/female LatAm Spanish when available.
 */

export type GretelVoiceHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
};

const MUTE_KEY = "cartilla.gretel.voice.muted";

/** Prefer child / young-female Spanish voices when the OS exposes them. */
const CHILD_HINTS =
  /child|niña|nina|girl|kids|junior|zira|samantha|karen|tessa|fiona|paulina|sabina|dalia|elvira|ximena|helena|monica|mónica|lucia|laura|sara|maria|soledad|esperanza|paloma|carmen/i;

const LATAM = new Set(["es-mx", "es-us", "es-419", "es-la"]);

let cached: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;
let lastSpokenVoiceName = "none";
/** In-memory mute so tests / Node runners without localStorage still work. */
let mutedMemory = false;

function scoreLittleGirlEs(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || "").toLowerCase();
  if (!lang.startsWith("es")) return -1;
  let s = LATAM.has(lang) ? 100000 : 5000;
  if (CHILD_HINTS.test(v.name)) s += 5000;
  if (/natural|neural|online|premium|enhanced/i.test(v.name)) s += 300;
  if (/google/i.test(v.name)) s += 200;
  if (/microsoft/i.test(v.name)) s += 150;
  // Prefer female-coded names slightly over generic
  if (/female|mujer|woman/i.test(v.name)) s += 400;
  // Local when offline
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    s += v.localService ? 3000 : -2000;
  }
  return s;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const ranked = voices
    .map((v) => ({ v, s: scoreLittleGirlEs(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.v ?? null;
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
    setTimeout(() => resolve(), 1200);
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
      /* storage unavailable — memory flag still applies */
    }
  }
  if (muted) cancelGretelSpeech();
}

/** Last selected voice name (for diagnostics / PR notes). */
export function getSelectedGretelVoiceName(): string {
  return lastSpokenVoiceName;
}

export function cancelGretelSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
}

/**
 * Speak short Spanish as Gretel (little-girl pitch/rate).
 * Never throws; never blocks render.
 */
export async function speakAsGretel(
  text: string,
  handlers: GretelVoiceHandlers = {},
): Promise<void> {
  if (!text?.trim()) {
    handlers.onEnd?.();
    return;
  }
  if (isGretelVoiceMuted()) {
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
      const u = new SpeechSynthesisUtterance(text.trim());
      const voice = cached ?? pickVoice();
      cached = voice;
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang || "es-MX";
        lastSpokenVoiceName = `${voice.name} (${voice.lang})`;
      } else {
        u.lang = "es-MX";
        lastSpokenVoiceName = "es-MX lang-hint (no voice object)";
      }
      // Little-girl: higher pitch, slightly brisk kids-book rate
      u.pitch = 1.38;
      u.rate = 0.98;
      u.volume = 1;

      u.onstart = () => {
        window.dispatchEvent(new CustomEvent("gretel:speak_start"));
        handlers.onStart?.();
      };
      const finish = () => {
        window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
        handlers.onEnd?.();
        resolve();
      };
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    } catch {
      handlers.onEnd?.();
      resolve();
    }
  });
}

/**
 * Sole approved home-hero spoken + written line (operator lock).
 * No other home hero captions/subtitles/credits.
 */
export const HOME_GREETING =
  "Bienvenidos a la Cartilla de Gretel. Vamos a aprender a leer juntos.";

export function buildHomeIntroLines(): string[] {
  return [HOME_GREETING];
}

/**
 * Build short pre-reader intro lines from real catalog data only.
 * Never invents long pedagogy.
 */
export type IntroCatalogSlice = {
  n: number;
  kind: string;
  title: string;
  subtitle?: string;
  letter?: string;
  vowel?: string;
};

export function buildLessonIntroLines(entry: IntroCatalogSlice): string[] {
  const lines: string[] = [];
  if (entry.kind === "intro") {
    lines.push("¡Hola! Vamos a conocer las vocales.");
    if (entry.subtitle?.trim()) lines.push(entry.subtitle.trim());
    return lines;
  }
  if (entry.kind === "vowel" && entry.vowel) {
    const v = entry.vowel.toUpperCase();
    lines.push(`¡Hola! Vamos a la lección de la vocal ${v}.`);
    return lines;
  }
  if (entry.kind === "consonant" && entry.letter) {
    lines.push(`¡Hola! Vamos a la lección de la letra ${entry.letter}.`);
    return lines;
  }
  // Fallback: title only (real catalog title)
  lines.push(`¡Hola! ${entry.title}.`);
  return lines;
}

export function buildSuccessLine(): string {
  const opts = ["¡Muy bien!", "¡Excelente!", "¡Lo lograste!", "¡Qué bien!"];
  return opts[Math.floor(Math.random() * opts.length)]!;
}

export function buildMissLine(): string {
  const opts = ["¡Inténtalo otra vez!", "¡Casi! Prueba otra vez.", "¡Tú puedes!"];
  return opts[Math.floor(Math.random() * opts.length)]!;
}
