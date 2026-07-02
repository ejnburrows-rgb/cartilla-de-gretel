import { describe, it, expect } from "vitest";
import { getPageLayout, hasPageLayout, type PageRegion } from "@/lib/book-faithful";
import pilotLayouts from "@/data/page-layouts.pilot.json";
import canonicalLayouts from "@/data/page-layouts.json";

const pilotPages = (pilotLayouts as { pages: Record<string, { regions: PageRegion[] }> }).pages;
const canonicalPages = (canonicalLayouts as { pages: Record<string, { regions: PageRegion[] }> })
  .pages;

describe("faithful page layouts", () => {
  it("hasPageLayout/getPageLayout agree with the canonical file for every known page and for a page outside any lesson's range", () => {
    for (const key of Object.keys(canonicalPages)) {
      const pageNumber = Number(key);
      expect(hasPageLayout(pageNumber)).toBe(true);
      expect(getPageLayout(pageNumber)).not.toBeNull();
    }
    // Page 999 is far outside the 92-page workbook — always unverified.
    expect(hasPageLayout(999)).toBe(false);
    expect(getPageLayout(999)).toBeNull();
  });

  it("pilot demo layout parses with well-formed, ordered regions", () => {
    const keys = Object.keys(pilotPages);
    expect(keys.length).toBeGreaterThan(0);

    for (const key of keys) {
      const regions = pilotPages[key]?.regions ?? [];
      expect(regions.length).toBeGreaterThan(0);

      const orders = regions.map((r) => r.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));

      for (const region of regions) {
        expect(region.id).toBeTruthy();
        expect(region.regionType).toBeTruthy();
        expect(["heading", "body", "tracing"]).toContain(region.fontRole);
        if (region.regionType === "illustration-slot") {
          // pilot uses legacy illustrationWord; faithful pages use illustrationSrc
          expect(region.illustrationWord ?? region.illustrationSrc).toBeTruthy();
        } else {
          expect(region.text).toBeTruthy();
        }
      }
    }
  });
});
