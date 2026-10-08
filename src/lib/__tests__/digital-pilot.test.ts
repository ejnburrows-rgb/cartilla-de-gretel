import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pageLayouts from "@/data/page-layouts.json";
import page1Art from "@/data/workbook-page1-art.json";
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

  it("uses the book's pictures on page 1: owner color art where it exists, printed drawings otherwise", () => {
    const next = pageLayouts.pages["1"];
    const grid = (next.regions as PageRegion[]).find((region) => region.id === "p1-grid");
    expect(grid?.cells).toHaveLength(20);
    const ownerColor = new Map(page1Art.ownerColor.map((entry) => [entry.src, entry]));
    const printed = new Map(page1Art.printedUntilColor.map((entry) => [entry.src, entry]));
    for (const cell of grid?.cells ?? []) {
      const src = cell.illustrationSrc!;
      expect(existsSync(join(root, "public", src.slice(1)))).toBe(true);
      const color = ownerColor.get(src);
      if (color) {
        // Display copy of the owner's optimized color image; the source stays byte-identical.
        const source = readFileSync(join(root, "public", color.source.slice(1)));
        expect(createHash("sha256").update(source).digest("hex")).toBe(color.sourceSha256);
        expect(color.source).toMatch(/^\/cartilla\/art\/optimized\/(?:flipchart-native|workbook\/leccion-1)\//);
        continue;
      }
      if (printed.has(src)) {
        expect(src).toMatch(/^\/cartilla\/art\/faithful\/leccion-1\/wb-p1\//);
        continue;
      }
      expect(src).toMatch(/^\/cartilla\/art\/faithful\//);
    }
    for (const entry of [...page1Art.ownerColor, ...page1Art.printedUntilColor]) {
      const displayPath = join(root, "public", entry.src.slice(1));
      if (entry.src.endsWith(".svg")) {
        // Legacy display wrappers embed exactly the recorded PNG pixels.
        const svg = readFileSync(displayPath, "utf8");
        const embedded = /href="data:image\/png;base64,([^"]+)"/.exec(svg)?.[1];
        expect(embedded, entry.src).toBeTruthy();
        expect(createHash("sha256").update(Buffer.from(embedded!, "base64")).digest("hex")).toBe(
          entry.embeddedPngSha256,
        );
      } else {
        // Owner-approved Page-1 PNGs are used directly and must stay byte-identical.
        const bytes = readFileSync(displayPath);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sourceSha256);
      }
    }
    const colorCells = (grid?.cells ?? []).filter((cell) => ownerColor.has(cell.illustrationSrc!));
    expect(colorCells).toHaveLength(20);
    expect(next).not.toHaveProperty("referenceImage");
  });
});
