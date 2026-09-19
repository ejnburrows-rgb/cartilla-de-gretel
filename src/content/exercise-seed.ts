// exercise-seed.ts — Spanish exercise instructions + seed word lists per lesson.
// All copy is professional, student-level, neutral Spanish.
// Used by PageExercisePane; Codex CRM may read for assignment templates.

import { LESSONS, type LessonMeta } from "./lesson-meta";

export type ExerciseKind = "syllable-tap" | "word-match" | "drag-build" | "reading" | "intro";

export type ExerciseSeed = {
  kind: ExerciseKind;
  instructionEs: string; // student-facing
  instructionEn: string; // teacher fallback / EN toggle
  syllables?: string[];
  words?: string[];
  pairs?: { word: string; imageKey: string }[];
};

// Spanish instruction copy locked. Do not paraphrase.
export const INSTRUCTIONS = {
  syllableTap: {
    es: "Toca la s\u00edlaba que escuches.",
    en: "Tap the syllable you hear.",
  },
  wordMatch: {
    es: "Presiona aquel dibujo que comience con la s\u00edlaba.",
    en: "Press the picture that starts with the syllable.",
  },
  dragBuild: {
    es: "Arrastra las s\u00edlabas y forma la palabra.",
    en: "Drag the syllables and build the word.",
  },
  reading: {
    es: "Lee en voz alta. Toca cada palabra al leerla.",
    en: "Read aloud. Tap each word as you read it.",
  },
  intro: {
    es: "Conoce a Gretel y prep\u00e1rate para leer.",
    en: "Meet Gretel and get ready to read.",
  },
} as const;

function seedForLesson(l: LessonMeta): ExerciseSeed[] {
  if (l.kind === "intro") {
    return [
      { kind: "intro", instructionEs: INSTRUCTIONS.intro.es, instructionEn: INSTRUCTIONS.intro.en },
    ];
  }
  const out: ExerciseSeed[] = [];
  // Page 1 of lesson → syllable tap
  out.push({
    kind: "syllable-tap",
    instructionEs: INSTRUCTIONS.syllableTap.es,
    instructionEn: INSTRUCTIONS.syllableTap.en,
    syllables: l.syllables,
  });
  // Page 2 of lesson → word match (picture-start)
  out.push({
    kind: "word-match",
    instructionEs: INSTRUCTIONS.wordMatch.es,
    instructionEn: INSTRUCTIONS.wordMatch.en,
    pairs: l.keywords.map((w) => ({ word: w, imageKey: `${l.letter.toLowerCase()}-${w}` })),
  });
  // Page 3 of lesson → drag-build
  out.push({
    kind: "drag-build",
    instructionEs: INSTRUCTIONS.dragBuild.es,
    instructionEn: INSTRUCTIONS.dragBuild.en,
    words: l.keywords,
  });
  // Page 4 (consonants only) → reading
  if (l.kind === "consonant") {
    out.push({
      kind: "reading",
      instructionEs: INSTRUCTIONS.reading.es,
      instructionEn: INSTRUCTIONS.reading.en,
      words: l.keywords,
    });
  }
  return out;
}

export const EXERCISES_BY_LESSON: Record<number, ExerciseSeed[]> = Object.fromEntries(
  LESSONS.map((l) => [l.n, seedForLesson(l)]),
);

export function exerciseForPage(page: number): ExerciseSeed | null {
  const lesson = LESSONS.find((l) => page >= l.pages[0] && page <= l.pages[1]);
  if (!lesson) return null;
  const seeds = EXERCISES_BY_LESSON[lesson.n] ?? [];
  const offset = page - lesson.pages[0]; // 0-indexed within lesson
  return seeds[offset] ?? seeds[seeds.length - 1] ?? null;
}
