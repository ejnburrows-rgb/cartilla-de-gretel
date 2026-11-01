/**
 * Tutor lesson content — derived from the verbatim book transcription (spec §7).
 *
 * Nothing here is hand-typed. `deriveTutorItems()` walks the printed workbook
 * pages in order, takes each page's printed vowel letter(s) and its correct
 * answers in reading order, and dedupes within the lesson. Writing pages
 * (pp. 6 and 9) contribute no spoken item.
 *
 * Locked result (GRETEL-TUTOR-BUILD-SPEC §7 table):
 *   Lección 1 (pp. 1–3): 5 vowels a, e, i, o, u + 19 words = 24 items
 *   Lección 2 (pp. 4–6): vowel o + 7 words = 8 items
 *   Lección 3 (pp. 7–9): vowel a + 8 words = 9 items
 * The test `src/lib/__tests__/tutor-content.test.ts` locks this exactly.
 */
import bookData from "@/data/book-transcription/lessons-01-07.json";

export type TutorItemKind = "vowel" | "word";

export interface TutorItem {
  /** Stable id, e.g. "l1-vowel-a" or "l1-word-abrigo". */
  id: string;
  lesson: number;
  /** Printed text as the book prints it (accents and ñ preserved). */
  text: string;
  kind: TutorItemKind;
  /** Printed workbook page where the item first appears in this lesson. */
  printedPage: number;
}

/** Lecciones covered by tutor milestone 1 (workbook pages 1–9). */
export const TUTOR_LESSONS = [1, 2, 3] as const;

type PictureGridPage = {
  lesson: number;
  type: "picture-grid";
  rows: [string, boolean][][];
};
type VowelPickOnePage = {
  lesson: number;
  type: "vowel-pick-one";
  rows: { letter: string; pictures: [string, boolean][] }[];
};
type VowelMatchAllPage = {
  lesson: number;
  type: "vowel-match-all";
  letters: string[];
  pairs: [string, string][];
};
type VowelLineMatchPage = {
  lesson: number;
  type: "vowel-line-match";
  letterPair: string;
  cells: [string, boolean][];
};
type WritingPage = {
  lesson: number;
  type: "writing";
};
type BookPage =
  | PictureGridPage
  | VowelPickOnePage
  | VowelMatchAllPage
  | VowelLineMatchPage
  | WritingPage;

type BookTranscription = { pages: Record<string, BookPage> };

/** Printed vowel letters and correct-answer words of one page, in reading order. */
function pageContent(page: BookPage): { vowelLetters: string[]; answerWords: string[] } {
  switch (page.type) {
    case "picture-grid":
      // Correct answers row by row, left to right.
      return { vowelLetters: [], answerWords: page.rows.flat().filter((c) => c[1]).map((c) => c[0]) };
    case "vowel-pick-one":
      return {
        vowelLetters: page.rows.map((r) => r.letter),
        answerWords: page.rows.flatMap((r) => r.pictures.filter((c) => c[1]).map((c) => c[0])),
      };
    case "vowel-match-all":
      return { vowelLetters: page.letters, answerWords: page.pairs.map((p) => p[1]) };
    case "vowel-line-match":
      // The printed box is the letter pair, e.g. "Oo" → the vowel "o".
      return { vowelLetters: [page.letterPair[0].toLowerCase()], answerWords: page.cells.filter((c) => c[1]).map((c) => c[0]) };
    case "writing":
      // Writing pages have no spoken item (spec §7).
      return { vowelLetters: [], answerWords: [] };
  }
}

/** Lowercase slug for stable ids; keeps ñ so "uña" can never collide with "una". */
function idSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, (mark) => (mark === "\u0303" ? mark : ""))
    .normalize("NFC")
    .replace(/[^a-zñ0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derive all tutor items from the book transcription. Within each lesson the
 * vowel items come first (printed order across pages), then the word items
 * (page order, reading order within a page), deduped within the lesson.
 */
export function deriveTutorItems(): TutorItem[] {
  const pages = Object.entries((bookData as BookTranscription).pages)
    .map(([pageNumber, page]) => ({ page: Number(pageNumber), data: page }))
    .sort((a, b) => a.page - b.page);

  const items: TutorItem[] = [];
  for (const lesson of TUTOR_LESSONS) {
    const seen = new Set<string>();
    const vowels: { text: string; printedPage: number }[] = [];
    const words: { text: string; printedPage: number }[] = [];

    for (const { page, data } of pages) {
      if (data.lesson !== lesson) continue;
      const { vowelLetters, answerWords } = pageContent(data);
      for (const letter of vowelLetters) {
        const key = `vowel:${letter}`;
        if (seen.has(key)) continue;
        seen.add(key);
        vowels.push({ text: letter, printedPage: page });
      }
      for (const word of answerWords) {
        const key = `word:${word.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        words.push({ text: word, printedPage: page });
      }
    }

    for (const { text, printedPage } of vowels) {
      items.push({ id: `l${lesson}-vowel-${idSlug(text)}`, lesson, text, kind: "vowel", printedPage });
    }
    for (const { text, printedPage } of words) {
      items.push({ id: `l${lesson}-word-${idSlug(text)}`, lesson, text, kind: "word", printedPage });
    }
  }
  return items;
}

/** All derived tutor items, in locked order (Lecciones 1–3). */
export const tutorItems: readonly TutorItem[] = deriveTutorItems();

/** Derived items of one lesson, in locked order. */
export function itemsForLesson(lesson: number): readonly TutorItem[] {
  return tutorItems.filter((item) => item.lesson === lesson);
}

/** Look up one derived item by lesson and printed text (e.g. for tests). */
export function findTutorItem(lesson: number, text: string): TutorItem {
  const item = tutorItems.find((it) => it.lesson === lesson && it.text === text);
  if (!item) {
    throw new Error(`No tutor item for lesson ${lesson}, text "${text}"`);
  }
  return item;
}