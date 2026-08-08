/**
 * Gretel voice policy: the student workbook is intentionally silent.
 * Kept as a compatibility module for existing lesson composition.
 */
export type GretelVoiceHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
};

export type IntroCatalogSlice = {
  n: number;
  kind: string;
  title: string;
  subtitle?: string;
  letter?: string;
  vowel?: string;
};

export function isGretelVoiceMuted(): boolean {
  return true;
}

export function setGretelVoiceMuted(_muted: boolean): void {
  cancelGretelSpeech();
}

export function getSelectedGretelVoiceName(): string {
  return "disabled";
}

export function cancelGretelSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Speech is optional in browsers; cancellation failure is irrelevant here.
  }
}

export async function speakAsGretel(
  _text: string,
  handlers: GretelVoiceHandlers = {},
): Promise<void> {
  cancelGretelSpeech();
  handlers.onEnd?.();
}

export const HOME_GREETING = "";

export function buildHomeIntroLines(): string[] {
  return [];
}

export function buildLessonIntroLines(_entry: IntroCatalogSlice): string[] {
  return [];
}

export function buildSuccessLine(): string {
  return "";
}

export function buildMissLine(): string {
  return "";
}
