/**
 * Ensures consonants.json picture-vocab matches the PR #173 book lists
 * transcribed in lesson-exercises (source of truth for L17–L24).
 */
import { describe, it, expect } from "vitest";
import consonants from "../consonants.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Verbatim picture-vocab labels from lesson-exercises (scan-backed). */
const BOOK_PICTURE_VOCAB: Record<number, string[]> = {
  17: ["rana", "remos", "Rita", "rosa", "rueda"],
  18: ["burro", "carrusel", "torre", "barril", "Tierra"],
  19: ["gaveta", "gusano", "Goloso", "gorra", "mago"],
  20: ["foto", "fideos", "familia", "Felo", "funda"],
  21: ["jicotea", "jugo", "Jesús", "ajo", "jarra"],
  22: ["cuna", "conejo", "casa", "cubo", "Catalina"],
  23: ["yate", "yema", "Yayita", "mayúscula", "yoyo"],
  24: ["zapato", "zig-zag", "zorro", "zepelín", "Zulema"],
};

/** Words that must NOT appear as F-lesson vocab (common wrong list). */
const BANNED_F = ["faro", "fiesta", "foca", "fuente"];

describe("consonants.json vocab vs book (L17–L24)", () => {
  const byLesson = Object.fromEntries(
    (consonants as Array<{ lesson: number; letter: string; vocab: { word: string }[] }>).map(
      (c) => [c.lesson, c],
    ),
  );

  for (const [lessonStr, expected] of Object.entries(BOOK_PICTURE_VOCAB)) {
    const lesson = Number(lessonStr);
    it(`L${lesson} vocab matches book picture list`, () => {
      const entry = byLesson[lesson];
      expect(entry).toBeTruthy();
      const words = entry.vocab.map((v: { word: string }) => v.word);
      expect(words).toEqual(expected);
    });
  }

  it("L20 F does not use the wrong faro/fiesta/foca/fuente set", () => {
    const words = byLesson[20].vocab.map((v: { word: string }) => v.word.toLowerCase());
    for (const bad of BANNED_F) {
      expect(words).not.toContain(bad);
    }
    expect(words).toContain("foto");
    expect(words).toContain("fideos");
    expect(words).toContain("familia");
  });

  it("lesson-exercises L20 picture-vocab still agrees with consonants.json", () => {
    const src = readFileSync(
      join(process.cwd(), "src/data/lesson-exercises/lesson-20.ts"),
      "utf8",
    );
    for (const w of BOOK_PICTURE_VOCAB[20]) {
      expect(src).toContain(`label: "${w}"`);
    }
  });
});
