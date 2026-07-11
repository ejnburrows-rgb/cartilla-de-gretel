import { describe, expect, it } from "vitest";
import {
  getBookPageImage,
  getLineartPathFromSource,
  getWorkbookPageFallbackChain,
} from "@/lib/bookImages";

describe("bookImages Art Fallback Chain", () => {
  it("resolves primary HD colorized art for valid pages", () => {
    expect(getBookPageImage(4)).toBe("/cartilla/art/hd/workbook/page-004.png");
    expect(getBookPageImage(1)).toBe("/cartilla/art/hd/workbook/page-001.png");
    expect(getBookPageImage(999)).toBeNull();
  });

  it("derives clean transparent lineart path from raw source scan path", () => {
    expect(getLineartPathFromSource("cartilla/images/source/a/a-page-4.jpg")).toBe(
      "/cartilla/art/hd/lineart/a-page-4.png",
    );
    expect(getLineartPathFromSource("/cartilla/images/source/rima/rima-page-2.jpg")).toBe(
      "/cartilla/art/hd/lineart/rima-page-2.png",
    );
    expect(getLineartPathFromSource("/cartilla/art/hd/lineart/a-page-4.png")).toBe(
      "/cartilla/art/hd/lineart/a-page-4.png",
    );
    expect(getLineartPathFromSource(null)).toBeNull();
  });

  it("builds the ordered sequence: HD colorized art -> Clean transparent lineart -> Raw source scan", () => {
    const chain = getWorkbookPageFallbackChain(4, "cartilla/images/source/a/a-page-4.jpg");
    expect(chain[0]).toBe("/cartilla/art/hd/workbook/page-004.png");
    expect(chain[1]).toBe("/cartilla/art/hd/workbook/page-004.jpg");
    expect(chain).toContain("/cartilla/art/hd/lineart/a-page-4.png");
    expect(chain).toContain("/cartilla/images/source/a/a-page-4.jpg");
    // Ensure order is HD -> lineart -> raw scan
    const lineartIdx = chain.indexOf("/cartilla/art/hd/lineart/a-page-4.png");
    const rawIdx = chain.indexOf("/cartilla/images/source/a/a-page-4.jpg");
    expect(lineartIdx).toBeGreaterThan(0);
    expect(rawIdx).toBeGreaterThan(lineartIdx);
  });

  it("resolves source scan from catalog when sourceScanPath is not passed", () => {
    const chain = getWorkbookPageFallbackChain(7);
    expect(chain[0]).toBe("/cartilla/art/hd/workbook/page-007.png");
    expect(chain).toContain("/cartilla/art/hd/lineart/a-page-4.png");
    expect(chain).toContain("/cartilla/images/source/a/a-page-4.jpg");
  });
});
