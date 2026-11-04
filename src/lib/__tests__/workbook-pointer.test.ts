import { afterEach, describe, expect, it, vi } from "vitest";
import { animateWorkbookPointer, eraserTravelPoint, getWorkbookPointer, graphiteWidth, hoverWorkbookPointer, pencilProgress, screenPointOnPath } from "../workbook-pointer";

afterEach(() => { vi.useRealTimers(); hoverWorkbookPointer(0, 0, false); });

describe("shared viewport pencil", () => {
  it("keeps the graphite hotspot at the actual pointer coordinates", () => {
    hoverWorkbookPointer(123, 456, true);
    expect(getWorkbookPointer()).toMatchObject({ x: 123, y: 456, visible: true, eraser: false });
  });
  it("modulates stroke width by measured speed within the owner's range", () => {
    expect(graphiteWidth(0)).toBe(6.4);
    expect(graphiteWidth(100)).toBe(3.3);
    expect(graphiteWidth(0.25)).toBeGreaterThan(graphiteWidth(1));
  });
  it("uses the same easing endpoints and midpoint as the revealed SVG ink", () => {
    expect(pencilProgress(0)).toBeCloseTo(0, 4);
    expect(pencilProgress(1)).toBeCloseTo(1, 4);
    expect(pencilProgress(0.5)).toBeCloseTo(0.5, 4);
  });
  it("transforms the path point through the current page zoom/viewport matrix", () => {
    const path = { getTotalLength: () => 100, getPointAtLength: (n: number) => ({ x: n, y: 10 }),
      getScreenCTM: () => ({ a: 2, b: 0, c: 0, d: 2, e: 50, f: 75 }) } as unknown as SVGPathElement;
    expect(screenPointOnPath(path, 0.5)).toEqual({ x: 150, y: 95 });
  });
  it("moves the eraser from offscreen, backward with the disappearing ink, then offscreen", () => {
    const start = { x: 80, y: 100 };
    const end = { x: 280, y: 220 };
    const point = (at: number) => eraserTravelPoint(start, end, at, 390, 0.2, 0.2);
    expect(point(0).x).toBeGreaterThan(390);
    expect(point(0.2)).toEqual(end);
    expect(point(0.5).x).toBeCloseTo(180, 5);
    expect(point(0.5).y).toBeCloseTo(160, 5);
    expect(point(0.8)).toEqual(start);
    expect(point(1).x).toBeGreaterThan(390);
  });
  it("returns the same tool to current hover and prevents a cancelled animation from overriding a new one", () => {
    vi.useFakeTimers();
    hoverWorkbookPointer(20, 30, true);
    const cancel = animateWorkbookPointer(() => ({ x: 100, y: 100 }), 2000);
    vi.advanceTimersByTime(1000);
    expect(getWorkbookPointer()).toMatchObject({ x: 100, y: 100, eraser: false });
    cancel();
    const stopEraser = animateWorkbookPointer(() => ({ x: 200, y: 200 }), 1000, true);
    vi.advanceTimersByTime(200);
    expect(getWorkbookPointer()).toMatchObject({ x: 200, y: 200, eraser: true });
    hoverWorkbookPointer(300, 400, true);
    expect(getWorkbookPointer().x).toBe(200);
    stopEraser(); vi.advanceTimersByTime(200);
    expect(getWorkbookPointer()).toMatchObject({ x: 300, y: 400, eraser: false });
  });
});
