import { describe, expect, it } from "vitest";
import { checkSlots, isWordComplete, nextWordIndex, targetSlot, WORDS } from "../butterflyGarden";

describe("butterfly game rules", () => {
  it("uses the six words on the approved sign, in order", () => {
    expect(WORDS.map((w) => w.word)).toEqual(["mapa", "pomo", "Mupi", "Pepe", "puma", "Pupi"]);
  });
  it("marks the right syllable in the right slot as correct", () => {
    expect(checkSlots(["ma", "pa", null], ["ma", "pa"])).toEqual(["ok", "ok", null]);
  });
  it("marks syllables in the wrong order as wrong", () => {
    expect(checkSlots(["pa", "ma", null], ["ma", "pa"])).toEqual(["wrong", "wrong", null]);
  });
  it("matches ignoring capitals, like the existing Cartilla game", () => {
    expect(isWordComplete(["Pe", "Pe", null], ["Pe", "pe"])).toBe(true);
    expect(isWordComplete(["Pu", "ma", null], ["pu", "ma"])).toBe(true);
  });
  it("a syllable in the third slot of a two-syllable word is wrong", () => {
    expect(checkSlots(["ma", "pa", "mo"], ["ma", "pa"])[2]).toBe("wrong");
    expect(isWordComplete(["ma", "pa", "mo"], ["ma", "pa"])).toBe(false);
  });
  it("a chosen empty flower slot receives the next syllable", () => {
    expect(targetSlot([null, null, null], 1)).toBe(1);
    expect(targetSlot(["ma", null, null], 0)).toBe(1);
  });
  it("words cycle back to the first", () => {
    expect(nextWordIndex(WORDS.length - 1)).toBe(0);
  });
});
