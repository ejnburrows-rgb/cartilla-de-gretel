import { describe, expect, it } from "vitest";
import transcription from "@/data/book-transcription/lessons-08-24.json";
import { PIANO_WORDS, getPianoWords } from "../piano-words";

type Fill = { wordBox?: string; blank?: string; answer?: string };
type Lesson = {
  lesson: number;
  title: string;
  vocab?: string[];
  fill?: Fill[];
  circle?: { rows: string[][] }[];
};
const lessons = (transcription as unknown as { lessons: Record<string, Lesson> }).lessons;

describe("piano-words", () => {
  it("uses only words printed in that lesson of the Student Workbook transcription", () => {
    for (const [lesson, words] of Object.entries(PIANO_WORDS)) {
      const source = lessons[lesson];
      expect(source, `lesson ${lesson}`).toBeTruthy();
      const printed = new Set([
        ...(source.vocab ?? []),
        ...(source.fill ?? []).map((f) => f.wordBox ?? ""),
      ]);
      for (const entry of words)
        expect(printed.has(entry.word), `${lesson}:${entry.word}`).toBe(true);
    }
  });

  it("splits every word into syllables that join back to the word", () => {
    for (const words of Object.values(PIANO_WORDS)) {
      expect(words.length).toBeGreaterThan(0);
      expect(words.length).toBeLessThanOrEqual(5);
      for (const entry of words) {
        expect(entry.syllables.join("")).toBe(entry.word);
        expect(entry.syllables.length).toBeGreaterThanOrEqual(2);
        for (const syllable of entry.syllables)
          expect(syllable).toMatch(/^[^aeiouáéíóú]?[aeiouáéíóú]$/);
      }
    }
  });

  it("agrees with the book's printed fill-in splits", () => {
    for (const [lesson, words] of Object.entries(PIANO_WORDS)) {
      for (const fill of lessons[lesson].fill ?? []) {
        const entry = words.find((w) => w.word === fill.wordBox);
        if (!entry || !fill.blank || !fill.answer) continue;
        const parts = fill.blank.split(/\s+/).map((part) => (/_+/.test(part) ? fill.answer : part));
        // Each printed part (e.g. "to ___" + "mate") must be a run of whole syllables.
        const boundaries = new Set(
          entry.syllables.map((_, i) => entry.syllables.slice(0, i + 1).join("").length),
        );
        let length = 0;
        for (const part of parts) {
          length += (part ?? "").length;
          expect(boundaries.has(length), `${lesson}:${entry.word} part ${part}`).toBe(true);
        }
        expect(parts.join(""), `${lesson}:${entry.word}`).toBe(entry.word);
      }
    }
  });

  it("gives Sapo = SA–PO for the Ss lesson and nothing for lessons without verified words", () => {
    expect(getPianoWords(9)[0]).toEqual({ word: "sapo", syllables: ["sa", "po"] });
    expect(getPianoWords(18)).toEqual([]);
    expect(getPianoWords(3)).toEqual([]);
    const copy = getPianoWords(9);
    copy[0].syllables.push("x");
    expect(getPianoWords(9)[0].syllables).toEqual(["sa", "po"]);
  });
});
