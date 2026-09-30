/**
 * Source-by-surface vocabulary (PROJECT_SOURCE_OF_TRUTH.md).
 *
 * The Student Workbook and the Teacher Flip Chart are related books, not
 * interchangeable word lists. Every list returned here carries its book so a
 * surface can never silently mix them:
 *
 * - Workbook activity / Workbook practice / Workbook print → getWorkbookWords()
 *   (derived from src/data/page-layouts.json, the verified Workbook source).
 * - Flip Chart / teacher presentation / Flip Chart print → getFlipchartPictureVocab()
 *   (the Flip Chart vocabulary plate, with crops of that plate's own art).
 */
import pageLayouts from "@/data/page-layouts.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { workbookPagesForLesson } from "@/lib/workbook-pages";
import { getNativeFlipchartPage } from "@/lib/flipchart-native";

export type WorkbookWordList = {
  book: "workbook";
  lessonNumber: number;
  workbookPages: number[];
  words: string[];
};

export type FlipchartPictureVocab = {
  book: "flipchart";
  lessonNumber: number;
  flipchartPage: number | null;
  items: { word: string; illustrationSrc?: string }[];
};

type LayoutCell = { word?: string; caption?: string; label?: string; wordBox?: string };
type LayoutRegion = {
  regionType: string;
  text?: string;
  cells?: LayoutCell[];
  matchRows?: LayoutCell[][];
  fillItems?: LayoutCell[];
  vowelRows?: { cells: LayoutCell[] }[];
  vowelPairs?: LayoutCell[];
};

const PAGES = (pageLayouts as unknown as { pages: Record<string, { regions: LayoutRegion[] }> }).pages;

function cellWord(cell: LayoutCell): string | undefined {
  return (cell.word ?? cell.caption ?? cell.label ?? cell.wordBox)?.trim() || undefined;
}

/** Words printed on the Workbook pages of one lesson, in page/reading order. */
export function getWorkbookWords(lessonNumber: number): WorkbookWordList {
  const { start, end } = workbookPagesForLesson(lessonNumber);
  const workbookPages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const words: string[] = [];
  const add = (w?: string) => {
    if (w && !words.includes(w)) words.push(w);
  };
  for (const page of workbookPages) {
    for (const region of PAGES[String(page)]?.regions ?? []) {
      if (region.regionType === "vocab-grid" && region.text) {
        region.text.split("·").forEach((w) => add(w.trim()));
      }
      // Picture cells: only the pictures that answer the page (not distractors).
      region.cells?.filter((c) => (c as { correct?: boolean }).correct !== false).forEach((c) => add(cellWord(c)));
      region.matchRows?.flat().forEach((c) => add(cellWord(c)));
      region.fillItems?.forEach((c) => add(c.wordBox?.trim()));
      region.vowelRows?.forEach((row) =>
        row.cells.filter((c) => (c as { correct?: boolean }).correct !== false).forEach((c) => add(cellWord(c))),
      );
      region.vowelPairs?.forEach((c) => add(cellWord(c)));
    }
  }
  return { book: "workbook", lessonNumber, workbookPages, words };
}

/** The Flip Chart picture-vocabulary plate for one lesson. */
export function getFlipchartPictureVocab(lessonNumber: number): FlipchartPictureVocab {
  const entry = CATALOG.find((e) => e.n === lessonNumber);
  if (entry?.kind === "consonant") {
    return {
      book: "flipchart",
      lessonNumber,
      flipchartPage: entry.data.vocabSource.flipchartPage,
      items: entry.data.vocab.map((v) => ({ word: v.word, illustrationSrc: v.illustrationSrc })),
    };
  }
  if (entry?.kind === "vowel") {
    // Vowel plates are Flip Chart pages 3–8 (Lesson N → page N + 2). Words and
    // art come from that plate itself, never from the Workbook vowel pages.
    const flipchartPage = lessonNumber + 2;
    const page = getNativeFlipchartPage(flipchartPage);
    const art = new Map((page?.art ?? []).map((a) => [a.word.toLocaleLowerCase("es"), a.src]));
    const items = (page?.words ?? [])
      .map((w) => w.parts.join("").trim())
      .filter((w) => w.length > 1)
      .map((word) => ({ word, illustrationSrc: art.get(word.toLocaleLowerCase("es")) }));
    return { book: "flipchart", lessonNumber, flipchartPage, items };
  }
  return { book: "flipchart", lessonNumber, flipchartPage: null, items: [] };
}

type PictureCell = { caption?: string; illustrationSrc?: string; correct?: boolean };

/** Pictures printed on the Workbook pages of one lesson (answer pictures only). */
export function getWorkbookPictures(lessonNumber: number): { word: string; illustrationSrc: string }[] {
  const { start, end } = workbookPagesForLesson(lessonNumber);
  const out: { word: string; illustrationSrc: string }[] = [];
  for (let page = start; page <= end; page += 1) {
    for (const region of PAGES[String(page)]?.regions ?? []) {
      const cells = [
        ...((region.cells ?? []) as PictureCell[]),
        ...((region.vowelRows ?? []).flatMap((row) => row.cells) as PictureCell[]),
        ...((region.vowelPairs ?? []) as PictureCell[]),
      ];
      for (const cell of cells) {
        if (cell.correct === false || !cell.caption || !cell.illustrationSrc) continue;
        if (out.some((item) => item.word === cell.caption)) continue;
        out.push({ word: cell.caption, illustrationSrc: cell.illustrationSrc });
      }
    }
  }
  return out;
}

export type PracticePictureWords = {
  book: "workbook" | "flipchart";
  /** Human-readable provenance shown on generic practice surfaces. */
  sourceLabel: string;
  items: { word: string; illustrationSrc?: string }[];
};

/**
 * Picture words for the generic home-practice surface. The Workbook consonant
 * pages have no picture vocabulary, so consonant practice uses the Flip Chart
 * vocabulary plate — and says so explicitly instead of mixing silently.
 */
export function getPracticePictureWords(lessonNumber: number): PracticePictureWords {
  const entry = CATALOG.find((e) => e.n === lessonNumber);
  if (entry?.kind === "consonant") {
    return {
      book: "flipchart",
      sourceLabel: `Dibujos del Rotafolio del maestro, pág. ${entry.data.vocabSource.flipchartPage}`,
      items: entry.data.vocab.map((v) => ({ word: v.word, illustrationSrc: v.illustrationSrc })),
    };
  }
  const { start, end } = workbookPagesForLesson(lessonNumber);
  const items =
    entry?.kind === "vowel"
      ? entry.lesson.vocab.map((v) => ({ word: v.word, illustrationSrc: v.illustrationSrc }))
      : getWorkbookPictures(lessonNumber);
  return { book: "workbook", sourceLabel: `Dibujos del Libro del alumno, págs. ${start}–${end}`, items };
}
