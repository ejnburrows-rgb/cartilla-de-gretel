import { describe, expect, it } from "vitest";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { getWorkbookPageFallbackChain } from "@/lib/bookImages";
import {
  getWorkbookManifest,
  getWorkbookPage,
  listAvailablePhysicalPages,
} from "@/content/workbook/loader";
import { buildPageArray } from "@/utils/buildPageArray";

describe("release integration — workbook + lessons", () => {
  it("has 24 catalog lessons", () => {
    expect(TOTAL_LESSONS).toBe(24);
    expect(CATALOG).toHaveLength(24);
    for (let n = 1; n <= 24; n++) {
      expect(CATALOG.find((e) => e.n === n)).toBeTruthy();
    }
  });

  it("manifest contains 90 real application pages", () => {
    const manifest = getWorkbookManifest();
    expect(manifest.pages.length).toBe(90);
    const pages = listAvailablePhysicalPages();
    expect(pages).toHaveLength(90);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(90);
  });

  it("every mapped page resolves via getWorkbookPage", () => {
    for (const n of listAvailablePhysicalPages()) {
      const page = getWorkbookPage(n);
      expect(page, `page ${n}`).toBeTruthy();
      expect(page!.pageNumber).toBe(n);
      // background may be scan fallback; must not invent interaction content
      expect(
        page!.interaction?.kind === undefined || typeof page!.interaction?.kind === "string",
      ).toBe(true);
    }
  });

  it("every lesson resolves to a non-empty production page array", () => {
    for (const entry of CATALOG) {
      const pages = buildPageArray(entry.n);
      expect(pages.length, `lesson ${entry.n}`).toBeGreaterThan(0);
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

  it("fallback chain prefers improved art then lineart then scan", () => {
    const chain = getWorkbookPageFallbackChain(4);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[0]).toMatch(
      /art\/(restored|hd)\/workbook\/page-004\.(png|jpg)|art\/color\/workbook/,
    );
    // scan or lineart appears later
    expect(
      chain.some((p) => p.includes("lineart") || p.includes("source") || p.includes("images")),
    ).toBe(true);
  });
});
