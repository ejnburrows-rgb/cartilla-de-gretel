import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pageLayouts from "@/data/page-layouts.json";
import type { PageRegion } from "@/lib/book-faithful";

const root = process.cwd();
const pilot = pageLayouts.pages["2"];
const regions = pilot.regions as PageRegion[];

describe("verified born-digital pilot", () => {
  it("keeps the locked colored master unchanged and all 15 authentic crops present", () => {
    const reference = readFileSync(join(root, "public/cartilla/art/reconstructed/workbook/page-002.png"));
    expect(createHash("sha256").update(reference).digest("hex"))
      .toBe("f91ca5395e17b841aa8e955a0f0c6541aea3aa88303a8dcf6d24d7cd8fe0af14");
    const grid = regions.find((region) => region.id === "p2-rows");
    expect(grid?.vowelRows).toHaveLength(5);
    expect(grid?.gridColumnFracs?.reduce((sum, fraction) => sum + fraction, 0)).toBeCloseTo(1, 4);
    expect(grid?.gridRowFracs?.reduce((sum, fraction) => sum + fraction, 0)).toBeCloseTo(1, 4);
    for (const row of grid?.vowelRows ?? []) {
      expect(row.cells).toHaveLength(3);
      for (const cell of row.cells) {
        expect(cell.illustrationSrc).toBeTruthy();
        expect(existsSync(join(root, "public", cell.illustrationSrc!.slice(1)))).toBe(true);
      }
    }
  });

  it("has complete, in-bounds fixed geometry and exact printed instructions", () => {
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
    expect(pageLayouts.pages["1"]).not.toHaveProperty("digitalStatus", "verified");
  });

  it("keeps the next batch on its reference fallback until visual QA passes", () => {
    const next = pageLayouts.pages["1"];
    expect(next.digitalStatus).toBe("batch-pending-visual-qa");
    const reference = readFileSync(join(root, "public/cartilla/art/reconstructed/workbook/page-001.png"));
    expect(createHash("sha256").update(reference).digest("hex"))
      .toBe("7281d4a857611fb73b6e96ff657451048f7099e0b69244637f08d0033f4702a9");
    const grid = (next.regions as PageRegion[]).find((region) => region.id === "p1-grid");
    expect(grid?.cells).toHaveLength(20);
    for (const cell of grid?.cells ?? []) {
      expect(existsSync(join(root, "public", cell.illustrationSrc!.slice(1)))).toBe(true);
    }
  });
});
