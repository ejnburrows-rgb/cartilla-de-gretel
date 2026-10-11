import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

/**
 * Regression guard against restoring the explicitly rejected live rope/lasso UI.
 * Older learner-storage key names are intentionally allowed, preserving progress.
 */
describe("owner-locked pencil-only Workbook runtime", () => {
  it("does not contain the deleted rope component", () => {
    expect(existsSync(resolve(process.cwd(), "src/cartilla/interactions/LassoConnect.tsx"))).toBe(false);
  });

  it("does not ship the retired rope markup or animation CSS", () => {
    const pictureGrid = source("src/components/cartilla/InteractivePageExercises.tsx");
    const styles = source("src/styles/interactive-exercises.css");
    const routes = source("src/cartilla/interactions/faithfulAdapters.tsx");
    expect(pictureGrid).not.toContain("fp-ix-cell__lasso");
    expect(styles).not.toContain(".fp-ix-cell__lasso");
    const pictureImageRule = styles.match(/\\.fp-ix-cell img\\s*\\{([^}]*)\\}/)?.[1] ?? "";
    expect(pictureImageRule).not.toMatch(/\\banimation\\s*:/);
    expect(routes).not.toContain("LassoConnect");
    expect(pictureGrid).toContain("<WorkbookPencilMark");
    expect(pictureGrid).toContain("markType={mark}");
  });

  it("keeps the real source-page printed X and routes to the shared pencil actor", () => {
    const layouts = JSON.parse(source("src/data/page-layouts.json")) as {
      pages: Record<string, { regions: Array<{ regionType: string; text?: string }> }>;
    };
    for (const printedPage of [4, 7, 10, 13, 16]) {
      const page = layouts.pages[String(printedPage)];
      expect(page?.regions.some(r => r.regionType === "instruction" && /marca con una x/i.test(r.text ?? ""))).toBe(true);
    }
    const renderer = source("src/components/cartilla/FaithfulPageRenderer.tsx");
    expect(renderer).toContain("pictureMarkFor(precedingInstruction)");
  });
});
