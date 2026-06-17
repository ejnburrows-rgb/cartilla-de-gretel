import { describe, it, expect } from "vitest";
import { getPageLayout } from "@/lib/book-faithful";

const PILOT_PAGES = [1, 2, 3, 4, 5, 6];

describe("getPageLayout", () => {
  it("returns ordered regions for each pilot page (1-6)", () => {
    for (const pageNumber of PILOT_PAGES) {
      const regions = getPageLayout(pageNumber);
      expect(regions).not.toBeNull();
      expect(regions!.length).toBeGreaterThan(0);

      const orders = regions!.map((r) => r.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));

      for (const region of regions!) {
        expect(region.id).toBeTruthy();
        expect(region.regionType).toBeTruthy();
        expect(["heading", "body", "tracing"]).toContain(region.fontRole);
        if (region.regionType === "illustration-slot") {
          expect(region.illustrationWord).toBeTruthy();
        } else {
          expect(region.text).toBeTruthy();
        }
      }
    }
  });

  it("returns null for pages without an authored pilot layout", () => {
    expect(getPageLayout(7)).toBeNull();
    expect(getPageLayout(50)).toBeNull();
  });
});
