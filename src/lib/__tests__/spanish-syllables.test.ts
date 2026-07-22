import { describe, it, expect } from "vitest";
import { splitSyllables, shuffledSyllables } from "../spanish-syllables";

describe("splitSyllables", () => {
  it("splits simple consonant-vowel words (-CV)", () => {
    expect(splitSyllables("lado")).toEqual(["la", "do"]);
    expect(splitSyllables("gato")).toEqual(["ga", "to"]);
    expect(splitSyllables("mesa")).toEqual(["me", "sa"]);
    expect(splitSyllables("paloma")).toEqual(["pa", "lo", "ma"]);
  });

  it("splits between two separable consonants (VCCV → VC-CV)", () => {
    expect(splitSyllables("alto")).toEqual(["al", "to"]);
    expect(splitSyllables("isla")).toEqual(["is", "la"]);
  });

  it("keeps inseparable consonant groups together (pr, etc.)", () => {
    expect(splitSyllables("apretar")).toEqual(["a", "pre", "tar"]);
  });

  it("treats ch/ll/rr digraphs and qu as single units", () => {
    expect(splitSyllables("carro")).toEqual(["ca", "rro"]);
    expect(splitSyllables("calle")).toEqual(["ca", "lle"]);
    expect(splitSyllables("queso")).toEqual(["que", "so"]);
  });

  it("keeps a one-syllable word whole (trailing consonants included)", () => {
    expect(splitSyllables("sol")).toEqual(["sol"]);
    expect(splitSyllables("pan")).toEqual(["pan"]);
  });

  it("preserves original casing", () => {
    expect(splitSyllables("Gato")).toEqual(["Ga", "to"]);
  });

  it("returns [] for an empty string and a single token for non-letter input", () => {
    expect(splitSyllables("")).toEqual([]);
    expect(splitSyllables("a1b")).toEqual(["a1b"]);
  });
});

describe("shuffledSyllables", () => {
  it("is deterministic for a given seed and is a permutation of the syllables", () => {
    const a = shuffledSyllables("paloma", 7);
    const b = shuffledSyllables("paloma", 7);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([...splitSyllables("paloma")].sort());
  });
});
