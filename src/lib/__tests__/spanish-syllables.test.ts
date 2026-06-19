import { describe, it, expect } from "vitest";
import { splitSyllables, shuffledSyllables } from "@/lib/spanish-syllables";

describe("splitSyllables", () => {
  it("splits simple consonant-vowel words (-CV)", () => {
    expect(splitSyllables("lado")).toEqual(["la", "do"]);
    expect(splitSyllables("casa")).toEqual(["ca", "sa"]);
    expect(splitSyllables("mariposa")).toEqual(["ma", "ri", "po", "sa"]);
  });

  it("keeps a single-syllable word whole", () => {
    expect(splitSyllables("sol")).toEqual(["sol"]);
    expect(splitSyllables("pan")).toEqual(["pan"]);
  });

  it("splits between two different consonants (VC-CV)", () => {
    expect(splitSyllables("alto")).toEqual(["al", "to"]);
    expect(splitSyllables("árbol")).toEqual(["ár", "bol"]);
  });

  it("treats ch/ll/rr digraphs as a single, unsplittable onset", () => {
    expect(splitSyllables("perro")).toEqual(["pe", "rro"]);
    expect(splitSyllables("calle")).toEqual(["ca", "lle"]);
    expect(splitSyllables("coche")).toEqual(["co", "che"]);
  });

  it("keeps inseparable consonant pairs (pr/pl/br/tr/...) together", () => {
    expect(splitSyllables("apretar")).toEqual(["a", "pre", "tar"]);
  });

  it("splits a 3-consonant cluster after the first consonant", () => {
    expect(splitSyllables("instante")).toEqual(["ins", "tan", "te"]);
  });

  it("treats qu/gu + vowel as a single syllable nucleus", () => {
    expect(splitSyllables("queso")).toEqual(["que", "so"]);
    expect(splitSyllables("agua")).toEqual(["a", "gua"]);
  });

  it("handles ñ as a normal consonant onset", () => {
    expect(splitSyllables("niño")).toEqual(["ni", "ño"]);
  });

  it("preserves the original casing of the input", () => {
    expect(splitSyllables("Lado")).toEqual(["La", "do"]);
  });

  it("returns an empty array for empty input", () => {
    expect(splitSyllables("")).toEqual([]);
  });

  it("returns the raw token unchanged when it contains non-letters", () => {
    expect(splitSyllables("abc123")).toEqual(["abc123"]);
    expect(splitSyllables("hola mundo")).toEqual(["hola mundo"]);
  });
});

describe("shuffledSyllables", () => {
  it("is deterministic for a given seed", () => {
    expect(shuffledSyllables("mariposa", 7)).toEqual(shuffledSyllables("mariposa", 7));
  });

  it("returns a permutation of the original syllables (no loss, no duplication)", () => {
    const original = splitSyllables("mariposa");
    const shuffled = shuffledSyllables("mariposa", 3);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it("leaves a single-syllable word untouched", () => {
    expect(shuffledSyllables("sol", 42)).toEqual(["sol"]);
  });
});
