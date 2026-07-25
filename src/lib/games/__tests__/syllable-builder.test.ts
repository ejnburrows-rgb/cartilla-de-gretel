import { describe, it, expect } from "vitest";
import {
  buildTileBank,
  gradeAttempt,
  isSlotCorrect,
  nextEmptySlot,
  normalizeSyllable,
  shuffle,
  type PlacedSyllable,
} from "../syllable-builder";
import { splitSyllables } from "@/lib/spanish-syllables";
import { SYLLABLE_BUILDER_PILOT } from "@/content/games/syllable-builder-pilot";

describe("syllable-builder — grading (issue #344)", () => {
  it("grades a fully correct word as correct", () => {
    const g = gradeAttempt(["ma", "má"], ["ma", "má"]);
    expect(g.isCorrect).toBe(true);
    expect(g.correctCount).toBe(2);
    expect(g.total).toBe(2);
    expect(g.isComplete).toBe(true);
  });

  it("grades a wrong order as incorrect but still complete", () => {
    const g = gradeAttempt(["má", "ma"], ["ma", "má"]);
    expect(g.isCorrect).toBe(false);
    expect(g.isComplete).toBe(true);
    // Neither slot holds the syllable it should.
    expect(g.correctCount).toBe(0);
  });

  it("gives partial credit while the word is half built", () => {
    const g = gradeAttempt(["ma", null], ["ma", "má"]);
    expect(g.isCorrect).toBe(false);
    expect(g.isComplete).toBe(false);
    expect(g.correctCount).toBe(1);
  });

  it("treats an empty tray as not complete and not correct", () => {
    const g = gradeAttempt([null, null], ["ma", "má"]);
    expect(g.isCorrect).toBe(false);
    expect(g.isComplete).toBe(false);
    expect(g.correctCount).toBe(0);
  });

  it("does NOT accept an unaccented syllable for an accented one", () => {
    // "ma" and "má" are different syllables to a child learning to read.
    expect(gradeAttempt(["ma", "ma"], ["ma", "má"]).isCorrect).toBe(false);
    expect(isSlotCorrect(["ma"], ["má"], 0)).toBe(false);
  });

  it("matches regardless of casing and accent encoding", () => {
    // A composed "má" (U+00E1) and a decomposed "ma" + combining accent are
    // the same syllable to a reader, so they must grade the same.
    const decomposed = "má";
    expect(normalizeSyllable(decomposed)).toBe(normalizeSyllable("má"));
    expect(gradeAttempt(["MA", decomposed], ["ma", "má"]).isCorrect).toBe(true);
  });

  it("ignores stray whitespace around a tile", () => {
    expect(gradeAttempt([" ma ", "má"], ["ma", "má"]).isCorrect).toBe(true);
  });

  it("handles a three-syllable word", () => {
    const g = gradeAttempt(["o", "ve", "ja"], ["o", "ve", "ja"]);
    expect(g.isCorrect).toBe(true);
    expect(g.total).toBe(3);
  });
});

describe("syllable-builder — tile tray", () => {
  it("includes every needed syllable plus the lesson's decoys", () => {
    const tiles = buildTileBank(["ma", "má"], ["mi", "mo"]);
    expect(tiles).toHaveLength(4);
    expect([...tiles].sort()).toEqual(["ma", "má", "mi", "mo"].sort());
  });

  it("shuffles deterministically for a fixed random source", () => {
    // rng always returns 0 -> Fisher-Yates reverses deterministically.
    const a = shuffle(["1", "2", "3", "4"], () => 0);
    const b = shuffle(["1", "2", "3", "4"], () => 0);
    expect(a).toEqual(b);
  });

  it("never mutates the input array", () => {
    const input = ["ma", "má"];
    shuffle(input, () => 0);
    buildTileBank(input, [], () => 0);
    expect(input).toEqual(["ma", "má"]);
  });

  it("finds the next empty slot for tap-to-place, and -1 when full", () => {
    expect(nextEmptySlot([null, null])).toBe(0);
    expect(nextEmptySlot(["ma", null])).toBe(1);
    expect(nextEmptySlot(["ma", "má"])).toBe(-1);
  });
});

describe("syllable-builder — the 3-lesson pilot content", () => {
  it("covers exactly three lessons: one vowel lesson, m and p", () => {
    expect(SYLLABLE_BUILDER_PILOT).toHaveLength(3);
    expect(SYLLABLE_BUILDER_PILOT.map((g) => g.letter)).toEqual(["o", "m", "p"]);
  });

  it("every word's declared syllables rebuild the word itself", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      for (const w of game.words) {
        expect(w.syllables.join(""), `${game.id}/${w.word}`).toBe(w.word);
      }
    }
  });

  it("every word's declared syllables match the app's own syllabifier", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      for (const w of game.words) {
        expect(w.syllables, `${game.id}/${w.word}`).toEqual(splitSyllables(w.word));
      }
    }
  });

  it("every word is multi-syllable — a one-syllable word is not a builder", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      for (const w of game.words) {
        expect(w.syllables.length, `${game.id}/${w.word}`).toBeGreaterThan(1);
      }
    }
  });

  it("the tray always contains every syllable each word needs", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      const bank = (game.tiles ?? []).map(normalizeSyllable);
      for (const w of game.words) {
        for (const syl of w.syllables) {
          expect(bank, `${game.id}/${w.word}/${syl}`).toContain(normalizeSyllable(syl));
        }
      }
    }
  });

  it("only references real PASS-verified book art (or honestly omits it)", async () => {
    const qa = (await import("../../../../public/cartilla/art/faithful/qa-results.json"))
      .default as { results: { file: string; verdict: string }[] };
    const pass = new Set(qa.results.filter((r) => r.verdict === "PASS").map((r) => r.file));

    for (const game of SYLLABLE_BUILDER_PILOT) {
      for (const w of game.words) {
        if (!w.imageUrl) continue; // honest "pendiente" — allowed
        expect(pass.has(`public${w.imageUrl}`), `${game.id}/${w.word}`).toBe(true);
      }
    }
  });

  it("is Spanish-only in every instruction line", () => {
    // Cheap guard against English slipping into the student UI.
    const english = /\b(the|drag|word|build|tap|next|correct|wrong)\b/i;
    for (const game of SYLLABLE_BUILDER_PILOT) {
      for (const line of game.instructions) {
        expect(english.test(line), `${game.id}: "${line}"`).toBe(false);
      }
    }
  });
});
