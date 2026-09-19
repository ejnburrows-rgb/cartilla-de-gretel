import { describe, expect, it } from "vitest";
import {
  buildSoundSearchChoices,
  canBuildSoundSearch,
  matchesInitialSound,
} from "../activity-mechanics";

const lessonWords = [
  { word: "abanico", illustrationSrc: "/cartilla/art/faithful/vocal-a/abanico.webp" },
  { word: "anillo", illustrationSrc: "/cartilla/art/faithful/vocal-a/anillo.webp" },
  { word: "araña", illustrationSrc: "/cartilla/art/faithful/vocal-a/arana.webp" },
  { word: "avión", illustrationSrc: "/cartilla/art/faithful/vocal-a/avion.webp" },
  { word: "imán", illustrationSrc: "/cartilla/art/faithful/vocal-i/iman.webp" },
  { word: "oso", illustrationSrc: "/cartilla/art/faithful/vocal-o/oso.webp" },
  { word: "elefante", illustrationSrc: "/cartilla/art/faithful/vocal-e/elefante.webp" },
];

describe("sound-search mechanics", () => {
  it("matches accented words by their canonical initial letter", () => {
    expect(matchesInitialSound("Águila", "a")).toBe(true);
    expect(matchesInitialSound("ñame", "ñ")).toBe(true);
    expect(matchesInitialSound("nube", "ñ")).toBe(false);
    expect(matchesInitialSound("oso", "a")).toBe(false);
  });

  it("builds a mixed board only from supplied authenticated words and art", () => {
    const choices = buildSoundSearchChoices("a", lessonWords, [], 6);
    expect(choices).toHaveLength(6);
    expect(choices.filter((item) => matchesInitialSound(item.word, "a"))).toHaveLength(3);
    for (const choice of choices) {
      expect(lessonWords).toContainEqual(choice);
      expect(choice.illustrationSrc).toMatch(/^\/cartilla\/art\/faithful\//);
    }
  });

  it("refuses a board with no real distractors instead of fabricating curriculum", () => {
    const onlyA = lessonWords.slice(0, 4);
    expect(canBuildSoundSearch("a", onlyA)).toBe(false);
  });
});
