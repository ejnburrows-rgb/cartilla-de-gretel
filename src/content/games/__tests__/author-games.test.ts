import { describe, expect, it } from "vitest";
import { AUTHOR_LETTERS, AUTHOR_MECHANICS, AUTHOR_REFERENCES, authorContentGaps, createAuthorGame } from "../author-games";
import { LESSONS } from "@/content/lesson-meta";
import { existsSync } from "node:fs";

describe("source-backed author templates", () => {
  it("covers all 23 taught letters, keeping Rr and rr separate", () => {
    expect(AUTHOR_LETTERS.map(item => item.letter)).toEqual(["O","A","E","I","U","Mm","Pp","Ss","Tt","Dd","Ll","Nn","Ññ","Bb","Vv","Rr","rr","Gg","Ff","Jj","Cc","Yy","Zz"]);
    expect(new Set(AUTHOR_LETTERS.map(item => item.n)).size).toBe(23);
  });
  it("preserves the reference word order and syllables", () => {
    for (const reference of AUTHOR_REFERENCES) {
      if (reference.letter.includes("/")) continue;
      const lesson = AUTHOR_LETTERS.find(item => item.letter.toLowerCase().startsWith(reference.letter));
      expect(lesson).toBeDefined();
      const { content } = createAuthorGame(reference.type as typeof AUTHOR_MECHANICS[number], lesson!.n);
      expect(content?.words).toEqual(reference.words);
      expect(content?.tiles).toEqual(reference.tiles);
    }
  });
  it("does not report syllable gaps for a fluency mechanic that reads whole words", () => {
    for (const lesson of AUTHOR_LETTERS) expect(createAuthorGame("palabras-por-minuto", lesson.n).gaps).toEqual([]);
  });
  it("does not treat whole-word fluency cards as syllable segmentation", () => {
    const { content } = createAuthorGame("payaso-chano", 8);
    expect(content?.words.find(word => word.word === "papá")?.syllables).toEqual(["pa", "pá"]);
  });
  it("retains source artwork when another reference repeats the word without art", () => {
    const { content } = createAuthorGame("payaso-chano", 8);
    expect(content?.words.find(word => word.word === "papá")?.imageUrl)
      .toBe("/cartilla/art/faithful/leccion-8-p/papa.webp");
  });
  it("offers a non-rhyming distractor for each generated rhyme set", () => {
    for (const lesson of AUTHOR_LETTERS) {
      const { content } = createAuthorGame("lectura-rima", lesson.n);
      if (!content) continue;
      const endings = content.words.map(word => word.syllables.at(-1)?.toLowerCase());
      expect(new Set(endings).size).toBeGreaterThan(1);
      expect(endings.some((ending, index) => endings.indexOf(ending) !== index)).toBe(true);
    }
  });
  it("never fabricates words, syllable tokens, art, or playable empty rounds", () => {
    const words = new Set([...LESSONS.flatMap(item => item.keywords), ...AUTHOR_REFERENCES.flatMap(item => item.words.map(word => word.word))]);
    const syllables = new Set([...LESSONS.flatMap(item => item.syllables), ...AUTHOR_REFERENCES.flatMap(item => item.words.flatMap(word => word.syllables))].map(value => value.toLowerCase()));
    const ids = new Set<string>();
    for (const lesson of AUTHOR_LETTERS) for (const mechanic of AUTHOR_MECHANICS) {
      const { content, gaps } = createAuthorGame(mechanic, lesson.n);
      if (!content) { expect(gaps.length).toBeGreaterThan(0); continue; }
      expect(content.words.length).toBeGreaterThan(0);
      expect(ids.has(content.id)).toBe(false); ids.add(content.id);
      for (const word of content.words) {
        expect(words.has(word.word)).toBe(true);
        expect(word.syllables.join("").toLowerCase()).toBe(word.word.toLowerCase());
        if (mechanic !== "palabras-por-minuto") for (const syllable of word.syllables) expect(syllables.has(syllable.toLowerCase())).toBe(true);
        if (word.imageUrl) expect(existsSync(`public${word.imageUrl}`)).toBe(true);
      }
    }
    expect(authorContentGaps().length).toBeGreaterThan(0);
  });
});
