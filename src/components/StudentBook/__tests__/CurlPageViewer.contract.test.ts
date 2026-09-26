import { describe, expect, it } from "vitest";
import {
  PRINTED_PAGE_HEIGHT,
  PRINTED_PAGE_WIDTH,
  SINGLE_PAGE_ASPECT_RATIO,
  SPREAD_ASPECT_RATIO,
  SPREAD_BREAKPOINT_PX,
  clampPageIndex,
  expectedTurnIndex,
  logicalPageIndex,
  resolveTurnIndex,
  visiblePageLabel,
} from "../CurlPageViewer";

describe("CurlPageViewer physical contracts", () => {
  it("uses the verified 612 × 792 printed trim for single pages and spreads", () => {
    expect(PRINTED_PAGE_WIDTH).toBe(612);
    expect(PRINTED_PAGE_HEIGHT).toBe(792);
    expect(SINGLE_PAGE_ASPECT_RATIO).toBe("612 / 792");
    expect(SPREAD_ASPECT_RATIO).toBe("1224 / 792");
  });

  it("keeps the responsive spread threshold explicit", () => {
    expect(SPREAD_BREAKPOINT_PX).toBe(760);
  });

  it("clamps stale saved progress to a real page", () => {
    expect(clampPageIndex(-4, 4)).toBe(0);
    expect(clampPageIndex(99, 4)).toBe(3);
    expect(clampPageIndex(2, 4)).toBe(2);
    expect(clampPageIndex(1, 0)).toBe(0);
  });

  it("calculates deterministic fallback targets for page turns", () => {
    expect(expectedTurnIndex(0, 4, false, "next")).toBe(1);
    expect(expectedTurnIndex(1, 4, false, "prev")).toBe(0);
    expect(expectedTurnIndex(0, 4, true, "next")).toBe(2);
    expect(expectedTurnIndex(2, 4, true, "prev")).toBe(0);
    expect(expectedTurnIndex(3, 4, true, "next")).toBe(2);
    expect(expectedTurnIndex(1, 6, true, "next")).toBe(2);
    expect(expectedTurnIndex(3, 6, true, "prev")).toBe(0);
    expect(expectedTurnIndex(4, 5, true, "next")).toBe(4);
  });

  it("normalizes odd event indices to logical spread boundaries", () => {
    expect(logicalPageIndex(1, 6, true)).toBe(0);
    expect(logicalPageIndex(3, 6, true)).toBe(2);
    expect(logicalPageIndex(5, 6, true)).toBe(4);
    expect(logicalPageIndex(3, 4, false)).toBe(3);
  });

  it("keeps an explicit navigation destination authoritative over stale flip events", () => {
    expect(resolveTurnIndex(0, 2, 6, true)).toBe(2);
    expect(resolveTurnIndex(1, 0, 6, true)).toBe(0);
    expect(resolveTurnIndex(3, null, 6, true)).toBe(2);
    expect(resolveTurnIndex(99, null, 5, false)).toBe(4);
  });

  it("describes one visible page on portrait screens", () => {
    expect(visiblePageLabel(1, 4, false)).toBe("Página 2 de 4");
  });

  it("describes both visible leaves in a desktop spread", () => {
    expect(visiblePageLabel(0, 4, true)).toBe("Páginas 1–2 de 4");
    expect(visiblePageLabel(2, 4, true)).toBe("Páginas 3–4 de 4");
    expect(visiblePageLabel(4, 5, true)).toBe("Página 5 de 5");
    expect(visiblePageLabel(3, 6, true)).toBe("Páginas 3–4 de 6");
  });
});
