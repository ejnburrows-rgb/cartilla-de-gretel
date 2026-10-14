import { describe, expect, test } from "vitest";
import { getNativeFlipchartPage } from "../flipchart-native";

describe("Syllable parsing order", () => {
  test("Page 10 syllables order", () => {
    const data = getNativeFlipchartPage(10);
    expect(data?.syllables).toEqual([
      'ma', 'me', 'mi', 'mo', 'mu',
      'mu', 'mo', 'ma', 'me', 'mi'
    ]);
  });

  test("Page 16 syllables order", () => {
    const data = getNativeFlipchartPage(16);
    expect(data?.syllables).toEqual([
      'sa', 'se', 'si', 'so', 'su',
      'su', 'so', 'sa', 'se', 'si'
    ]);
  });

  test("Page 19 syllables order", () => {
    const data = getNativeFlipchartPage(19);
    expect(data?.syllables).toEqual([
      'ta', 'te', 'ti', 'to', 'tu',
      'tu', 'to', 'ta', 'te', 'ti'
    ]);
  });

  test("Page 57 syllables order (centered 'y')", () => {
    const data = getNativeFlipchartPage(57);
    expect(data?.syllables).toEqual([ 'ya', 'ye', 'yi', 'yo', 'yu' ]);
  });
});
