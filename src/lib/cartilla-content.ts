import lessonsData from "@/content/lessons.json";
import miamiData from "@/content/miami-dade.json";

export type VocabWord = { word: string; emoji: string };
export type MatchPair = { left: string; right: string; pairId: number };
export type CheckboxItem = { word: string; emoji: string; startsWithVowel: boolean };
export type VowelLesson = {
  id: string;
  vowel: string;
  color: string;
  colorLight: string;
  colorGradient: string;
  characterName: string;
  characterDesc: string;
  vocab: VocabWord[];
  matchPairs: MatchPair[];
  checkboxItems: CheckboxItem[];
};
export type MiamiQuestion = {
  q: string;
  options: string[];
  correct: string;
  best_standard?: string;
};

export const LESSONS_OVERRIDE_KEY = "cartilla.lessons.override.v1";
export const MIAMI_OVERRIDE_KEY = "cartilla.miami.override.v1";

function loadOverride<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const lessons = loadOverride<VowelLesson[]>(
  LESSONS_OVERRIDE_KEY,
  lessonsData as VowelLesson[],
);
export const miami = loadOverride<MiamiQuestion[]>(
  MIAMI_OVERRIDE_KEY,
  miamiData as MiamiQuestion[],
);

export const defaultLessons = lessonsData as VowelLesson[];
export const defaultMiami = miamiData as MiamiQuestion[];

const stripDiacritics = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const fastTest = lessons.flatMap((l) =>
  l.vocab.slice(0, 2).map((v) => ({
    word: v.word,
    emoji: v.emoji,
    correctVowel: stripDiacritics(v.word).charAt(0),
  })),
);

export const VOWELS = ["a", "e", "i", "o", "u"] as const;
