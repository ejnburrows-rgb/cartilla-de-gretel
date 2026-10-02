import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pageLayouts from "@/data/page-layouts.json";
import type { PageRegion } from "@/lib/book-faithful";

const root = process.cwd();
const pilot = pageLayouts.pages["2"];
const regions = pilot.regions as PageRegion[];

describe("faithful digital workbook pages", () => {
  it("uses retained book-derived art for every page-2 picture", () => {
    const grid = regions.find((region) => region.id === "p2-rows");
    expect(grid?.vowelRows).toHaveLength(5);
    expect(grid?.gridColumnFracs?.reduce((sum, fraction) => sum + fraction, 0)).toBeCloseTo(1, 4);
    expect(grid?.gridRowFracs?.reduce((sum, fraction) => sum + fraction, 0)).toBeCloseTo(1, 4);
    for (const row of grid?.vowelRows ?? []) {
      expect(row.cells).toHaveLength(3);
      for (const cell of row.cells) {
        expect(cell.illustrationSrc).toMatch(/^\/cartilla\/art\/faithful\//);
        expect(existsSync(join(root, "public", cell.illustrationSrc!.slice(1)))).toBe(true);
      }
    }
  });

  it("keeps complete fixed geometry and exact printed instructions", () => {
    expect(pilot.digitalStatus).toBe("verified");
    const instruction = regions.find((region) => region.id === "p2-instr");
    expect(instruction?.text).toBe("Circula el dibujo que comienza con la vocal del recuadro.");
    expect(instruction?.label).toBe("Instrucciones:");
    for (const region of regions) {
      expect(region.x).toBeGreaterThanOrEqual(0);
      expect(region.y).toBeGreaterThanOrEqual(0);
      expect(region.width).toBeGreaterThan(0);
      expect(region.height).toBeGreaterThan(0);
      expect(region.x! + region.width!).toBeLessThanOrEqual(1.00001);
      expect(region.y! + region.height!).toBeLessThanOrEqual(1.00001);
    }
  });

  it("uses retained faithful art on page 1 instead of deleted digital crops", () => {
    const next = pageLayouts.pages["1"];
    const grid = (next.regions as PageRegion[]).find((region) => region.id === "p1-grid");
    expect(grid?.cells).toHaveLength(20);
    for (const cell of grid?.cells ?? []) {
      expect(cell.illustrationSrc).toMatch(/^\/cartilla\/art\/faithful\//);
      expect(existsSync(join(root, "public", cell.illustrationSrc!.slice(1)))).toBe(true);
    }
    expect(next).not.toHaveProperty("referenceImage");
  });
});
