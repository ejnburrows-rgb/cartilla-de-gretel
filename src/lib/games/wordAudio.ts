// wordAudio.ts — slot-based word/instruction audio for the themed Cartilla games.
// Canon bans browser TTS as a substitute for real narration, so this plays recorded
// audio files only. With no audioUrl (current state), it no-ops safely — tiles already
// show the syllables/word visibly, so the game stays fully playable. Real audio drops
// in later by filling audioUrl in the content files; no component change required.

function playUrl(url?: string): void {
  if (!url || typeof window === "undefined") return;
  const audio = new Audio(url);
  audio.play().catch(() => {
    /* autoplay or missing-file — game stays playable from visible tiles */
  });
}

export function playWord(url?: string): void {
  playUrl(url);
}

export function playInstruction(url?: string): void {
  playUrl(url);
}
