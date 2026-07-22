import { describe, it, expect } from "vitest";
import {
  FLIPCHART_PAGES,
  getFlipchartPageSrc,
  getFlipchartPagesForLesson,
  getPreferredFlipchartSrcForLesson,
  isHdFlipchartPath,
} from "../flipchart-hd";

describe("flipchart-hd — HD-first presentation assets", () => {
  it("ships authored HD plates (not an empty catalog)", () => {
    expect(FLIPCHART_PAGES.length).toBeGreaterThan(0);
  });

  it("getFlipchartPageSrc returns HD flipchart directory paths", () => {
    const page = FLIPCHART_PAGES[0];
    expect(page).toBeTruthy();
    const src = getFlipchartPageSrc(page!);
    expect(isHdFlipchartPath(src)).toBe(true);
    expect(src).toMatch(/\/cartilla\/art\/(restored|hd)\/flipchart\/page-\d+\.jpg$/i);
  });

  it("lesson pages prefer HD plate paths", () => {
    // Lesson 2 (Vocal O) has flipchart plates in the census
    const pages = getFlipchartPagesForLesson(2);
    if (pages.length === 0) {
      // Some lessons may share plates; still assert preferred helper is honest
      expect(getPreferredFlipchartSrcForLesson(2)).toBeNull();
      return;
    }
    const preferred = getPreferredFlipchartSrcForLesson(2);
    expect(preferred).toBeTruthy();
    expect(isHdFlipchartPath(preferred!)).toBe(true);
  });

  it("isHdFlipchartPath rejects non-HD / scan-like paths", () => {
    expect(isHdFlipchartPath("/cartilla/art/raw/scan-01.jpg")).toBe(false);
    expect(isHdFlipchartPath("/cartilla/images/gretel/poses/gretel-idle.webp")).toBe(false);
    expect(isHdFlipchartPath("/cartilla/art/hd/flipchart/page-004.jpg")).toBe(true);
  });
});
