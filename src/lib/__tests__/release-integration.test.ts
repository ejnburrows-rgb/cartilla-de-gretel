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
      expect(page!.interaction?.kind === undefined || typeof page!.interaction?.kind === "string").toBe(
        true,
      );
    }
  });

  it("every lesson resolves to a non-empty production page array", () => {
    for (const entry of CATALOG) {
      const pages = buildPageArray(entry.n);
      expect(pages.length, `lesson ${entry.n}`).toBeGreaterThan(0);
    }
  });

  it("fallback chain prefers improved art then lineart then scan", () => {
    const chain = getWorkbookPageFallbackChain(4);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[0]).toMatch(/art\/hd\/workbook\/page-004\.(png|jpg)|art\/color\/workbook/);
    // scan or lineart appears later
    expect(chain.some((p) => p.includes("lineart") || p.includes("source") || p.includes("images"))).toBe(
      true,
    );
  });

  it("content-scan pages resolve engine background via improved-art-first chain", () => {
    // Physical page 6 is a 0-object content canvas with a source-scan background
    // in the committed manifest — adapter must prefer HD workbook art first.
    const page = getWorkbookPage(6);
    expect(page).toBeTruthy();
    expect(page!.backgroundSrc).toMatch(/art\/hd\/workbook\/page-006\.(png|jpg)/);
    expect(page!.backgroundFallbackChain?.length).toBeGreaterThanOrEqual(2);
    expect(page!.backgroundFallbackChain?.[0]).toBe(page!.backgroundSrc);
  });

  it("every catalog lesson number is covered by at least one manifest page", () => {
    const lessons = new Set(
      getWorkbookManifest().pages.map((p) => p.lesson).filter((n): n is number => n != null),
    );
    for (let n = 1; n <= 24; n++) {
      expect(lessons.has(n), `lesson ${n} missing from manifest`).toBe(true);
    }
  });
});
