import { describe, expect, it } from "vitest";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { getWorkbookPageFallbackChain } from "@/lib/bookImages";
import pageLayouts from "@/data/page-layouts.json";
import { buildPageArray } from "@/utils/buildPageArray";

describe("release integration — workbook + lessons", () => {
  it("has 24 catalog lessons", () => {
    expect(TOTAL_LESSONS).toBe(24);
    expect(CATALOG).toHaveLength(24);
    for (let n = 1; n <= 24; n++) {
      expect(CATALOG.find((e) => e.n === n)).toBeTruthy();
    }
  });

  it("page-layouts (canonical runtime structured Workbook representation) covers all 90 printed pages", () => {
    const pages = Object.keys(pageLayouts.pages).map(Number).sort((a, b) => a - b);
    expect(pages).toEqual(Array.from({ length: 90 }, (_, i) => i + 1));
    for (const n of pages) {
      const layout = (pageLayouts.pages as Record<string, { regions?: unknown[] }>)[String(n)];
      if (n === 86 || n === 87) {
        // Documented scan gap: blocked pages intentionally carry no regions.
        expect(layout.regions ?? [], `page ${n} stays SOURCE_BLOCKED`).toEqual([]);
        continue;
      }
      expect(layout.regions?.length, `page ${n} regions`).toBeGreaterThan(0);
    }
  });

  it("every lesson resolves to a non-empty production page array with Gretel guidance on every page", () => {
    for (const entry of CATALOG) {
      const pages = buildPageArray(entry.n);
      expect(pages.length, `lesson ${entry.n}`).toBeGreaterThan(0);
      for (const page of pages) {
        expect(page.pageNumber, `${page.id} pageNumber`).toBeTypeOf("number");
        expect(page.gretelLine?.trim().length, `${page.id} Gretel guidance`).toBeGreaterThan(0);
      }
    }
  });

  it("L21–L24 include the closing catalog page (78/82/86/90) even when inventory is short", () => {
    // Inventory historically listed only 3 of 4 printed pages for these
    // lessons — buildPageArray must pad from the catalog so the closing
    // page with a verified layout is not silently dropped.
    expect(buildPageArray(21)).toHaveLength(4);
    expect(buildPageArray(22)).toHaveLength(4);
    expect(buildPageArray(23)).toHaveLength(4);
    expect(buildPageArray(24)).toHaveLength(4);
  });

  it("keeps the fallback chain repository-controlled and does not invent restored artwork", () => {
    const chain = getWorkbookPageFallbackChain(
      4,
      "/cartilla/art/hd/lineart/page-004.png",
    );
    expect(chain[0]).toBe("/cartilla/art/source/workbook/page-004.jpg");
    expect(chain).toContain("/cartilla/art/hd/lineart/page-004.png");
    expect(
      chain.some((p) =>
        /art\/(restored|hd)\/workbook|art\/color\/workbook/.test(p),
      ),
    ).toBe(false);
  });
});
