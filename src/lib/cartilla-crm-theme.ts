import { CATALOG } from "@/lib/lesson-catalog";
import type { CSSProperties } from "react";

export type CartillaCrmTheme = {
  lessonNumber: number;
  section: "intro" | "vowels" | "consonants";
  accent: string;
  accentDark: string;
  accentSoft: string;
  background: string;
  backgroundRadial: string;
  pagePaper: string;
  border: string;
  titleInk: string;
  teacherBackdrop: string;
  studentBackdrop: string;
};

const FRAME = "#12323b";
const INK = "#17313b";
const PAPER = "#fff8e7";
const BORDER = "rgba(23, 49, 59, 0.18)";

const VOWEL_ACCENTS: Record<number, string> = {
  2: "#2f80ed",
  3: "#e63946",
  4: "#f28c28",
  5: "#2a9d8f",
  6: "#8338ec",
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return { r: 42, g: 157, b: 143 };
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function mix(hex: string, amount: number, target = "#ffffff") {
  const base = hexToRgb(hex);
  const next = hexToRgb(target);
  const channel = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return `rgb(${channel(base.r, next.r)}, ${channel(base.g, next.g)}, ${channel(base.b, next.b)})`;
}

export function getBookSectionForLesson(lessonNumber: number): CartillaCrmTheme["section"] {
  if (lessonNumber <= 1) return "intro";
  if (lessonNumber <= 6) return "vowels";
  return "consonants";
}

export function getLessonPageNumbers(pages: string): number[] {
  const trimmed = pages.trim();
  if (!trimmed) return [];
  const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }
  return trimmed
    .split(/[,;]\s*/)
    .map((page) => Number(page))
    .filter((page) => Number.isFinite(page));
}

export function getCartillaCrmTheme(lessonNumber: number): CartillaCrmTheme {
  const entry = CATALOG.find((item) => item.n === lessonNumber);
  const section = getBookSectionForLesson(lessonNumber);
  const accent = VOWEL_ACCENTS[lessonNumber] ?? entry?.color ?? "#2a9d8f";
  const accentDark = mix(accent, 0.36, "#071f2a");
  const accentSoft = mix(accent, 0.86);

  return {
    lessonNumber,
    section,
    accent,
    accentDark,
    accentSoft,
    background: `linear-gradient(135deg, ${FRAME} 0%, ${accentDark} 48%, #0f2730 100%)`,
    backgroundRadial: `radial-gradient(circle at 18% 12%, ${mix(accent, 0.25)} 0, transparent 28rem), radial-gradient(circle at 88% 10%, ${accentSoft} 0, transparent 24rem)`,
    pagePaper: PAPER,
    border: BORDER,
    titleInk: INK,
    teacherBackdrop: `linear-gradient(135deg, #081d25 0%, ${accentDark} 52%, #12323b 100%)`,
    studentBackdrop: `radial-gradient(circle at 50% 0%, #fcfbf7 0%, #f7ebd3 50%, #e0ceb4 100%)`,
  };
}

export function getCartillaCrmCssVars(lessonNumber: number): CSSProperties {
  const theme = getCartillaCrmTheme(lessonNumber);
  return {
    "--cartilla-accent": theme.accent,
    "--cartilla-accent-dark": theme.accentDark,
    "--cartilla-accent-soft": theme.accentSoft,
    "--cartilla-page-paper": theme.pagePaper,
    "--cartilla-title-ink": theme.titleInk,
    "--cartilla-bg-radial": theme.backgroundRadial,
    "--cartilla-student-backdrop": theme.studentBackdrop,
    "--cartilla-teacher-backdrop": theme.teacherBackdrop,
  } as CSSProperties;
}
