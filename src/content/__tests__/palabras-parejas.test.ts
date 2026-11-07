import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import pageLayouts from "@/data/page-layouts.json";
import {
  PALABRAS_PAREJAS_LESSON,
  PALABRAS_PAREJAS_O,
  PALABRAS_PAREJAS_PAGE,
} from "../palabras-parejas";

type SourceCell = { caption?: string; illustrationSrc?: string; correct?: boolean };
type SourceRegion = { id?: string; exampleCaption?: string; cells?: SourceCell[] };
type SourcePage = { regions?: SourceRegion[] };

const PAGES = (pageLayouts as unknown as { pages: Record<string, SourcePage> }).pages;

/** Re-derive the page's word/picture cells from the verified Workbook source. */
function sourcePairsForPage(pageNumber: number) {
  const pairs: { word: string; imageUrl?: string }[] = [];
  for (const region of PAGES[String(pageNumber)]?.regions ?? []) {
    const example = region.exampleCaption?.trim();
    for (const cell of region.cells ?? []) {
      const word = cell.caption?.trim();
      if (!word || !cell.illustrationSrc || cell.correct !== true) continue;
      if (example && word === example) continue;
      pairs.push({ word, imageUrl: cell.illustrationSrc });
    }
  }
  return pairs;
}

describe("palabras-parejas content", () => {
  it("takes exactly five real word/picture pairs from printed Workbook page 5", () => {
    expect(PALABRAS_PAREJAS_PAGE).toBe(5);
    expect(PALABRAS_PAREJAS_LESSON).toBe(2);
    expect(PALABRAS_PAREJAS_O.words.map((word) => word.word)).toEqual([
      "oveja",
      "ojos",
      "oreja",
      "olla",
      "oso",
    ]);
    expect(PALABRAS_PAREJAS_O.words).toHaveLength(5);
  });

  it("matches the verified page-5 cells word for word and picture for picture", () => {
    expect(sourcePairsForPage(5)).toEqual(
      PALABRAS_PAREJAS_O.words.map((word) => ({
        word: word.word,
        imageUrl: word.imageUrl,
      })),
    );
  });

  it("never re-serves the book's pre-drawn example word", () => {
    expect(sourcePairsForPage(5).map((pair) => pair.word)).not.toContain("ola");
    expect(PALABRAS_PAREJAS_O.words.map((word) => word.word)).not.toContain("ola");
  });

  it("points every picture at an existing faithful asset in the repo", () => {
    for (const word of PALABRAS_PAREJAS_O.words) {
      expect(word.imageUrl).toMatch(/^\/cartilla\/art\/faithful\/.+\.webp$/);
      const asset = path.join(process.cwd(), "public", word.imageUrl!.replace(/^\//, ""));
      expect(existsSync(asset), `missing artwork: ${word.imageUrl}`).toBe(true);
    }
  });

  it("wires the game to the reusable 'unir-palabras' game archetype", () => {
    expect(PALABRAS_PAREJAS_O.type).toBe("unir-palabras");
    expect(PALABRAS_PAREJAS_O.id).toBe("parejas-palabras-o");
    expect(PALABRAS_PAREJAS_O.instructions.length).toBeGreaterThan(0);
  });
});
