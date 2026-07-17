import { lessons as vowelLessons, type VowelLesson } from "@/lib/cartilla-content";
import consonantsData from "@/content/consonants.json";

export type ConsonantLessonData = {
  letter: string;
  lesson: number;
  pages: string;
  color: string;
  syllables: string[];
  vocab: { word: string; emoji: string; illustrationSrc?: string }[];
  examples: Record<string, string[]>;
  sentences: string[];
};

/** Matches ActivityCarousel's tab ids — kept here since the catalog is the
 * source of truth for which activities a lesson offers. */
export type ActivityId = "silabas" | "palabras" | "armar" | "trazar" | "piano";

/** Every lesson currently offers the same 5 activities in this order. Set a
 * lesson's `activities` field to override which ones show and in what order. */
export const DEFAULT_ACTIVITIES: ActivityId[] = ["silabas", "palabras", "armar", "trazar", "piano"];

export type CatalogEntry =
  | {
      n: number;
      kind: "intro";
      title: string;
      subtitle: string;
      pages: string;
      color: string;
      activities?: ActivityId[];
    }
  | {
      n: number;
      kind: "vowel";
      title: string;
      subtitle: string;
      pages: string;
      color: string;
      vowel: string;
      lesson: VowelLesson;
      activities?: ActivityId[];
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
      activities?: ActivityId[];
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

// Per-lesson activity picks (owner decision, July 2026):
//   - Lección 1 (vowel overview, before any single vowel is taught in
//     isolation): lighter touch — only Sílabas + Emparejar.
//   - Lecciones 2-6 (vowels) and 7-24 (consonants): all 5 activities, same
//     as DEFAULT_ACTIVITIES, so no override needed for those.
const LECCION_1_ACTIVITIES: ActivityId[] = ["silabas", "palabras"];

export const CATALOG: CatalogEntry[] = [
  {
    n: 1,
    kind: "intro" as const,
    title: "Introducción de las vocales",
    subtitle: "Las cinco vocales: a, e, i, o, u",
    pages: "1-3",
    color: "hsl(230 75% 58%)",
    activities: LECCION_1_ACTIVITIES,
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
