// Audio the cow game needs from the owner's own recordings. Nothing is generated.
// Every url is empty until the owner supplies the file; the game plays silent meanwhile.
export type CowAudioGap = { cue: string; text: string; url: string | null };

export const COW_AUDIO_GAPS: CowAudioGap[] = [
  { cue: "instruction", text: "Coloca cada vaca en su sílaba", url: null },
  { cue: "correct", text: "ma ma", url: null },
  { cue: "wrong", text: "moo (cow sound)", url: null },
  { cue: "syllable-mo", text: "mo", url: null },
  { cue: "syllable-mu", text: "mu", url: null },
  { cue: "syllable-ma", text: "ma", url: null },
  { cue: "syllable-mi", text: "mi", url: null },
  { cue: "syllable-me", text: "me", url: null },
  { cue: "syllable-ma-accent", text: "má", url: null },
];

// Syllable recordings by plain syllable (accent stripped). Null = not recorded yet.
// Checked 2026-10-19: public/audio (main) and audio/owner-instructions-20261019 hold
// 162 vocabulary words and 40 workbook instruction lines, no isolated syllables.
export const COW_SYLLABLE_AUDIO: Record<string, string | null> = {
  ma: null,
  mo: null,
  mu: null,
  mi: null,
  me: null,
};
