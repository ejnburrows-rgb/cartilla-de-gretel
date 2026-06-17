import { describe, it, expect } from "vitest";
import {
  FLIPCHART_SOURCE_CARDS,
  getFlipchartSourceCard,
  getFlipchartSourceCardIds,
  getFlipchartSourceCardsForLesson,
} from "@/lib/flipchart-source";

describe("flipchart-source", () => {
  it("loads all 20 corrected flip chart cards", () => {
    expect(FLIPCHART_SOURCE_CARDS.length).toBe(20);
  });

  it("each card has a master image and ordered, non-empty regions", () => {
    for (const card of FLIPCHART_SOURCE_CARDS) {
      expect(card.id).toBeTruthy();
      expect(card.masterImage).toMatch(/^\/cartilla\/art\/flipchart\/master\/.+\.webp$/);
      expect(card.regions.length).toBeGreaterThan(0);

      const orders = card.regions.map((r) => r.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));

      for (const region of card.regions) {
        expect(region.text).toBeTruthy();
      }
    }
  });

  it("getFlipchartSourceCard finds a known card and returns null for unknown ids", () => {
    expect(getFlipchartSourceCard("10Mm")?.section).toBe("letter-M");
    expect(getFlipchartSourceCard("does-not-exist")).toBeNull();
  });

  it("getFlipchartSourceCardIds returns every card id in source order", () => {
    const ids = getFlipchartSourceCardIds();
    expect(ids[0]).toBe("1Portada");
    expect(ids).toContain("26Nn");
    expect(ids.length).toBe(20);
  });

  it("getFlipchartSourceCardsForLesson maps consonant lessons to their letter cards", () => {
    expect(getFlipchartSourceCardsForLesson(7).map((c) => c.id)).toEqual(["10Mm"]);
    expect(getFlipchartSourceCardsForLesson(8).map((c) => c.id)).toEqual(["11Pp", "12Pp", "13Pp"]);
    expect(getFlipchartSourceCardsForLesson(13).map((c) => c.id)).toEqual(["25Nn", "26Nn"]);
  });

  it("getFlipchartSourceCardsForLesson maps the intro lesson to the cover and rhyme cards", () => {
    expect(getFlipchartSourceCardsForLesson(1).map((c) => c.id)).toEqual([
      "1Portada",
      "2Las_hermanitas_vocales_Rima",
    ]);
  });

  it("getFlipchartSourceCardsForLesson returns [] for lessons without a verified card", () => {
    expect(getFlipchartSourceCardsForLesson(2)).toEqual([]);
    expect(getFlipchartSourceCardsForLesson(24)).toEqual([]);
  });
});
