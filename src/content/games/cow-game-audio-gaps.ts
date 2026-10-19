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
