import { describe, expect, it } from "vitest";
import { curlEase, curlGeometry } from "@/lib/page-curl-geometry";

const area = (poly: [number, number][]) =>
  Math.abs(poly.reduce((s, [x, y], i) => {
    const [x2, y2] = poly[(i + 1) % poly.length];
    return s + x * y2 - x2 * y;
  }, 0)) / 2;

describe("PageCurl geometry (right-to-left paper curl)", () => {
  const W = 1000;
  const H = 700;

  it("starts flat and ends fully turned away", () => {
    expect(area(curlGeometry(W, H, 0).front)).toBeCloseTo(W * H, 0);
    expect(curlGeometry(W, H, 0).back.length).toBe(0);
    expect(curlGeometry(W, H, 1).front.length).toBe(0);
    expect(curlGeometry(W, H, 1).opacity).toBe(0);
  });

  it("lifts the bottom-right corner first", () => {
    const g = curlGeometry(W, H, 0.06);
    const maxX = (y: number) => Math.max(...g.front.filter((p) => Math.abs(p[1] - y) < 1e-6).map((p) => p[0]));
    // The flat part reaches farther right at the top than at the bottom.
    expect(maxX(0)).toBeGreaterThan(maxX(H));
  });

  it("sweeps from right to left as it progresses", () => {
    let last = Infinity;
    for (let p = 0.1; p <= 0.9; p += 0.1) {
      const a = area(curlGeometry(W, H, p).front);
      expect(a).toBeLessThan(last);
      last = a;
    }
  });

  it("eases in and out slowly", () => {
    expect(curlEase(0)).toBe(0);
    expect(curlEase(1)).toBe(1);
    expect(curlEase(0.1)).toBeLessThan(0.1);
    expect(curlEase(0.9)).toBeGreaterThan(0.9);
  });
});
