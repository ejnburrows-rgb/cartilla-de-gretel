import { describe, it, expect } from "vitest";
import {
  getWorkbookManifest,
  getAllWorkbookPages,
  getWorkbookManifestPage,
  getWorkbookPagesForLesson,
} from "@/lib/workbook-manifest";

describe("workbook-manifest", () => {
  it("should load the manifest with at least 90 pages", () => {
    const manifest = getWorkbookManifest();
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.totalPages).toBeGreaterThanOrEqual(90);

    const pages = getAllWorkbookPages();
    expect(pages.length).toBeGreaterThanOrEqual(90);
  });

  it("should retrieve specific page by physical number", () => {
    const page = getWorkbookManifestPage(1);
    expect(page).toBeDefined();
    expect(page?.pageNumber).toBe(1);
    expect(page?.lessonNumber).toBe(1);
    expect(page?.backgroundAsset).toMatch(/\/cartilla\/art\/hd\/workbook\/page-001\.(jpg|webp)/);
  });

  it("should retrieve all pages for a specific lesson", () => {
    const lesson2Pages = getWorkbookPagesForLesson(2);
    expect(lesson2Pages.length).toBeGreaterThan(0);
    expect(lesson2Pages.every((p) => p.lessonNumber === 2)).toBe(true);
  });
});
