/**
 * Book-fidelity gate for Lessons 1–7 (student book pages 1–22).
 *
 * `src/data/book-transcription/lessons-01-07.json` is a verbatim transcription
 * of the physical book scans (public/cartilla/art/source/workbook/page-NNN.jpg).
 * This test fails if the app's page data drifts from the printed book: changed
 * instruction wording (for example app "Presiona…"/"Traza con…" in place of the
 * printed "Marca con una x…"/"Escribe con…"), reordered pictures, wrong picture
 * identity, or an answer key that contradicts the printed instruction.
 */
import { describe, it, expect } from "vitest";
import layouts from "@/data/page-layouts.json";
import fixture from "@/data/book-transcription/lessons-01-07.json";

type Cell = { caption?: string; correct?: boolean; illustrationSrc?: string };
type Region = {
  id: string;
  regionType: string;
  order: number;
  text?: string;
  label?: string;
  modelText?: string;
  syllable?: string;
  letterPair?: string;
  exampleCaption?: string;
  cells?: Cell[];
  columns?: number;
  vowelRows?: { letter: string; cells: Cell[] }[];
  vowelPairs?: { letter: string; caption?: string }[];
  matchRows?: { word: string; correct?: boolean }[][];
  sentences?: string[];
  fillItems?: { wordBox: string; blank: string; choices: { text: string; correct?: boolean }[] }[];
};
type Page = { regions: Region[]; _source?: unknown };
type Pair = [string, boolean];
type FixturePage = {
  lesson: number;
  type: string;
  label?: string;
  mark?: "x" | "circle";
  instruction?: string;
  rows?: Pair[][] | { letter: string; pictures: Pair[] }[];
  letters?: string[];
  pairs?: [string, string][];
  letterPair?: string;
  example?: string;
  cells?: Pair[];
  models?: string[];
  drawInstruction?: string;
  circle?: { syllable: string; rows: string[][] }[];
  title?: string;
  syllableBubbles?: string[];
  vocabColumns?: string[][];
  sightWords?: string[];
  sentences?: string[];
  sentencesInstruction?: string;
  fill?: { wordBox: string; blank: string; choices: string[]; answer: string }[];
};

const pages = (layouts as unknown as { pages: Record<string, Page> }).pages;
const book = (fixture as unknown as { pages: Record<string, FixturePage> }).pages;

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const ordered = (n: number) => {
  const p = pages[String(n)];
  if (!p) throw new Error(`page ${n} missing from page-layouts.json`);
  return [...p.regions].sort((a, b) => a.order - b.order);
};
const PAGE_NUMBERS = Array.from({ length: 22 }, (_, i) => i + 1);
/** Lesson that each printed page belongs to (printed footer "Lección N"). */
const LESSON_OF_PAGE = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7];

describe("book fidelity — Lessons 1–7 (pages 1–22)", () => {
  it("fixture covers every printed page 1–22 with the printed lesson footer", () => {
    expect(Object.keys(book).map(Number).sort((a, b) => a - b)).toEqual(PAGE_NUMBERS);
    for (const n of PAGE_NUMBERS) expect(book[String(n)].lesson, `p${n}`).toBe(LESSON_OF_PAGE[n - 1]);
  });

  for (const n of PAGE_NUMBERS) {
    const f = book[String(n)];
    it(`p${n} (${f.type}) matches the printed page`, () => {
      const r = ordered(n);
      const instructions = r.filter((x) => x.regionType === "instruction");
      if (f.instruction) {
        expect(instructions[0]?.text, `p${n} instruction`).toBe(f.instruction);
        expect(instructions[0]?.label, `p${n} label`).toBe(f.label);
      }
      switch (f.type) {
        case "picture-grid": {
          expect(r[0].regionType).toBe("instruction");
          expect(r[1].regionType).toBe("picture-grid");
          const grid = r[1];
          const rows = f.rows as Pair[][];
          expect(grid.columns).toBe(rows[0].length);
          expect((grid.cells ?? []).map((c) => [c.caption, c.correct])).toEqual(rows.flat());
          for (const c of grid.cells ?? []) expect(c.illustrationSrc, `${c.caption} art`).toBeTruthy();
          break;
        }
        case "vowel-pick-one": {
          const region = r.find((x) => x.regionType === "vowel-pick-one")!;
          const rows = f.rows as { letter: string; pictures: Pair[] }[];
          expect(
            (region.vowelRows ?? []).map((row) => ({
              letter: row.letter,
              pictures: row.cells.map((c) => [c.caption, c.correct]),
            })),
          ).toEqual(rows);
          break;
        }
        case "vowel-match-all": {
          const region = r.find((x) => x.regionType === "vowel-match-all")!;
          expect((region.vowelPairs ?? []).map((p) => [p.letter, p.caption])).toEqual(f.pairs);
          break;
        }
        case "vowel-line-match": {
          const region = r.find((x) => x.regionType === "vowel-line-match")!;
          expect(region.letterPair).toBe(f.letterPair);
          expect(region.exampleCaption).toBe(f.example);
          expect((region.cells ?? []).map((c) => [c.caption, c.correct])).toEqual(f.cells);
          break;
        }
        case "writing": {
          expect(r.map((x) => x.regionType)).toEqual([
            "instruction",
            "writing-line",
            "writing-line",
            "writing-line",
            "writing-line",
            "instruction",
            "draw-box",
          ]);
          expect(r.filter((x) => x.modelText).map((x) => x.modelText)).toEqual(f.models);
          expect(instructions[1].text).toBe(f.drawInstruction);
          expect(instructions[0].label).toBeUndefined();
          break;
        }
        case "circle": {
          const matches = r.filter((x) => x.regionType === "syllable-match");
          expect(matches.map((m) => m.syllable)).toEqual(f.circle!.map((c) => c.syllable));
          matches.forEach((m, i) => {
            expect((m.matchRows ?? []).map((row) => row.map((w) => w.word))).toEqual(f.circle![i].rows);
            for (const row of m.matchRows ?? [])
              for (const w of row) expect(w.correct, w.word).toBe(fold(w.word).includes(fold(m.syllable ?? "")));
          });
          break;
        }
        case "letter": {
          expect(r.find((x) => x.regionType === "title")?.text).toBe(f.title);
          expect(r.filter((x) => x.regionType === "syllable-bubble").map((x) => x.text)).toEqual(f.syllableBubbles);
          // The book prints three columns; the data stores them row by row.
          const cols = f.vocabColumns!;
          const rowMajor = cols[0].flatMap((_, i) => cols.map((c) => c[i]));
          expect(r.find((x) => x.regionType === "vocab-grid")?.text).toBe(rowMajor.join(" · "));
          expect(r.find((x) => x.regionType === "sentence-line")?.text).toBe(f.sightWords!.join("  "));
          expect(r.find((x) => x.regionType === "reading-sentences")?.sentences).toEqual(f.sentences);
          break;
        }
        case "complete": {
          expect(r.map((x) => x.regionType)).toEqual(["instruction", "fill-in-blank", "instruction", "writing-response"]);
          expect(instructions[1].text).toBe(f.sentencesInstruction);
          const items = r.find((x) => x.regionType === "fill-in-blank")!.fillItems ?? [];
          expect(items.map((i) => [i.wordBox, i.blank, i.choices.map((c) => c.text)])).toEqual(
            f.fill!.map((i) => [i.wordBox, i.blank, i.choices]),
          );
          items.forEach((item, i) =>
            expect(item.choices.filter((c) => c.correct).map((c) => c.text)).toEqual([f.fill![i].answer]),
          );
          break;
        }
        default:
          throw new Error(`unknown fixture type ${f.type}`);
      }
    });
  }

  it("the answer key follows each printed vowel instruction", () => {
    for (const n of PAGE_NUMBERS) {
      const f = book[String(n)];
      const vowel =
        f.letterPair?.[1] ?? f.instruction?.match(/comienzan con ([AEIOU]) [aeiou]\.$/)?.[1]?.toLowerCase();
      if (f.type === "picture-grid" && vowel)
        for (const [caption, ok] of (f.rows as Pair[][]).flat())
          expect(ok, `p${n} ${caption}`).toBe(fold(caption).startsWith(vowel));
      if (f.type === "vowel-line-match" && vowel)
        for (const [caption, ok] of f.cells!) expect(ok, `p${n} ${caption}`).toBe(fold(caption).startsWith(vowel));
      if (f.type === "vowel-pick-one")
        for (const row of f.rows as { letter: string; pictures: Pair[] }[])
          for (const [caption, ok] of row.pictures)
            expect(ok, `p${n} ${caption}`).toBe(fold(caption).startsWith(row.letter));
      if (n === 1)
        // "Circula … en cada línea horizontal que comienzan con el mismo sonido": two per row share a first sound.
        for (const row of f.rows as Pair[][]) {
          const picked = row.filter(([, ok]) => ok).map(([c]) => fold(c)[0]);
          expect(picked.length).toBe(2);
          expect(new Set(picked).size).toBe(1);
        }
    }
  });

  it("pages 1–22 keep the printed verbs, never app-invented tap wording", () => {
    const text = PAGE_NUMBERS.map((n) => JSON.stringify(pages[String(n)])).join("\n");
    expect(text).not.toMatch(/Presiona|Toca |Traza con tu mejor letra/);
    expect(text).not.toMatch(/"caption":"(pez|arco|traje)"/);
  });
});
