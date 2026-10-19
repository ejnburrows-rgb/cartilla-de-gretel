import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const pages = [[19,67,69],[20,71],[21,75,77],[22,79,81],[23,83,85],[24,89]];
describe("lessons 19-24 local workbook repairs", () => {
  for (const [lesson,...allowed] of pages) {
    it(`lesson ${lesson} only selects its own verified printed pages`, () => {
      const css = readFileSync(`src/styles/lesson-local/lesson-${lesson}-local.css`, "utf8");
      const referenced = [...css.matchAll(/page-(\d+)-/g)].map(m => Number(m[1]));
      expect(referenced.length).toBeGreaterThan(0);
      expect(referenced.every(p => allowed.includes(p))).toBe(true);
      expect(css).not.toMatch(/page-(86|87)-/);
    });
  }
});
