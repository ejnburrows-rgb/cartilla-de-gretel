import { describe, it, expect } from "vitest";
import {
  FLIPCHART_PAGES,
  getFlipchartDeliverySrc,
  getFlipchartPageSrc,
  getFlipchartPagesForLesson,
  getPreferredFlipchartSrcForLesson,
  isHdFlipchartPath,
} from "../flipchart-hd";

describe("flipchart-hd — HD-first presentation assets", () => {
  it("ships all 62 authored HD plates", () => {
    expect(FLIPCHART_PAGES).toHaveLength(62);
  });

  it("getFlipchartPageSrc returns canonical HD flipchart directory paths", () => {
    const page = FLIPCHART_PAGES[0];
    expect(page).toBeTruthy();
    const src = getFlipchartPageSrc(page!);
    expect(isHdFlipchartPath(src)).toBe(true);
    expect(src).toMatch(/\/cartilla\/art\/(restored|hd)\/flipchart\/page-\d+\.jpg$/i);
  });

  it("maps canonical plates to screen and thumbnail delivery tiers without mutating the master URL", () => {
    const page = FLIPCHART_PAGES[0]!;
    const canonical = getFlipchartPageSrc(page);
    expect(getFlipchartDeliverySrc(page, "screen")).toBe(
      "/cartilla/art/delivery/flipchart/screen/page-001.webp",
    );
    expect(getFlipchartDeliverySrc(page, "thumb")).toBe(
      "/cartilla/art/delivery/flipchart/thumb/page-001.webp",
    );
    expect(getFlipchartDeliverySrc(page, "canonical")).toBe(canonical);
    expect(getFlipchartPageSrc(page)).toBe(canonical);
  });

  it("lesson pages prefer HD plate paths", () => {
    const pages = getFlipchartPagesForLesson(2);
    if (pages.length === 0) {
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
