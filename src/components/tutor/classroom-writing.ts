import type { CatalogEntry } from "@/lib/lesson-catalog";
import type { TutorItem } from "@/lib/tutor-content";

/** Lowercase teaching strokes. Each path is a separate chalk contact. */
const strokes: Record<string, readonly string[]> = {
  a: ["M39 54 C29 37 8 43 7 62 C5 81 27 87 39 64", "M39 46 L39 72 Q39 83 47 80"],
  b: ["M9 12 V81", "M9 59 C23 35 48 45 47 63 C47 83 24 90 9 73"],
  c: ["M43 51 C28 37 7 47 7 65 C7 83 26 89 43 76"],
  d: ["M41 55 C29 37 8 43 7 63 C4 84 29 86 41 68", "M41 12 V80"],
  e: ["M9 64 H43 C43 43 16 37 9 57 C0 78 24 92 44 74"],
  f: ["M39 15 C15 2 13 23 13 40 V82", "M3 46 H33"],
  g: ["M41 54 C31 37 9 42 7 62 C5 81 26 89 41 65", "M41 46 V87 Q40 109 16 101"],
  h: ["M9 12 V81", "M9 62 C21 39 42 43 42 60 V81"],
  i: ["M23 46 V81", "M23 29 l0.3 0.3"],
  j: ["M30 46 V90 Q28 108 12 99", "M30 29 l0.3 0.3"],
  k: ["M10 12 V81", "M40 46 L11 65", "M22 58 L41 81"],
  l: ["M23 12 V70 Q23 83 34 81"],
  m: ["M5 46 V81", "M5 62 C13 42 26 42 26 61 V81", "M26 62 C35 42 48 42 48 61 V81"],
  n: ["M8 46 V81", "M8 63 C22 39 43 43 43 60 V81"],
  o: ["M44 63 C44 37 8 37 7 63 C6 88 44 88 44 63"],
  p: ["M9 46 V103", "M9 63 C21 38 46 40 47 62 C48 82 25 89 9 74"],
  q: ["M41 54 C29 37 8 42 7 62 C5 81 27 87 41 64", "M41 46 V103"],
  r: ["M10 46 V81", "M10 63 Q26 39 42 49"],
  s: ["M42 49 C25 38 9 46 11 57 C14 68 45 63 43 75 C41 87 20 88 7 77"],
  t: ["M21 24 V70 Q21 84 38 80", "M7 46 H38"],
  u: ["M8 46 V66 C8 88 33 86 42 65", "M42 46 V81"],
  v: ["M6 46 L25 81 L46 46"],
  w: ["M5 46 L15 81 L25 52 L35 81 L45 46"],
  x: ["M9 46 L41 81", "M41 46 L9 81"],
  y: ["M7 46 L25 75", "M44 46 L18 103"],
  z: ["M7 46 H44 L7 81 H43"],
};

const marks: Record<string, readonly string[]> = {
  "\u0301": ["M19 31 L33 19"],
  "\u0303": ["M12 31 Q20 23 26 29 Q34 36 42 27"],
  "\u0308": ["M18 26 l0.3 0.3", "M33 26 l0.3 0.3"],
};

export interface ChalkPoint { x: number; y: number }
export type ChalkStroke = readonly ChalkPoint[];

export function teachingTarget(item: TutorItem, lesson?: CatalogEntry): string | null {
  if (item.kind === "vowel" || item.kind === "syllable") return item.text;
  if (item.id !== "l3-word-abeja" || lesson?.kind !== "vowel") return null;
  const first = Array.from(item.text.normalize("NFC"))[0];
  return first?.normalize("NFD")[0]?.toLocaleLowerCase("es") === lesson.vowel
    ? first.toLocaleLowerCase("es")
    : null;
}

export function letterStrokes(letter: string): readonly string[] | null {
  const [base, ...accents] = Array.from(letter.normalize("NFD").toLocaleLowerCase("es"));
  const paths = strokes[base];
  if (!paths || accents.some((mark) => !marks[mark])) return null;
  return [...paths, ...accents.flatMap((mark) => marks[mark])];
}

const svgNamespace = "http://www.w3.org/2000/svg";

export function chalkStrokes(text: string): ChalkStroke[] {
  const letters = Array.from(text.normalize("NFC"));
  const glyphs = letters.map(letterStrokes);
  if (!glyphs.length || glyphs.some((glyph) => !glyph)) return [];

  const scale = Math.min(1.5, 4.1 / letters.length);
  const advance = 59 * scale;
  const center = 864;
  const left = center - (advance * glyphs.length) / 2;
  const top = 285 - 14 * scale;
  const result = glyphs.flatMap((glyph, index) => glyph!.map((data) => {
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", data);
    const length = path.getTotalLength();
    const points = Math.max(2, Math.ceil(length * scale / 3));
    return Array.from({ length: points + 1 }, (_, step) => {
      const point = path.getPointAtLength(length * step / points);
      return { x: left + advance * index + point.x * scale, y: top + point.y * scale };
    });
  }));
  result.push([{ x: left, y: top + 107 * scale }, { x: left + glyphs.length * advance - 5 * scale, y: top + 107 * scale }]);
  return result;
}
