import { describe, it, expect } from "vitest";
import { matchSpoken, wordHeard, tokens } from "../wordListening";

describe("wordHeard", () => {
  it("accepts the word with or without accents and capitals", () => {
    expect(wordHeard("mama", "mamá")).toBe(true);
    expect(wordHeard("Mímame", "mimame")).toBe(true);
  });
  it("is tolerant of one slip on words with 3+ sounds", () => {
    expect(wordHeard("mami", "mamá")).toBe(true);
    expect(wordHeard("amó", "amo")).toBe(true);
  });
  it("does not accept short words or unrelated words", () => {
    expect(wordHeard("mi", "me")).toBe(false);
    expect(wordHeard("casa", "mamá")).toBe(false);
  });
  it("treats b/v and silent h alike", () => {
    expect(wordHeard("bote", "vote")).toBe(true);
    expect(wordHeard("ola", "hola")).toBe(true);
  });
});

describe("matchSpoken", () => {
  const targets = ["mamá", "mami", "Mimo", "mío"];
  it("matches several words said in a row", () => {
    expect(matchSpoken(tokens("mamá mami mimo"), targets, 0)).toEqual({
      matched: 3,
      tokensUsed: 3,
    });
  });
  it("skips filler before the word and stops at a miss", () => {
    expect(matchSpoken(tokens("eh mamá casa"), targets, 0).matched).toBe(1);
  });
  it("does not count the same token twice when continuing an utterance", () => {
    const first = matchSpoken(tokens("mamá"), targets, 0);
    const again = matchSpoken(tokens("mamá"), targets, 1, first.tokensUsed);
    expect(again.matched).toBe(0);
  });
});
