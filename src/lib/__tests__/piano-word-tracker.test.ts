import { describe, expect, it } from "vitest";
import { advanceSyllables, tokenizeSpeech } from "../piano-word-tracker";

const SAPO = ["sa", "po"];

describe("piano-word-tracker", () => {
  it("confirms separated syllables in order", () => {
    expect(advanceSyllables(SAPO, 0, "sa")).toBe(1);
    expect(advanceSyllables(SAPO, 1, "po")).toBe(2);
    expect(advanceSyllables(SAPO, 0, "sa po")).toBe(2);
    expect(advanceSyllables(SAPO, 0, "Sa, po.")).toBe(2);
    expect(advanceSyllables(SAPO, 0, "sa… po")).toBe(2);
  });

  it("confirms the naturally spoken whole word, also after a partial start", () => {
    expect(advanceSyllables(SAPO, 0, "sapo")).toBe(2);
    expect(advanceSyllables(SAPO, 0, "¡Sapo!")).toBe(2);
    expect(advanceSyllables(SAPO, 1, "sapo")).toBe(2);
    expect(advanceSyllables(["to", "ma", "te"], 0, "toma")).toBe(2);
    expect(advanceSyllables(["to", "ma", "te"], 2, "te")).toBe(3);
  });

  it("never matches substrings or neighbouring words", () => {
    for (const wrong of [
      "casa",
      "mesa",
      "papo",
      "sopa",
      "esa",
      "pasó",
      "masa",
      "zapato",
      "s",
      "sap",
      "sapos",
      "posa",
    ]) {
      expect(advanceSyllables(SAPO, 0, wrong), wrong).toBe(0);
    }
    expect(advanceSyllables(SAPO, 1, "pollo")).toBe(1);
    expect(advanceSyllables(SAPO, 1, "sa")).toBe(1); // out of order / repeat ignored
  });

  it("does not skip ahead to a later syllable", () => {
    expect(advanceSyllables(SAPO, 0, "po")).toBe(0);
    expect(advanceSyllables(["ma", "le", "ta"], 0, "ta")).toBe(0);
  });

  it("never decreases progress", () => {
    expect(advanceSyllables(SAPO, 1, "")).toBe(1);
    expect(advanceSyllables(SAPO, 1, "casa mesa")).toBe(1);
    expect(advanceSyllables(SAPO, 2, "nada")).toBe(2);
  });

  it("ignores filler words around the target", () => {
    expect(advanceSyllables(SAPO, 0, "eh sa")).toBe(1);
    expect(advanceSyllables(SAPO, 0, "el sapo")).toBe(2);
  });

  it("uses the existing Spanish normalization (accents, seseo, b/v)", () => {
    expect(advanceSyllables(["a", "sí"], 0, "así")).toBe(2);
    expect(advanceSyllables(["a", "sí"], 0, "asi")).toBe(2);
    expect(advanceSyllables(["za", "pa", "to"], 0, "sapato")).toBe(3);
    expect(advanceSyllables(["va", "so"], 0, "baso")).toBe(2);
  });

  it("tokenizes punctuation and Spanish quotes away", () => {
    expect(tokenizeSpeech("«Sa», ¿po?")).toEqual(["sa", "po"]);
    expect(tokenizeSpeech("")).toEqual([]);
  });
});
