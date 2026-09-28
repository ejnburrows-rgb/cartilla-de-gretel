import { describe, expect, it } from "vitest";
import {
  getBookPageImage,
  getLineartPathFromSource,
  getRestoredPageImage,
  getWorkbookPageFallbackChain,
} from "@/lib/bookImages";

describe("bookImages repository-controlled fallback chain", () => {
  it("resolves stable repository source pages", () => {
    expect(getBookPageImage(4)).toBe("/cartilla/art/source/workbook/page-004.jpg");
    expect(getBookPageImage(90)).toBe("/cartilla/art/source/workbook/page-090.jpg");
    expect(getBookPageImage(999)).toBeNull();
  });

  it("does not advertise retired restored or inferred lineart assets", () => {
    expect(getRestoredPageImage(1)).toBeNull();
    expect(getLineartPathFromSource("cartilla/images/source/a/a-page-4.jpg")).toBeNull();
    expect(getLineartPathFromSource("/cartilla/art/hd/lineart/a-page-4.png")).toBe(
      "/cartilla/art/hd/lineart/a-page-4.png",
    );
  });

  it("starts with the self-contained canonical source and keeps an explicit source reference as fallback", () => {
    const chain = getWorkbookPageFallbackChain(4, "cartilla/images/source/a/a-page-4.jpg");
    expect(chain[0]).toBe("/cartilla/art/source/workbook/page-004.jpg");
    expect(chain).toContain("/cartilla/images/source/a/a-page-4.jpg");
    expect(chain.some((path) => path.includes("/restored/"))).toBe(false);
    expect(chain.some((path) => path.includes("/hd/workbook/"))).toBe(false);
  });

  it("uses repository source without requiring a legacy catalog image", () => {
    const chain = getWorkbookPageFallbackChain(86);
    expect(chain[0]).toBe("/cartilla/art/source/workbook/page-086.jpg");
  });
});
