/**
 * Tutor lesson content & instructional graph loader (spec §7 + Milestone 8).
 *
 * Nothing here is hand-typed. `deriveTutorItems()` walks the canonical verbatim
 * book transcriptions (`lessons-01-07.json` and `lessons-08-24.json`) in order,
 * preserving the locked §7 derivation for Lecciones 1–3 (24 + 8 + 9 = 41 items)
 * and generalizing cleanly across all 24 lessons while respecting the documented
 * `absent-in-source` gap on printed workbook pages 86–87.
 *
 * The canonical 24-lesson instructional graph (`src/content/tutor-graph/lesson-01..24.json`)
 * enriches each lesson with prerequisites, PDF-sheet vs printed-page mapping,
 * Flip Chart links, live game bindings, and approved audio coverage.
 */
import bt0107 from "@/data/book-transcription/lessons-01-07.json";
import bt0824 from "@/data/book-transcription/lessons-08-24.json";
import { SOURCE_BLOCKED_WORKBOOK_PAGES, workbookPagesForLesson } from "@/lib/workbook-pages";

import graph01 from "@/content/tutor-graph/lesson-01.json";
import graph02 from "@/content/tutor-graph/lesson-02.json";
import graph03 from "@/content/tutor-graph/lesson-03.json";
import graph04 from "@/content/tutor-graph/lesson-04.json";
import graph05 from "@/content/tutor-graph/lesson-05.json";
import graph06 from "@/content/tutor-graph/lesson-06.json";
import graph07 from "@/content/tutor-graph/lesson-07.json";
import graph08 from "@/content/tutor-graph/lesson-08.json";
import graph09 from "@/content/tutor-graph/lesson-09.json";
import graph10 from "@/content/tutor-graph/lesson-10.json";
import graph11 from "@/content/tutor-graph/lesson-11.json";
import graph12 from "@/content/tutor-graph/lesson-12.json";
import graph13 from "@/content/tutor-graph/lesson-13.json";
import graph14 from "@/content/tutor-graph/lesson-14.json";
import graph15 from "@/content/tutor-graph/lesson-15.json";
import graph16 from "@/content/tutor-graph/lesson-16.json";
import graph17 from "@/content/tutor-graph/lesson-17.json";
import graph18 from "@/content/tutor-graph/lesson-18.json";
import graph19 from "@/content/tutor-graph/lesson-19.json";
import graph20 from "@/content/tutor-graph/lesson-20.json";
import graph21 from "@/content/tutor-graph/lesson-21.json";
import graph22 from "@/content/tutor-graph/lesson-22.json";
import graph23 from "@/content/tutor-graph/lesson-23.json";
import graph24 from "@/content/tutor-graph/lesson-24.json";

export type TutorItemKind = "vowel" | "syllable" | "word" | "sight-word" | "sentence";

export interface TutorItem {
  /** Stable id, e.g. "l1-vowel-a", "l1-word-abrigo", "l7-syllable-ma". */
  id: string;
  lesson: number;
  /** Printed text as the book prints it (accents and ñ preserved). */
  text: string;
  kind: TutorItemKind;
  /** Printed workbook page where the item first appears in this lesson. */
  printedPage: number;
  /** Optional PDF sheet number (kept strictly separate from printedPage). */
  pdfSheet?: number | null;
  source?: "workbook" | "flipchart";
  approvedAudioSrc?: string | null;
  tutorLineId?: string | null;
}

export interface TutorGraphPageNode {
  printedPage: number;
  pdfSheet: number | null;
  status: "verified" | "absent-in-source";
  exerciseId: string;
  exerciseKind: string;
  prompt: string | null;
  flipchartPrimaryPages: number[];
  flipchartSupplementalPages: number[];
}

export interface TutorLessonGraph {
  schemaVersion: string;
  lessonId: string;
  lesson: number;
  title: string;
  kind: "intro" | "vowel" | "consonant";
  focus: string;
  printedWorkbookPages: {
    start: number;
    end: number;
    pages: number[];
    absentInSourcePages: number[];
  };
  pdfSheets: {
    start: number | null;
    end: number | null;
    sheets: number[];
  };
  flipchartPages: number[];
  prerequisiteLessons: string[];
  nextLessons: string[];
  sourceStatus: "verified" | "partial-absent-in-source";
  pendingSources: string[];
  games: { id: string; type: string; answerKeyStatus: string }[];
  pages: TutorGraphPageNode[];
  flipchartVocab: {
    word: string;
    flipchartPage: number | null;
    illustrationSrc: string | null;
    approvedAudioSrc: string | null;
  }[];
  items: TutorItem[];
  summary: {
    totalItems: number;
    byKind: Record<TutorItemKind, number>;
    itemsWithApprovedAudio: number;
    itemsAudioPending: number;
  };
}

/** Live voice-tutor routes currently unlocked in UI (Lecciones 1–3). */
export const TUTOR_LESSONS = [1, 2, 3] as const;

/** All 24 curriculum lessons covered by the instructional graph. */
export const ALL_CURRICULUM_LESSONS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
] as const;

export const tutorLessonGraphs: readonly TutorLessonGraph[] = [
  graph01,
  graph02,
  graph03,
  graph04,
  graph05,
  graph06,
  graph07,
  graph08,
  graph09,
  graph10,
  graph11,
  graph12,
  graph13,
  graph14,
  graph15,
  graph16,
  graph17,
  graph18,
  graph19,
  graph20,
  graph21,
  graph22,
  graph23,
  graph24,
] as unknown as readonly TutorLessonGraph[];

const graphByLesson = new Map<number, TutorLessonGraph>(
  tutorLessonGraphs.map((graph) => [graph.lesson, graph]),
);

/** Look up the instructional graph node for a lesson (1–24). */
export function lessonGraphFor(lesson: number): TutorLessonGraph | undefined {
  return graphByLesson.get(lesson);
}

type PictureGridPage = { lesson: number; type: "picture-grid"; rows: [string, boolean][][] };
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
type WritingPage = { lesson: number; type: "writing" };
type CirclePage = {
  lesson: number;
  type: "circle";
  circle: { syllable: string; rows: string[][] }[];
};
type LetterPage = {
  lesson: number;
  type: "letter";
  vocabColumns: string[][];
  sightWords: string[];
  sentences: string[];
};
type CompletePage = {
  lesson: number;
  type: "complete";
  fill: { wordBox: string }[];
};
type Bt1Page =
  | PictureGridPage
  | VowelPickOnePage
  | VowelMatchAllPage
  | VowelLineMatchPage
  | WritingPage
  | CirclePage
  | LetterPage
  | CompletePage;

type Bt2Lesson = {
  lesson: number;
  pages: { write: number; circle: number; letter: number; complete: number };
  circle: { syllable: string; rows: string[][] }[];
  vocab: string[];
  sightWords: string[];
  sentences: string[];
  fill: { wordBox: string }[] | null;
};

const bt1Pages = (bt0107 as unknown as { pages: Record<string, Bt1Page> }).pages;
const bt2Lessons = (bt0824 as unknown as { lessons: Record<string, Bt2Lesson> }).lessons;

function pageContent(page: Bt1Page): { vowelLetters: string[]; answerWords: string[] } {
  switch (page.type) {
    case "picture-grid":
      return { vowelLetters: [], answerWords: page.rows.flat().filter((c) => c[1]).map((c) => c[0]) };
    case "vowel-pick-one":
      return {
        vowelLetters: page.rows.map((r) => r.letter),
        answerWords: page.rows.flatMap((r) => r.pictures.filter((c) => c[1]).map((c) => c[0])),
      };
    case "vowel-match-all":
      return { vowelLetters: page.letters, answerWords: page.pairs.map((p) => p[1]) };
    case "vowel-line-match":
      return {
        vowelLetters: [page.letterPair[0].toLowerCase()],
        answerWords: page.cells.filter((c) => c[1]).map((c) => c[0]),
      };
    default:
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
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function deriveVowelLessonItems(lesson: number): TutorItem[] {
  const { start, end } = workbookPagesForLesson(lesson);
  const seen = new Set<string>();
  const vowels: { text: string; printedPage: number }[] = [];
  const words: { text: string; printedPage: number }[] = [];

  for (let p = start; p <= end; p++) {
    const data = bt1Pages[String(p)];
    if (!data || data.lesson !== lesson) continue;
    const { vowelLetters, answerWords } = pageContent(data);
    for (const letter of vowelLetters) {
      const key = `vowel:${letter}`;
      if (seen.has(key)) continue;
      seen.add(key);
      vowels.push({ text: letter, printedPage: p });
    }
    for (const word of answerWords) {
      const key = `word:${word.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      words.push({ text: word, printedPage: p });
    }
  }

  return [
    ...vowels.map(({ text, printedPage }) => ({
      id: `l${lesson}-vowel-${idSlug(text)}`,
      lesson,
      text,
      kind: "vowel" as const,
      printedPage,
    })),
    ...words.map(({ text, printedPage }) => ({
      id: `l${lesson}-word-${idSlug(text)}`,
      lesson,
      text,
      kind: "word" as const,
      printedPage,
    })),
  ];
}

function deriveConsonantLessonItems(lesson: number): TutorItem[] {
  const { start } = workbookPagesForLesson(lesson);
  const circlePage = start + 1;
  const letterPage = start + 2;
  const completePage = start + 3;

  let circle: { syllable: string; rows: string[][] }[] = [];
  let vocab: string[] = [];
  let sightWords: string[] = [];
  let sentences: string[] = [];
  let fill: { wordBox: string }[] = [];

  if (lesson === 7) {
    const c = bt1Pages[String(circlePage)];
    const l = bt1Pages[String(letterPage)];
    const f = bt1Pages[String(completePage)];
    if (c?.type === "circle") circle = c.circle;
    if (l?.type === "letter") {
      vocab = l.vocabColumns.flat();
      sightWords = l.sightWords;
      sentences = l.sentences;
    }
    if (f?.type === "complete") fill = f.fill;
  } else {
    const ld = bt2Lessons[String(lesson)];
    if (!ld) return [];
    circle = ld.circle ?? [];
    vocab = ld.vocab ?? [];
    sightWords = ld.sightWords ?? [];
    sentences = ld.sentences ?? [];
    // Absent-in-source pages (pp. 86-87) contribute zero invented fill items.
    fill = SOURCE_BLOCKED_WORKBOOK_PAGES.includes(completePage) ? [] : (ld.fill ?? []);
  }

  const items: TutorItem[] = [];
  const seen = new Set<string>();
  const pushUnique = (kind: TutorItemKind, text: string, printedPage: number) => {
    const slug = idSlug(text);
    const dedupKey = `${kind}:${slug}`;
    if (!slug || seen.has(dedupKey)) return;
    seen.add(dedupKey);
    const prefix = kind === "sight-word" ? "sight" : kind;
    items.push({ id: `l${lesson}-${prefix}-${slug}`, lesson, text, kind, printedPage });
  };

  for (const row of circle) pushUnique("syllable", row.syllable, circlePage);
  for (const row of circle) {
    for (const r of row.rows) {
      for (const word of r) pushUnique("word", word, circlePage);
    }
  }
  for (const word of vocab) pushUnique("word", word, letterPage);
  for (const entry of fill) {
    if (entry.wordBox && entry.wordBox.trim().length > 1) {
      pushUnique("word", entry.wordBox.trim(), completePage);
    }
  }
  for (const sw of sightWords) pushUnique("sight-word", sw, letterPage);
  sentences.forEach((sentence, index) => {
    const text = sentence.trim();
    if (!text) return;
    items.push({
      id: `l${lesson}-sentence-${String(index + 1).padStart(2, "0")}`,
      lesson,
      text,
      kind: "sentence",
      printedPage: letterPage,
    });
  });

  return items;
}

/**
 * Derive all tutor items from the canonical book transcriptions.
 * Defaults to all 24 lessons; pass `TUTOR_LESSONS` for L1–3 only.
 */
export function deriveTutorItems(lessons: readonly number[] = ALL_CURRICULUM_LESSONS): TutorItem[] {
  const items: TutorItem[] = [];
  for (const lesson of lessons) {
    if (lesson < 1 || lesson > 24 || !Number.isInteger(lesson)) continue;
    if (lesson <= 6) items.push(...deriveVowelLessonItems(lesson));
    else items.push(...deriveConsonantLessonItems(lesson));
  }
  return items;
}

/** Every derived item across Lessons 1–24, in canonical order. */
export const tutorItems: readonly TutorItem[] = deriveTutorItems();

/** Items for one lesson in locked order (empty for out-of-range lessons). */
export function itemsForLesson(lesson: number): readonly TutorItem[] {
  return tutorItems.filter((item) => item.lesson === lesson);
}

/** Look up one derived item by lesson and exact text; throws if absent. */
export function findTutorItem(lesson: number, text: string): TutorItem {
  const item = tutorItems.find((it) => it.lesson === lesson && it.text === text);
  if (!item) throw new Error(`No tutor item "${text}" in Lección ${lesson}`);
  return item;
}
