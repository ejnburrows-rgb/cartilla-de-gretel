import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Workbook lane B (2026-10-19/20): lessons 8, 9, 10, 11, 12, 13, 14, 15, 17 and
 * 18 ship lesson-local
 * fit and fill styles. Invariants guarded here:
 *  1. Every rule in a lesson-<N>-local.css file is scoped to that lesson's own
 *     printed pages (data-lesson on the shell + page-<printed>- activity id),
 *     so loading the files globally can never restyle another lesson.
 *  2. The lane-B fill rule covers exactly lessons 8, 9, 10, 11, 12, 13, 14, 15,
 *     17, 18 (16 is the reference lesson owned by main).
 *  3. The lesson-local index imports the lane-B files.
 */
const LESSON_PAGES: Record<number, number[]> = {
  8: [23, 24, 25, 26],
  9: [27, 28, 29, 30],
  10: [31, 32, 33, 34],
  11: [35, 36, 37, 38],
  12: [39, 40, 41, 42],
  14: [47, 48, 49, 50],
  13: [43, 44, 45, 46],
  15: [51, 52, 53, 54],
  17: [59, 60, 61, 62],
  18: [63, 64, 65, 66],
};

const stylesDir = join(__dirname, "../../../styles/lesson-local");

describe("lesson-local fit styles (lane B)", () => {
  for (const [lessonText, pages] of Object.entries(LESSON_PAGES)) {
    const lesson = Number(lessonText);
    const file = join(stylesDir, `lesson-${lesson}-local.css`);

    it(`lesson ${lesson}: file exists and is non-empty`, () => {
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file, "utf8").length).toBeGreaterThan(200);
    });

    it(`lesson ${lesson}: every page selector stays inside its printed pages`, () => {
      const css = readFileSync(file, "utf8");
      const referenced = [...css.matchAll(/page-(\d+)-/g)].map((m) => Number(m[1]));
      expect(referenced.length).toBeGreaterThan(0);
      for (const p of referenced) {
        expect(pages).toContain(p);
      }
    });

    it(`lesson ${lesson}: rules are scoped to this lesson via data-lesson`, () => {
      const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      const selectors = css
        .split("}")
        .flatMap((chunk) => chunk.split("{")[0].split(","))
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("@") && s.includes("."));
      for (const sel of selectors) {
        expect(sel).toContain(`.lc-lesson-shell--fit[data-lesson="${lesson}"]`);
        expect(sel).toContain("data-gretel-activity");
      }
    });
  }

  it("lane-B fill rule covers exactly the lane-B lessons", () => {
    const css = readFileSync(join(stylesDir, "workbook-fill-lane-b.css"), "utf8");
    const scoped = [...css.matchAll(/data-lesson="(\d+)"/g)].map((m) => Number(m[1]));
    expect([...new Set(scoped)].sort((a, b) => a - b)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 17, 18]);
  });

  it("lesson-local index imports the lane-B files", () => {
    const index = readFileSync(join(stylesDir, "index.css"), "utf8");
    const imports = [...index.matchAll(/lesson-(\d+)-local\.css/g)].map((m) => Number(m[1]));
    expect(imports.sort((a, b) => a - b)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 17, 18]);
    expect(index).toContain("workbook-fill-lane-b.css");
  });
});
