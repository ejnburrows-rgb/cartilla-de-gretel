/**
 * Gretel's browser speech is disabled for the silent student reader.
 * The exported helpers remain so visual progress reactions keep working.
 */
export type GretelVoiceHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
};

export function isGretelVoiceMuted(): boolean {
  return true;
}

export function setGretelVoiceMuted(_muted: boolean): void {}

export function getSelectedGretelVoiceName(): string {
  return "disabled";
}

export function cancelGretelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakAsGretel(
  _text: string,
  handlers: GretelVoiceHandlers = {},
): Promise<void> {
  cancelGretelSpeech();
  handlers.onEnd?.();
}

export const HOME_GREETING = "Bienvenidos a la Cartilla de Gretel. Vamos a aprender a leer juntos.";

export function buildHomeIntroLines(): string[] {
  return [HOME_GREETING];
}

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
  if (entry.kind === "vowel" && entry.vowel) return [`¡Hola! Vamos a la lección de la vocal ${entry.vowel.toUpperCase()}.`];
  if (entry.kind === "consonant" && entry.letter) return [`¡Hola! Vamos a la lección de la letra ${entry.letter}.`];
  return [`¡Hola! ${entry.title}.`];
}

export function buildSuccessLine(): string {
  return "¡Muy bien!";
}

export function buildMissLine(): string {
  return "¡Inténtalo otra vez!";
}
