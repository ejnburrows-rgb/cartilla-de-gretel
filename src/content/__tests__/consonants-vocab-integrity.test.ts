/**
 * Ensures consonants.json picture-vocab matches the PR #173 book lists
 * — the Teacher Flip Chart vocabulary plates (source by surface).
 */
import { describe, it, expect } from "vitest";
import consonants from "../consonants.json";
import firstPages from "@/data/flipchart-text-3-22.json";
import middlePages from "@/data/flipchart-text-23-42.json";
import lastPages from "@/data/flipchart-text-43-62.json";

/** Verbatim picture-vocab labels from the Flip Chart vocabulary plates. */
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

  it("L7–L24 picture vocab is exactly the Flip Chart vocabulary plate, with its source declared", () => {
    const fc: Record<string, { text: string; y: number; fontSize: number }[]> = {
      ...firstPages,
      ...middlePages,
      ...lastPages,
    } as never;
    for (const entry of consonants as Array<{
      lesson: number;
      vocab: { word: string; illustrationSrc?: string }[];
      vocabSource: { book: string; flipchartPage: number };
    }>) {
      const page = entry.lesson === 7 ? 9 : 12 + 3 * (entry.lesson - 8);
      expect(entry.vocabSource, `L${entry.lesson}`).toMatchObject({ book: "flipchart", flipchartPage: page });
      const plateWords = fc[String(page)]
        .filter((t) => t.text.trim().length > 1 && t.y > 700)
        .map((t) => t.text.trim());
      expect(entry.vocab.map((v) => v.word).sort(), `L${entry.lesson} vs Flip Chart p${page}`).toEqual(
        [...plateWords].sort(),
      );
    }
  });
});
