import { lessons as vowelLessons, type VowelLesson } from "@/lib/cartilla-content";
import consonantsData from "@/content/consonants.json";

export type ConsonantLessonData = {
  letter: string;
  lesson: number;
  pages: string;
  color: string;
  syllables: string[];
  examples: Record<string, string[]>;
  sentences: string[];
};

export type CatalogEntry =
  | { n: number; kind: "intro"; title: string; subtitle: string; pages: string; color: string }
  | {
      n: number;
      kind: "vowel";
      title: string;
      subtitle: string;
      pages: string;
      color: string;
      vowel: string;
      lesson: VowelLesson;
    }
  | {
      n: number;
      kind: "consonant";
      title: string;
      subtitle: string;
      pages: string;
      color: string;
      letter: string;
      data: ConsonantLessonData;
    };

const consonants = consonantsData as unknown as ConsonantLessonData[];

const VOWEL_LESSON_NUMBER: Record<string, number> = { o: 2, a: 3, e: 4, i: 5, u: 6 };
const VOWEL_PAGES: Record<string, string> = {
  o: "4-6",
  a: "7-9",
  e: "10-12",
  i: "13-15",
  u: "16-18",
};

function vowelEntry(v: VowelLesson): CatalogEntry {
  const n = VOWEL_LESSON_NUMBER[v.vowel] ?? 99;
  return {
    n,
    kind: "vowel",
    title: `Vocal ${v.vowel.toUpperCase()} ${v.vowel}`,
    subtitle: v.characterName,
    pages: VOWEL_PAGES[v.vowel] ?? "",
    color: v.color,
    vowel: v.vowel,
    lesson: v,
  };
}

export const CATALOG: CatalogEntry[] = [
  {
    n: 1,
    kind: "intro" as const,
    title: "Introducción de las vocales",
    subtitle: "Las cinco vocales: a, e, i, o, u",
    pages: "1-3",
    color: "hsl(230 75% 58%)",
  },
  ...vowelLessons.map(vowelEntry),
  ...consonants.map<CatalogEntry>((c) => ({
    n: c.lesson,
    kind: "consonant",
    title: `Letra ${c.letter.toUpperCase()} ${c.letter}`,
    subtitle: `Sílabas: ${c.syllables.join(" · ")}`,
    pages: c.pages,
    color: c.color,
    letter: c.letter,
    data: c,
  })),
].sort((a, b) => a.n - b.n);

export const TOTAL_LESSONS = CATALOG.length; // 24
