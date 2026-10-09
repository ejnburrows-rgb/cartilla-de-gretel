/**
 * Lesson exercises — one entry per printed Workbook page, DERIVED from
 * src/data/page-layouts.json (the verified Workbook source, guarded by the
 * book-fidelity tests). This replaces 24 hand-written files whose page
 * numbers (e.g. Lesson 8 on pages 29–32) and prompts ("Traza…") had drifted
 * from the book. Nothing here may be edited by hand: fix page-layouts.json
 * against the scan and every consumer follows.
 */
import pageLayouts from "@/data/page-layouts.json";
import { getBookPageImage } from "@/lib/bookImages";
import { SOURCE_BLOCKED_WORKBOOK_PAGES, workbookPagesForLesson } from "@/lib/workbook-pages";

export type LessonExerciseItem = { id: string; label: string };

export type LessonExercise = {
  id: string;
  lessonNumber: number;
  pageNumber: number;
  kind: string;
  title: string;
  /** Printed instruction(s) of the page, verbatim, in reading order. */
  prompt: string;
  items: LessonExerciseItem[];
  targets: never[];
  sourceStatus: "page-layouts";
  transcriptionStatus: "verified-against-scan" | "source-blocked";
  studentFacingStatus: "live";
  teacherNotes: string;
  sourcePage: string | null;
};

type Cell = { caption?: string; word?: string; wordBox?: string };
type Region = {
  id: string;
  regionType: string;
  order: number;
  text?: string;
  modelText?: string;
  syllable?: string;
  sentences?: string[];
  cells?: Cell[];
  matchRows?: Cell[][];
  fillItems?: Cell[];
  vowelRows?: { cells: Cell[] }[];
  vowelPairs?: Cell[];
};

const PAGES = (pageLayouts as unknown as { pages: Record<string, { regions: Region[] }> }).pages;

const KIND_PRIORITY = [
  "picture-grid",
  "vowel-pick-one",
  "vowel-match-all",
  "vowel-line-match",
  "syllable-match",
  "fill-in-blank",
  "reading-sentences",
  "writing-line",
  "writing-response",
  "draw-box",
];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pageItems(regions: Region[]): LessonExerciseItem[] {
  const labels: string[] = [];
  const add = (value?: string) => {
    const v = value?.trim();
    if (v && !labels.includes(v)) labels.push(v);
  };
  for (const r of regions) {
    r.cells?.forEach((c) => add(c.caption ?? c.word));
    r.vowelRows?.forEach((row) => row.cells.forEach((c) => add(c.caption ?? c.word)));
    r.vowelPairs?.forEach((c) => add(c.caption ?? c.word));
    r.matchRows?.flat().forEach((c) => add(c.word));
    r.fillItems?.forEach((c) => add(c.wordBox));
    if (r.regionType === "writing-line") add(r.modelText);
    if (r.regionType === "vocab-grid") r.text?.split("·").forEach((w) => add(w));
  }
  return labels.map((label) => ({ id: slug(label) || label, label }));
}

function buildPage(lessonNumber: number, pageNumber: number): LessonExercise {
  const regions = [...(PAGES[String(pageNumber)]?.regions ?? [])].sort((a, b) => a.order - b.order);
  const kind =
    KIND_PRIORITY.find((k) => regions.some((r) => r.regionType === k)) ??
    regions.find((r) => r.regionType !== "instruction")?.regionType ??
    "reading";
  const instructions = regions.filter((r) => r.regionType === "instruction" && r.text).map((r) => r.text!.trim());
  const title = regions.find((r) => r.regionType === "title")?.text?.trim() ?? instructions[0] ?? `Página ${pageNumber}`;
  const blocked = SOURCE_BLOCKED_WORKBOOK_PAGES.includes(pageNumber);
  return {
    id: `l${lessonNumber}-p${pageNumber}-${kind}`,
    lessonNumber,
    pageNumber,
    kind,
    title,
    prompt: instructions.join(" ") || "Lectura del libro.",
    items: pageItems(regions),
    targets: [],
    sourceStatus: "page-layouts",
    transcriptionStatus: blocked ? "source-blocked" : "verified-against-scan",
    studentFacingStatus: "live",
    teacherNotes: blocked
      ? "Página sin escaneo fuente (hueco documentado 86–87). No se inventa contenido; pendiente de reescaneo."
      : `Página ${pageNumber} del Libro del alumno.`,
    sourcePage: getBookPageImage(pageNumber),
  };
}

export function lessonExercisesFor(lessonNumber: number): LessonExercise[] {
  const { start, end } = workbookPagesForLesson(lessonNumber);
  return Array.from({ length: end - start + 1 }, (_, i) => buildPage(lessonNumber, start + i));
}

export const allLessonExercises: LessonExercise[] = Array.from({ length: 24 }, (_, i) =>
  lessonExercisesFor(i + 1),
).flat();
