// AUDIO INTEGRATION POINTS — intentionally silent.
// The owner supplies all audio separately. Mirrors cartilla-de-gretel's
// src/lib/games/wordAudio.ts contract: recorded files only, never TTS.
// To connect: fill WORD_AUDIO / INSTRUCTIONS_AUDIO with approved file URLs.

export const WORD_AUDIO: Record<string, string | undefined> = {
  mapa: undefined,
  pomo: undefined,
  Mupi: undefined,
  Pepe: undefined,
  puma: undefined,
  Pupi: undefined,
};

export const INSTRUCTIONS_AUDIO: string | undefined = undefined;

/** Feedback hooks (correct / try again / word complete). */
export const FEEDBACK_AUDIO: Record<"ok" | "wrong" | "complete", string | undefined> = {
  ok: undefined,
  wrong: undefined,
  complete: undefined,
};

function play(url?: string) {
  if (!url || typeof window === "undefined") return;
  new Audio(url).play().catch(() => {});
}

export const playWord = (word: string) => play(WORD_AUDIO[word]);
export const playInstructions = () => play(INSTRUCTIONS_AUDIO);
export const playFeedback = (k: keyof typeof FEEDBACK_AUDIO) => play(FEEDBACK_AUDIO[k]);
