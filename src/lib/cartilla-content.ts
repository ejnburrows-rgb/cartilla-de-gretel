import lessonsData from "@/content/lessons.json";
import miamiData from "@/content/miami-dade.json";

export type VocabWord = { word: string; };
export type MatchPair = { left: string; right: string; pairId: number };
export type CheckboxItem = { word: string; startsWithVowel: boolean };
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
    const parsed = JSON.parse(raw);
    
    // Safety check: if it's the lessons override, ensure the first item has a 'vowel' property.
    // If it's an old schema from a previous deployment, fallback to the default to prevent crashes.
    if (key === LESSONS_OVERRIDE_KEY && Array.isArray(parsed) && parsed.length > 0) {
      if (!parsed[0].vowel) {
        console.warn("Discarding outdated lessons override from localStorage");
        localStorage.removeItem(key);
        return fallback;
      }
    }
    
    return parsed as T;
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
    correctVowel: stripDiacritics(v.word).charAt(0),
  })),
);

export const VOWELS = ["a", "e", "i", "o", "u"] as const;
