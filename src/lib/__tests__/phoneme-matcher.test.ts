import { describe, it, expect } from "vitest";
import { normalizeSpanishPhonemes, matchesSyllablePhonetically } from "../phoneme-matcher";

describe("normalizeSpanishPhonemes", () => {
  it("returns empty string for empty input", () => {
    expect(normalizeSpanishPhonemes("")).toBe("");
  });

  it("lowercases and strips accents", () => {
    expect(normalizeSpanishPhonemes("árbol")).toBe("arbol");
    expect(normalizeSpanishPhonemes("César")).toBe("sesar");
  });

  it("applies common Spanish phoneme equivalences", () => {
    expect(normalizeSpanishPhonemes("Vaca")).toBe("baka"); // v->b, ca->ka
    expect(normalizeSpanishPhonemes("llave")).toBe("yabe"); // ll->y, v->b
    expect(normalizeSpanishPhonemes("zapato")).toBe("sapato"); // z->s
    expect(normalizeSpanishPhonemes("queso")).toBe("keso"); // qu->k
    expect(normalizeSpanishPhonemes("cielo")).toBe("sielo"); // ci->si
    expect(normalizeSpanishPhonemes("gigante")).toBe("jigante"); // gi->ji
    expect(normalizeSpanishPhonemes("hola")).toBe("ola"); // silent h
    expect(normalizeSpanishPhonemes("perro")).toBe("pero"); // rr->r
  });

  it("removes common punctuation", () => {
    expect(normalizeSpanishPhonemes("ma-má")).toBe("mama");
    expect(normalizeSpanishPhonemes("sol!")).toBe("sol");
  });
});

describe("matchesSyllablePhonetically", () => {
  it("is false when either argument is empty", () => {
    expect(matchesSyllablePhonetically("", "vaca")).toBe(false);
    expect(matchesSyllablePhonetically("va", "")).toBe(false);
  });

  it("matches a syllable embedded in a spoken word via phonetic normalization", () => {
    // "va" -> "ba"; "la vaca" -> "labaka", which contains "ba"
    expect(matchesSyllablePhonetically("va", "la vaca")).toBe(true);
  });

  it("matches across the b/v and z/s equivalences", () => {
    // "za" -> "sa"; "casa" -> "kasa" contains "sa"
    expect(matchesSyllablePhonetically("za", "casa")).toBe(true);
  });

  it("does not match an absent syllable", () => {
    expect(matchesSyllablePhonetically("fi", "la vaca")).toBe(false);
  });
});
