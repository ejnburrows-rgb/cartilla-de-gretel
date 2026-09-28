import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import conversionStatus from "@/data/conversion-status.json";
import pageLayouts from "@/data/page-layouts.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { buildPageArray } from "@/utils/buildPageArray";

describe("native workbook coverage", () => {
  it("has structured native coverage for all 90 instructional pages", () => {
    const layoutPages = Object.keys(pageLayouts.pages).map(Number).sort((a, b) => a - b);
    expect(layoutPages).toEqual(Array.from({ length: 90 }, (_, index) => index + 1));
    expect(conversionStatus.pages).toHaveLength(90);
    expect(conversionStatus.pages.every((page) => page.status === "NATIVE_COMPLETE")).toBe(true);
  });

  it("routes every lesson page through the native FaithfulPageRenderer", () => {
    expect(CATALOG).toHaveLength(24);
    for (const lesson of CATALOG) {
      const pages = buildPageArray(lesson.n);
      expect(pages.length).toBeGreaterThan(0);
      for (const page of pages) {
        expect(isValidElement(page.content)).toBe(true);
        const element = page.content as ReactElement<{ native?: boolean; interactive?: boolean }>;
        expect(element.props.native).toBe(true);
        expect(element.props.interactive).toBe(true);
      }
    }
  });
});
