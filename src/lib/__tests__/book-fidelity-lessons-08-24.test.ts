/**
 * Book-fidelity gate for Lessons 8–24 (student book pages 23–90).
 *
 * The fixture `src/data/book-transcription/lessons-08-24.json` is a verbatim
 * transcription of the physical book scans. This test fails if the app's page
 * data drifts from the book: wrong order, changed wording, invented words,
 * pictures on consonant pages, or a Completa item whose "correct" answer does
 * not rebuild the printed word.
 *
 * Only two explicit exceptions exist, both flagged in the data with `_source`:
 *   - page 86 (Lección 23 Completa): scan missing -> fill-in items withheld.
 *   - page 87 (Lección 24 writing): scan missing -> pattern-derived.
 */
import { describe, it, expect } from "vitest";
import layouts from "@/data/page-layouts.json";
import fixture from "@/data/book-transcription/lessons-08-24.json";
import consonants from "@/content/consonants.json";

type Region = {
  id: string;
  regionType: string;
  order: number;
  text?: string;
  modelText?: string;
  syllable?: string;
  matchRows?: { word: string; correct?: boolean }[][];
  sentences?: string[];
  fillItems?: { wordBox: string; blank: string; choices: { text: string; correct?: boolean }[] }[];
  illustrationSrc?: string;
};
type Page = { regions: Region[]; _source?: { status: string; note: string } };
type FixtureLesson = {
  lesson: number;
  pages: { write: number; circle: number; letter: number; complete: number };
  title: string;
  models: string[];
  drawInstruction: string;
  circle: { syllable: string; rows: string[][] }[];
  syllableBubbles: string[];
  vocab: string[];
  sightWords: string[];
  sentences: string[];
  fill: { wordBox: string; blank: string; choices: string[]; answer: string }[] | null;
};

const pages = (layouts as unknown as { pages: Record<string, Page> }).pages;
const lessons = (fixture as unknown as { lessons: Record<string, FixtureLesson> }).lessons;
const pending = (fixture as unknown as { pendingPages: Record<string, string> }).pendingPages;

const WRITE = "Escribe con tu mejor letra.";
const CIRCLE = "Encierra en un círculo la sílaba correspondiente.";
const COMPLETE = "Completa las palabras con la sílaba correcta.";
const SENTENCES = "Escribe oraciones. Usa las sílabas que aprendiste.";

const fold = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const byOrder = (p: Page) => [...p.regions].sort((a, b) => a.order - b.order);
const page = (n: number): Page => {
  const p = pages[String(n)];
  if (!p) throw new Error(`page ${n} missing from page-layouts.json`);
  return p;
};

const LESSON_NUMBERS = Array.from({ length: 17 }, (_, i) => i + 8);

describe("book fidelity — Lessons 8–24", () => {
  it("fixture covers every lesson 8–24 in book order write → circle → letter → complete", () => {
    let expectedStart = 23;
    for (const n of LESSON_NUMBERS) {
      const l = lessons[String(n)];
      expect(l, `lesson ${n} in fixture`).toBeDefined();
      expect(l.pages).toEqual({
        write: expectedStart,
        circle: expectedStart + 1,
        letter: expectedStart + 2,
        complete: expectedStart + 3,
      });
      expectedStart += 4;
    }
    expect(expectedStart - 1).toBe(90);
  });

  for (const n of LESSON_NUMBERS) {
    const l = lessons[String(n)];

    describe(`Lección ${n} (${l.title})`, () => {
      it(`p${l.pages.write}: writing page matches the book`, () => {
        const p = page(l.pages.write);
        const r = byOrder(p);
        expect(r.map((x) => x.regionType)).toEqual([
          "instruction",
          // Every consonant writing page has four lines; the rr page has a single model ("rr").
          "writing-line",
          "writing-line",
          "writing-line",
          "writing-line",
          "instruction",
          "draw-box",
        ]);
        expect(r[0].text).toBe(WRITE);
        expect(r.filter((x) => x.modelText).map((x) => x.modelText)).toEqual(l.models);
        expect(r[r.length - 2].text).toBe(l.drawInstruction);
        if (l.pages.write === 87) expect(p._source?.status).toBe("pattern-derived-pending-rescan");
        else expect(p._source).toBeUndefined();
      });

      it(`p${l.pages.circle}: circle-the-syllable rows match the book exactly`, () => {
        const r = byOrder(page(l.pages.circle));
        expect(r[0].regionType).toBe("instruction");
        expect(r[0].text).toBe(CIRCLE);
        const matches = r.slice(1);
        expect(matches.every((x) => x.regionType === "syllable-match")).toBe(true);
        expect(matches.map((x) => x.syllable)).toEqual(l.circle.map((c) => c.syllable));
        matches.forEach((m, i) => {
          const rows = (m.matchRows ?? []).map((row) => row.map((w) => w.word));
          expect(rows, `${m.syllable} rows`).toEqual(l.circle[i].rows);
          for (const row of m.matchRows ?? [])
            for (const w of row)
              expect(w.correct, `${w.word} contains ${m.syllable}`).toBe(
                fold(w.word).includes(fold(m.syllable ?? "")),
              );
        });
      });

      it(`p${l.pages.letter}: letter page (syllables, words, sight words, sentences) matches the book`, () => {
        const r = byOrder(page(l.pages.letter));
        expect(r.map((x) => x.regionType)).toEqual([
          "title",
          ...l.syllableBubbles.map(() => "syllable-bubble"),
          "vocab-grid",
          "sentence-line",
          "reading-sentences",
        ]);
        expect(r[0].text).toBe(l.title);
        expect(r.filter((x) => x.regionType === "syllable-bubble").map((x) => x.text)).toEqual(
          l.syllableBubbles,
        );
        expect(r.find((x) => x.regionType === "vocab-grid")?.text).toBe(l.vocab.join(" · "));
        expect(r.find((x) => x.regionType === "sentence-line")?.text).toBe(l.sightWords.join("  "));
        expect(r.find((x) => x.regionType === "reading-sentences")?.sentences).toEqual(l.sentences);
      });

      it(`p${l.pages.complete}: Completa page matches the book and every item has one correct answer`, () => {
        const p = page(l.pages.complete);
        const r = byOrder(p);
        if (l.fill === null) {
          // Only page 86 may be missing its Completa items, and it must say why.
          expect(l.pages.complete).toBe(86);
          expect(p._source?.status).toBe("pending-rescan");
          expect(pending["86"]).toBeTruthy();
          expect(r.map((x) => x.regionType)).toEqual(["instruction", "instruction", "writing-response"]);
          expect(r[0].text).toBe(COMPLETE);
          expect(r[1].text).toBe(SENTENCES);
          return;
        }
        expect(p._source).toBeUndefined();
        expect(r.map((x) => x.regionType)).toEqual([
          "instruction",
          "fill-in-blank",
          "instruction",
          "writing-response",
        ]);
        expect(r[0].text).toBe(COMPLETE);
        expect(r[2].text).toBe(SENTENCES);
        const items = r[1].fillItems ?? [];
        expect(items.map((i) => i.wordBox)).toEqual(l.fill.map((f) => f.wordBox));
        items.forEach((item, i) => {
          const f = l.fill![i];
          expect(item.blank).toBe(f.blank);
          expect(item.choices.map((c) => c.text)).toEqual(f.choices);
          const correct = item.choices.filter((c) => c.correct);
          expect(correct.map((c) => c.text), `${item.wordBox} single answer`).toEqual([f.answer]);
          // The answer placed in the blank must rebuild the printed word.
          const rebuilt = item.blank.replace("___", correct[0].text).replace(/\s+/g, "");
          expect(fold(rebuilt), `${item.blank} -> ${item.wordBox}`).toBe(fold(item.wordBox));
        });
      });
    });
  }

  it("consonant pages 23–90 carry no pictures (the book has none)", () => {
    for (let n = 23; n <= 90; n++) {
      for (const r of page(n).regions) expect(r.illustrationSrc, `p${n} ${r.id}`).toBeUndefined();
      expect(JSON.stringify(page(n))).not.toMatch(/illustrationSrc|\.webp|\.png|\.jpe?g/);
    }
  });

  it("no invented words from the old reconstruction remain on pages 23–90", () => {
    const text = Array.from({ length: 68 }, (_, i) => JSON.stringify(page(i + 23)))
      .join("\n")
      .toLowerCase();
    for (const banned of ["ñutu", "ñeque", "ñero", "borrumba", "la rana ríe"])
      expect(text, banned).not.toContain(banned);
    // Old app-invented instruction wording must not be used on these pages.
    expect(text).not.toMatch(/\btraza\b|\bpresiona\b/);
  });

  it("only page 87 still carries an unverified-source flag (p86 verified against the workbook PDF)", () => {
    const flagged = Object.keys(pages).filter((k) => pages[k]._source);
    expect(flagged.sort()).toEqual(["87"]);
  });

  it("consonants.json syllables/examples/sentences for lessons 8–24 come from the book", () => {
    const data = consonants as unknown as {
      lesson: number;
      pages: string;
      syllables: string[];
      examples: Record<string, string[]>;
      sentences: string[];
    }[];
    for (const n of LESSON_NUMBERS) {
      const l = lessons[String(n)];
      const c = data.find((d) => d.lesson === n);
      expect(c, `consonants.json lesson ${n}`).toBeDefined();
      expect(c!.pages, `L${n} page range`).toBe(`${l.pages.write}-${l.pages.complete}`);
      expect(c!.syllables).toEqual(l.circle.map((x) => x.syllable));
      for (const x of l.circle) expect(c!.examples[x.syllable]).toEqual([...new Set(x.rows.flat())]);
      const bookText = l.sentences.filter(Boolean).join(" ").replace(/\s+/g, " ");
      for (const s of c!.sentences) expect(bookText, `L${n}: "${s}"`).toContain(s);
    }
  });
});
