/**
 * Book-fidelity gate for Lessons 1–7 (student book pages 1–22).
 *
 * The fixture `src/data/book-transcription/lessons-01-07.json` is a verbatim
 * transcription of the physical book scans (rescan PDF, printed pages 1–22).
 * This test fails if the app's page data drifts from the book: wrong
 * instruction wording, wrong picture identity, wrong correct/incorrect flags,
 * wrong line-match example, wrong vocab order, or a Completa item whose
 * "correct" answer does not rebuild the printed word.
 *
 * Conventions verified against the book:
 * - Lesson 1 (intro): same-sound rows, vowel pick-one, vowel line-match.
 * - Lessons 2–6 (vowels): mark-with-X grid (16 pictures), draw-a-line match
 *   (8 pictures, the book's printed example line preserved), writing lines.
 * - Lesson 7 (M): same four-page shape as Lessons 8–24. The circle page is a
 *   find-the-syllable-in-each-word exercise: every printed word contains the
 *   target syllable, so every word is correct (same rule as lessons 8–24).
 * - Page 22, item 2: the book's word box literally prints "M" (for "Memo");
 *   the fixture records both the printed wordBox and the completed word.
 */
import { describe, it, expect } from "vitest";
import layouts from "@/data/page-layouts.json";
import fixture from "@/data/book-transcription/lessons-01-07.json";

type Cell = { caption: string; correct?: boolean; illustrationSrc?: string };
type Region = {
  id: string;
  regionType: string;
  order: number;
  text?: string;
  modelText?: string;
  illustrationSrc?: string;
  letterPair?: string;
  exampleCaption?: string;
  cells?: Cell[];
  vowelRows?: { letter: string; cells: Cell[] }[];
  vowelPairs?: { letter: string; caption: string; correct?: boolean; illustrationSrc?: string }[];
  syllable?: string;
  matchRows?: { word: string; correct?: boolean }[][];
  sentences?: string[];
  fillItems?: { wordBox: string; blank: string; choices: { text: string; correct?: boolean }[] }[];
};
type Page = { regions: Region[]; _source?: { status: string; note: string } };
type WordFlag = { word: string; correct: boolean };
type FixtureLesson = {
  lesson: number;
  vowel?: string;
  letter?: string;
  title: string;
  pages: Record<string, number>;
  sameSoundInstruction?: string;
  sameSoundRows?: WordFlag[][];
  vowelPickInstruction?: string;
  vowelPickRows?: { letter: string; words: string[]; answer: string }[];
  vowelMatchInstruction?: string;
  vowelMatchPairs?: { letter: string; word: string }[];
  markInstruction?: string;
  markCells?: WordFlag[];
  lineInstruction?: string;
  linePair?: string;
  lineExample?: string;
  lineCells?: WordFlag[];
  writeInstruction?: string;
  models?: string[];
  drawInstruction?: string;
  circle?: { syllable: string; rows: string[][] }[];
  syllableBubbles?: string[];
  vocab?: string[];
  sightWords?: string[];
  sentences?: string[];
  fill?: { wordBox: string; blank: string; choices: string[]; answer: string; word: string }[];
};

const pages = (layouts as unknown as { pages: Record<string, Page> }).pages;
const lessons = (fixture as unknown as { lessons: Record<string, FixtureLesson> }).lessons;

const fold = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const byOrder = (p: Page) => [...p.regions].sort((a, b) => a.order - b.order);
const page = (n: number): Page => {
  const p = pages[String(n)];
  if (!p) throw new Error(`page ${n} missing from page-layouts.json`);
  return p;
};
const flags = (cells: Cell[] | undefined) => (cells ?? []).map((c) => ({ word: c.caption, correct: c.correct === true }));

describe("book fidelity — Lessons 1–7", () => {
  it("fixture covers lessons 1–7 with the book's page numbers", () => {
    expect(Object.keys(lessons).sort()).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(lessons["1"].pages).toEqual({ sameSound: 1, vowelPick: 2, vowelMatch: 3 });
    const markStart = [4, 7, 10, 13, 16];
    for (let i = 0; i < 5; i++) {
      const l = lessons[String(i + 2)];
      expect(l.pages).toEqual({ mark: markStart[i], line: markStart[i] + 1, write: markStart[i] + 2 });
    }
    expect(lessons["7"].pages).toEqual({ write: 19, circle: 20, letter: 21, complete: 22 });
  });

  describe("Lección 1 (Introducción de las vocales)", () => {
    const l = () => lessons["1"];

    it("p1: same-sound rows match the book exactly", () => {
      const r = byOrder(page(l().pages.sameSound));
      expect(r[0].regionType).toBe("instruction");
      expect(r[0].text).toBe(l().sameSoundInstruction);
      const grid = r.find((x) => x.regionType === "picture-grid");
      expect(grid).toBeDefined();
      expect(flags(grid!.cells)).toEqual(l().sameSoundRows!.flat());
    });

    it("p2: vowel pick-one rows match the book exactly", () => {
      const r = byOrder(page(l().pages.vowelPick));
      expect(r[0].text).toBe(l().vowelPickInstruction);
      const pick = r.find((x) => x.regionType === "vowel-pick-one");
      expect(pick!.vowelRows!.map((x) => x.letter)).toEqual(l().vowelPickRows!.map((x) => x.letter));
      pick!.vowelRows!.forEach((row, i) => {
        const f = l().vowelPickRows![i];
        expect(row.cells.map((c) => c.caption)).toEqual(f.words);
        expect(row.cells.filter((c) => c.correct).map((c) => c.caption)).toEqual([f.answer]);
      });
    });

    it("p3: vowel line-match pairs match the book exactly", () => {
      const r = byOrder(page(l().pages.vowelMatch));
      expect(r[0].text).toBe(l().vowelMatchInstruction);
      const m = r.find((x) => x.regionType === "vowel-match-all");
      expect(m!.vowelPairs!.map((x) => [x.letter, x.caption])).toEqual(
        l().vowelMatchPairs!.map((x) => [x.letter, x.word]),
      );
      expect(m!.vowelPairs!.every((x) => x.correct)).toBe(true);
    });
  });

  for (const n of [2, 3, 4, 5, 6]) {
    const l = () => lessons[String(n)];
    describe(`Lección ${n} (${l().title})`, () => {
      it(`p${l().pages.mark}: mark-with-X grid matches the book exactly`, () => {
        const r = byOrder(page(l().pages.mark));
        expect(r[0].regionType).toBe("instruction");
        expect(r[0].text).toBe(l().markInstruction);
        const grid = r.find((x) => x.regionType === "picture-grid");
        expect(grid!.cells).toHaveLength(16);
        expect(flags(grid!.cells)).toEqual(l().markCells);
        // Every picture on these pages has an image wired.
        for (const c of grid!.cells ?? []) expect(c.illustrationSrc, c.caption).toBeTruthy();
      });

      it(`p${l().pages.line}: draw-a-line match (cells + book example) matches`, () => {
        const r = byOrder(page(l().pages.line));
        expect(r[0].text).toBe(l().lineInstruction);
        const m = r.find((x) => x.regionType === "vowel-line-match");
        expect(m!.letterPair).toBe(l().linePair);
        expect(m!.exampleCaption, "book's printed example line").toBe(l().lineExample);
        expect(flags(m!.cells)).toEqual(l().lineCells);
        // The book's example is always one of the correct answers.
        const ex = (m!.cells ?? []).find((c) => c.caption === m!.exampleCaption);
        expect(ex?.correct).toBe(true);
      });

      it(`p${l().pages.write}: writing page matches the book`, () => {
        const r = byOrder(page(l().pages.write));
        expect(r[0].text).toBe(l().writeInstruction);
        expect(r.filter((x) => x.modelText).map((x) => x.modelText)).toEqual(l().models);
        expect(r[r.length - 2].text).toBe(l().drawInstruction);
        expect(r[r.length - 2].regionType).toBe("instruction");
        expect(r[r.length - 1].regionType).toBe("draw-box");
      });
    });
  }

  describe("Lección 7 (Letra M m)", () => {
    const l = () => lessons["7"];

    it("p19: writing page matches the book", () => {
      const r = byOrder(page(l().pages.write));
      expect(r[0].text).toBe("Escribe con tu mejor letra.");
      expect(r.filter((x) => x.modelText).map((x) => x.modelText)).toEqual(l().models);
      expect(r[r.length - 2].text).toBe(l().drawInstruction);
    });

    it("p20: circle-the-syllable rows match the book; every word contains its syllable", () => {
      const r = byOrder(page(l().pages.circle));
      expect(r[0].text).toBe("Encierra en un círculo la sílaba correspondiente.");
      const matches = r.filter((x) => x.regionType === "syllable-match");
      expect(matches.map((x) => x.syllable)).toEqual(l().circle!.map((c) => c.syllable));
      matches.forEach((m, i) => {
        const rows = (m.matchRows ?? []).map((row) => row.map((w) => w.word));
        expect(rows).toEqual(l().circle![i].rows);
        // Same rule as Lessons 8–24: the printed word contains the syllable.
        for (const row of m.matchRows ?? [])
          for (const w of row)
            expect(w.correct, `${w.word} contains ${m.syllable}`).toBe(
              fold(w.word).includes(fold(m.syllable ?? "")),
            );
      });
    });

    it("p21: letter page (syllables, words, sight words, sentences) matches the book", () => {
      const r = byOrder(page(l().pages.letter));
      expect(r.map((x) => x.regionType)).toEqual([
        "title",
        "syllable-bubble",
        "syllable-bubble",
        "vocab-grid",
        "sentence-line",
        "reading-sentences",
      ]);
      expect(r[0].text).toBe(l().title);
      expect(r.filter((x) => x.regionType === "syllable-bubble").map((x) => x.text)).toEqual(
        l().syllableBubbles,
      );
      expect(r.find((x) => x.regionType === "vocab-grid")?.text).toBe(l().vocab!.join(" · "));
      expect(r.find((x) => x.regionType === "sentence-line")?.text).toBe(l().sightWords!.join("  "));
      expect(r.find((x) => x.regionType === "reading-sentences")?.sentences).toEqual(l().sentences);
    });

    it("p22: Completa page matches the book and every item has one correct answer", () => {
      const r = byOrder(page(l().pages.complete));
      expect(r.map((x) => x.regionType)).toEqual([
        "instruction",
        "fill-in-blank",
        "instruction",
        "writing-response",
      ]);
      expect(r[0].text).toBe("Completa las palabras con la sílaba correcta.");
      expect(r[2].text).toBe("Escribe oraciones. Usa las sílabas que aprendiste.");
      const items = r[1].fillItems ?? [];
      expect(items.map((i) => i.wordBox)).toEqual(l().fill!.map((f) => f.wordBox));
      items.forEach((item, i) => {
        const f = l().fill![i];
        expect(item.blank).toBe(f.blank);
        expect(item.choices.map((c) => c.text)).toEqual(f.choices);
        const correct = item.choices.filter((c) => c.correct);
        expect(correct.map((c) => c.text), `${item.wordBox} single answer`).toEqual([f.answer]);
        // The answer placed in the blank must rebuild the printed word.
        const rebuilt = item.blank.replace("___", correct[0].text).replace(/\s+/g, "");
        expect(fold(rebuilt), `${item.blank} -> ${f.word}`).toBe(fold(f.word));
      });
    });
  });

  it("pages 19–22 carry no pictures (the book has none)", () => {
    for (let n = 19; n <= 22; n++) {
      for (const r of page(n).regions) expect(r.illustrationSrc, `p${n} ${r.id}`).toBeUndefined();
      expect(JSON.stringify(page(n))).not.toMatch(/illustrationSrc|\.webp|\.png|\.jpe?g/);
    }
  });

  it("every picture cell on pages 1–18 has an explicit correct flag and an image", () => {
    for (let n = 1; n <= 18; n++) {
      for (const r of page(n).regions) {
        for (const c of r.cells ?? []) {
          expect(typeof c.correct, `p${n} ${c.caption} explicit flag`).toBe("boolean");
          expect(c.illustrationSrc, `p${n} ${c.caption} image`).toBeTruthy();
        }
        for (const row of r.vowelRows ?? [])
          for (const c of row.cells) {
            expect(typeof c.correct, `p${n} ${c.caption} explicit flag`).toBe("boolean");
            expect(c.illustrationSrc, `p${n} ${c.caption} image`).toBeTruthy();
          }
        for (const vp of r.vowelPairs ?? []) expect(vp.illustrationSrc, `p${n} ${vp.caption}`).toBeTruthy();
      }
    }
  });

  it("no invented instruction wording on pages 1–22", () => {
    const text = Array.from({ length: 22 }, (_, i) => JSON.stringify(page(i + 1))).join("\n");
    // The book never says "Presiona" or "Traza con tu mejor letra".
    expect(text).not.toMatch(/Presiona los dibujos|Presiona el dibujo/);
    expect(text).not.toContain("Traza con tu mejor letra.");
  });

  it("no invented words from the old reconstruction remain on pages 1–22", () => {
    const text = Array.from({ length: 22 }, (_, i) => JSON.stringify(page(i + 1)))
      .join("\n")
      .toLowerCase();
    for (const banned of ["ñutu", "ñeque", "ñero", "borrumba", "la rana ríe"]) expect(text, banned).not.toContain(banned);
  });

  it("no page 1–22 carries an unverified-source flag", () => {
    const flagged = Object.keys(pages)
      .filter((k) => Number(k) >= 1 && Number(k) <= 22)
      .filter((k) => pages[k]._source);
    expect(flagged).toEqual([]);
  });
});
