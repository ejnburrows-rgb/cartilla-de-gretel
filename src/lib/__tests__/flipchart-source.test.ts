import { describe, it, expect } from "vitest";
import {
  FLIPCHART_SOURCE_CARDS,
  getFlipchartSourceCard,
  getFlipchartSourceCardIds,
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
});
