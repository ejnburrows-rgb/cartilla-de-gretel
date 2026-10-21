import { describe, expect, it } from "vitest";
import { isCorrectWindow, isNextSyllable, wordDisplay, COW_SYLLABLES, COW_SLOTS } from "@/lib/games/cow-game-logic";

describe("cow game rules", () => {
  it("places cows and windows in the approved order", () => {
    expect(COW_SYLLABLES).toEqual(["mu", "mo", "me", "ma", "mi"]);
    expect(COW_SLOTS).toEqual(["mo", "mu", "ma", "mi", "me"]);
  });
  it("cow ma belongs only in the ma window", () => {
    expect(isCorrectWindow(3, 2)).toBe(true);
    expect(isCorrectWindow(3, 0)).toBe(false);
  });
  it("mamá needs cow ma twice, reusing the same cow", () => {
    expect(isNextSyllable([], 3, 2)).toBe(true);
    expect(isNextSyllable(["ma"], 3, 2)).toBe(true);
    expect(isNextSyllable(["ma", "ma"], 3, 2)).toBe(false);
    expect(isNextSyllable([], 4, 3)).toBe(false);
  });
  it("adds the accent only when the word is complete", () => {
    expect(wordDisplay(["ma"])).toBe("ma");
    expect(wordDisplay(["ma", "ma"])).toBe("mamá");
  });
});
