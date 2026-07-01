import { describe, it, expect } from "vitest";
import { getPageLayout, hasPageLayout, type PageRegion } from "@/lib/book-faithful";
import pilotLayouts from "@/data/page-layouts.pilot.json";

const pilotPages = (pilotLayouts as { pages: Record<string, { regions: PageRegion[] }> }).pages;

describe("faithful page layouts", () => {
  it("canonical page-layouts.json only serves VERIFIED pages (none seeded with placeholder)", () => {
    // Phase 0: no page is claimed as faithful until transcribed + verified.
    expect(getPageLayout(50)).toBeNull();
    expect(hasPageLayout(50)).toBe(false);
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
