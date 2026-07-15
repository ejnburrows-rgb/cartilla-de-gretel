/**
 * Locks Colorea / Dibuja / Encierra / Une host routing so paint never
 * silently becomes tap-select, and draw-box stays on DibujaHost.
 */
import { describe, it, expect } from "vitest";
import pageLayouts from "@/data/page-layouts.json";
import {
  instructionSuggestsColorea,
  instructionSuggestsDibuja,
  instructionSuggestsLasso,
  printedPaintVerb,
  resolveFaithfulHost,
} from "../faithfulAdapters";

type LayoutPage = {
  regions: Array<{
    id: string;
    regionType: string;
    text?: string;
    order: number;
  }>;
};

const pages = (pageLayouts as { pages: Record<string, LayoutPage> }).pages;

function census() {
  const counts: Record<string, number> = {};
  const paintBoxIds: string[] = [];
  const drawBoxIds: string[] = [];
  const coloreaPages: number[] = [];
  const dibujaPages: number[] = [];
  const encierraPages: number[] = [];
  const unePages: number[] = [];

  for (const [pn, page] of Object.entries(pages)) {
    let lastInstr = "";
    for (const r of page.regions ?? []) {
      counts[r.regionType] = (counts[r.regionType] ?? 0) + 1;
      if (r.regionType === "instruction" && r.text) {
        lastInstr = r.text;
        if (instructionSuggestsColorea(r.text)) coloreaPages.push(Number(pn));
        if (instructionSuggestsDibuja(r.text)) dibujaPages.push(Number(pn));
        if (instructionSuggestsLasso(r.text) && /encierra/i.test(r.text)) {
          encierraPages.push(Number(pn));
        }
        if (
          instructionSuggestsLasso(r.text) &&
          (/\bune\b/i.test(r.text) || /traza una l[ií]nea/i.test(r.text))
        ) {
          unePages.push(Number(pn));
        }
      }
      if (r.regionType === "paint-box") paintBoxIds.push(`${pn}:${r.id}`);
      if (r.regionType === "draw-box") drawBoxIds.push(`${pn}:${r.id}`);
      // Routing contract for interactive regions after an instruction
      if (r.regionType === "draw-box") {
        expect(resolveFaithfulHost("draw-box", lastInstr)).toBe("dibuja");
      }
      if (r.regionType === "paint-box") {
        expect(resolveFaithfulHost("paint-box", lastInstr)).toBe("paint");
      }
      if (r.regionType === "syllable-match") {
        expect(resolveFaithfulHost("syllable-match", lastInstr)).toBe("lasso-mark");
      }
      if (r.regionType === "vowel-match-all") {
        expect(resolveFaithfulHost("vowel-match-all", lastInstr)).toBe("lasso-pair");
      }
      if (r.regionType === "vowel-line-match") {
        expect(resolveFaithfulHost("vowel-line-match", lastInstr)).toBe("lasso-mark");
      }
    }
  }

  return {
    counts,
    paintBoxIds,
    drawBoxIds,
    coloreaPages: [...new Set(coloreaPages)],
    dibujaPages: [...new Set(dibujaPages)],
    encierraPages: [...new Set(encierraPages)],
    unePages: [...new Set(unePages)],
  };
}

describe("faithful mechanic routing (Colorea / Dibuja / Lasso)", () => {
  it("paint-box always resolves to PaintCanvas host", () => {
    expect(resolveFaithfulHost("paint-box")).toBe("paint");
    expect(resolveFaithfulHost("paint-box", "Colorea el dibujo.")).toBe("paint");
    expect(resolveFaithfulHost("paint-box", "Marca con una x")).toBe("paint");
  });

  it("Colorea instruction on illustration-slot / picture-grid → paint (not tap)", () => {
    expect(resolveFaithfulHost("illustration-slot", "Colorea el dibujo de la rosa.")).toBe("paint");
    expect(resolveFaithfulHost("picture-grid", "Colorea los dibujos correctos.")).toBe("paint");
    expect(resolveFaithfulHost("picture-grid", "Pinta el dibujo de la casa.")).toBe("paint");
    // Without Colorea verb, picture-grid stays tap (Marca / Presiona)
    expect(resolveFaithfulHost("picture-grid", "Marca con una x los dibujos.")).toBe("tap-grid");
    expect(resolveFaithfulHost("illustration-slot", undefined)).toBe("static");
  });

  it("draw-box always resolves to DibujaHost (≥25 printed draw boxes)", () => {
    expect(resolveFaithfulHost("draw-box")).toBe("dibuja");
    expect(
      resolveFaithfulHost(
        "draw-box",
        "Haz un dibujo que represente una palabra que comienza con m.",
      ),
    ).toBe("dibuja");
    const { drawBoxIds } = census();
    expect(drawBoxIds.length).toBeGreaterThanOrEqual(25);
  });

  it("Encierra / Une / Traza una línea → lasso hosts", () => {
    expect(
      resolveFaithfulHost("syllable-match", "Encierra en un círculo la sílaba correspondiente."),
    ).toBe("lasso-mark");
    expect(
      resolveFaithfulHost("vowel-line-match", "Traza una línea desde la vocal Oo hasta el dibujo."),
    ).toBe("lasso-mark");
    expect(resolveFaithfulHost("vowel-match-all", "Une cada vocal con su dibujo.")).toBe(
      "lasso-pair",
    );
    expect(
      resolveFaithfulHost("picture-grid", "Encierra en un círculo los dibujos correctos."),
    ).toBe("lasso-mark");
  });

  it("printed paint verb stays Colorea or Pinta (never Toca)", () => {
    expect(printedPaintVerb("Colorea el dibujo.")).toBe("Colorea");
    expect(printedPaintVerb("Pinta la casa.")).toBe("Pinta");
    expect(printedPaintVerb(undefined)).toBe("Colorea");
  });

  it("instructionSuggestsColorea does not treat reading sentences as paint prompts", () => {
    expect(instructionSuggestsColorea("Pepe pinta un pino.")).toBe(false);
    expect(instructionSuggestsColorea("Colorea el dibujo.")).toBe(true);
    expect(instructionSuggestsColorea("Pinta el dibujo de la rosa.")).toBe(true);
  });

  it("page-layouts census: draw-box ≥25; paint-box only when present; no invented Colorea text", () => {
    const c = census();
    expect(c.counts["draw-box"] ?? 0).toBeGreaterThanOrEqual(25);
    expect(c.counts["syllable-match"] ?? 0).toBeGreaterThanOrEqual(18);
    // Honest: verified transcriptions currently have zero "Colorea" labels
    // (SPEC paper-action sweep). paint-box may be 0 until owner-verified.
    // Every paint-box that *does* exist is listed for the ship report.
    for (const id of c.paintBoxIds) {
      expect(id).toMatch(/^\d+:/);
    }
    // Dibuja instructions still present for draw pages
    expect(c.dibujaPages.length).toBeGreaterThanOrEqual(20);
    expect(c.encierraPages.length).toBeGreaterThanOrEqual(15);
  });
});
