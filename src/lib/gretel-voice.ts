import { stopSpeech } from "./speech-playback";
import { playRecordedSpeech, reportRecordedSpeechStatus } from "./recorded-speech";

/** Recording files only. Legacy provider fields cannot enable synthesis or execute callbacks. */
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
export const GRETEL_PRIMARY_VOICE = "Grabaciones";
export const GRETEL_FALLBACK_VOICE = "Sin grabación";
const DEFAULT_PROVIDER_CONFIG: GretelVoiceProviderConfig = { type: "recorded-audio", name: "Grabaciones aprobadas" };
let mutedMemory = false;
let lastSpokenVoiceName = "none";
export function getGretelVoiceProviderConfig(): GretelVoiceProviderConfig { return { ...DEFAULT_PROVIDER_CONFIG }; }
/** Kept for existing callers. No legacy browser/cloud/custom callback is executable. */
export function setGretelVoiceProviderConfig(_config: GretelVoiceProviderConfig): void { /* recording-only policy */ }
export function resetGretelVoiceProviderConfig(): void { /* no alternate providers */ }
export function scoreVoice(_voice: SpeechSynthesisVoice): number { return -1; }
export function pickVoice(): SpeechSynthesisVoice | null { return null; }
export function getAvailableGretelVoices(): SpeechSynthesisVoice[] { return []; }
export function isGretelVoiceMuted(): boolean {
  if (mutedMemory) return true;
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return mutedMemory; }
}
export function setGretelVoiceMuted(muted: boolean): void {
  mutedMemory = muted;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch { /* memory flag remains authoritative */ }
  }
  if (muted) cancelGretelSpeech();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cartilla:audio-settings"));
}
export function getSelectedGretelVoiceName(): string { return lastSpokenVoiceName; }
export function cancelGretelSpeech(): void {
  stopSpeech();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
}
export async function speakAsGretel(text: string, handlers: GretelVoiceHandlers = {}): Promise<void> {
  lastSpokenVoiceName = "none";
  if (isGretelVoiceMuted()) {
    reportRecordedSpeechStatus('muted', text);
    handlers.onEnd?.(); return;
  }
  return playRecordedSpeech(text, "gretel", { ...handlers, onStart: () => {
    lastSpokenVoiceName = "Grabación aprobada";
    handlers.onStart?.();
  } });
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
