import { describe, expect, it } from "vitest";
import { FLIPCHART_PAGES } from "@/lib/flipchart-hd";
import { NATIVE_FLIPCHART_PAGES, getNativeFlipchartPage } from "@/lib/flipchart-native";

describe("native Flip Chart coverage", () => {
  it("covers all 62 teacher pages", () => {
    expect(FLIPCHART_PAGES).toHaveLength(62);
    expect(NATIVE_FLIPCHART_PAGES).toHaveLength(62);
    expect(NATIVE_FLIPCHART_PAGES.map((page) => page.flipchartPage)).toEqual(
      Array.from({ length: 62 }, (_, index) => index + 1),
    );
  });

  it("keeps every instructional plate scan-free and faithfully populated", () => {
    for (let pageNumber = 3; pageNumber <= 62; pageNumber += 1) {
      const page = getNativeFlipchartPage(pageNumber);
      expect(page, `missing native page ${pageNumber}`).toBeTruthy();
      expect(page?.hasDigitalText, `missing digital text on page ${pageNumber}`).toBe(true);
      expect(page?.compositionKind).toMatch(/^(art|typography-only)$/);
      expect(
        (page?.body.length ?? 0) + (page?.words.length ?? 0) + (page?.syllables.length ?? 0),
        `missing native instructional content on page ${pageNumber}`,
      ).toBeGreaterThan(0);
      for (const asset of page?.art ?? []) {
        expect(asset.src).toMatch(/^\/cartilla\/art\/faithful\//);
        expect(asset.src).not.toContain("/hd/flipchart/");
        expect(asset.src).not.toContain("/delivery/flipchart/");
      }
    }
  });

  it("keeps drill-page vocabulary in word chips while story pages stay prose", () => {
    const lPage = getNativeFlipchartPage(25);
    expect(lPage?.words.map((word) => word.parts.join(""))).toEqual(
      expect.arrayContaining(["lima", "lata", "aleta", "maleta"]),
    );

    const storyPage = getNativeFlipchartPage(26);
    expect(storyPage?.words).toHaveLength(0);
    expect(storyPage?.body.some((line) => line.text.includes("Leo"))).toBe(true);
  });

  it("keeps split reading sentences as prose instead of vocabulary chips", () => {
    for (const pageNumber of [25, 28, 31, 34]) {
      const page = getNativeFlipchartPage(pageNumber);
      expect(page).toBeTruthy();
      expect(
        page?.words.some((word) => word.parts.join("").replace(/\s+/g, "").length > 18),
        `long reading sentence leaked into vocabulary on page ${pageNumber}`,
      ).toBe(false);
      expect(page?.body.some((line) => line.text.includes(" "))).toBe(true);
    }
  });

  it("preserves typography-only source plates without inventing unrelated art", () => {
    const page22 = getNativeFlipchartPage(22);
    expect(page22?.compositionKind).toBe("typography-only");
    expect(page22?.art).toHaveLength(0);
    expect(page22?.words.length).toBeGreaterThan(0);
    expect(page22?.body.length).toBeGreaterThan(0);
  });

  it("uses native frontmatter for pages 1 and 2", () => {
    for (const pageNumber of [1, 2]) {
      const page = getNativeFlipchartPage(pageNumber);
      expect(page).toBeTruthy();
      expect(page?.flipchartPage).toBe(pageNumber);
    }
  });
});
