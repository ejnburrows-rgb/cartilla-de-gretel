import { describe, expect, it } from "vitest";
import { getReplicaSheet, hasReplicaSheet, replicaReadingOrder } from "@/lib/flipchart-replica";
import { getNativeFlipchartPage } from "@/lib/flipchart-native";

// Source scans: public/cartilla/art/hd/flipchart/page-{010,016,019}.jpg.
// These are PDF/source indexes (printed pages 8, 14, 17), not printed numbers.
const drills = [
  { page: 10, top: ["ma", "me", "mi", "mo", "mu"], bottom: ["mu", "mo", "ma", "me", "mi"] },
  { page: 16, top: ["sa", "se", "si", "so", "su"], bottom: ["su", "so", "sa", "se", "si"] },
  { page: 19, top: ["ta", "te", "ti", "to", "tu"], bottom: ["tu", "to", "ta", "te", "ti"] },
];

describe("#715 active source-equivalent Flip Chart reading order", () => {
  it.each(drills)(
    "proves native layout keeps source reading order for tilted rows on sheet $page",
    ({ page, top, bottom }) => {
      const native = getNativeFlipchartPage(page);
      expect(native?.syllables).toEqual([...top, ...bottom]);
    },
  );

  it.each(drills)(
    "preserves both source rows in the active replica for sheet $page",
    ({ page, top, bottom }) => {
      expect(hasReplicaSheet(page)).toBe(true);
      const sheet = getReplicaSheet(page)!;
      const syllables = replicaReadingOrder(sheet).flatMap((item) =>
        item.kind === "token" && item.token.kind === "syllable" ? [item.token] : [],
      );
      expect(syllables.map((token) => token.text.trim())).toEqual([...top, ...bottom]);
      for (const row of [syllables.slice(0, 5), syllables.slice(5)]) {
        expect(new Set(row.map((token) => token.panel)).size).toBe(1);
        expect(row.every((token, index) => index === 0 || token.x > row[index - 1]!.x)).toBe(true);
        expect(new Set(row.map((token) => token.base)).size).toBe(1);
      }
      expect(syllables[5]!.y).toBeGreaterThan(
        Math.max(...syllables.slice(0, 5).map((token) => token.y)),
      );
    },
  );

  it("keeps sheet 10's centered conjunction separate from its 15 source-positioned words", () => {
    const sheet = getReplicaSheet(10)!;
    const words = sheet.tokens.filter((token) => token.kind === "word");
    expect(words.map((token) => token.text.trim())).toEqual([
      "mamá",
      "mami",
      "Mimo",
      "mío",
      "me",
      "mímame",
      "Meme",
      "ama",
      "mía",
      "Mumi",
      "Memo",
      "mima",
      "amo",
      "Mimí",
      "ámame",
    ]);
    const bridges = sheet.tokens.filter((token) => token.text.trim() === "y");
    expect(bridges).toHaveLength(1);
    const bridge = bridges[0]!;
    expect(bridge.kind).toBe("chip");
    expect(bridge.align).toBe("center");
    const panel = sheet.panels.find((candidate) => candidate.id === bridge.panel)!;
    expect(panel).toBeDefined();
    expect(bridge.x + bridge.w / 2).toBeCloseTo(panel.x + panel.w / 2, 8);
    expect(bridge.x + bridge.w / 2).toBeCloseTo(sheet.width / 2, 0);
    expect(bridge.y).toBeGreaterThan(Math.max(...words.map((token) => token.y + token.h)));
    const prose = sheet.tokens.filter((token) => token.kind === "verse");
    expect(bridge.y + bridge.h).toBeLessThan(Math.min(...prose.map((token) => token.y)));
    expect(prose.map((token) => token.text.trim())).toEqual([
      "Mi mamá me ama.",
      "Amo a mami. Mamá mía.",
      "Mamá ama a Meme y a Mimí.",
      "Memo ama a Mumi.",
      "Mamá mía ámame. Mímame a mí.",
      "Mi mamá me mima.",
    ]);
  });
});

// Exact source scan stanza boundaries and literal wording, checked 2026-10-23.
describe("#715 source-confirmed residual details", () => {
  it.each([
    [29, "Nada, nada mi patito"],
    [47, "–Gatita gordita"],
  ] as const)("preserves source stanza boundary on sheet %i", (page, start) => {
    const verse = getReplicaSheet(page)!.tokens.filter((t) => t.kind === "verse");
    const i = verse.findIndex((t) => t.text.trim() === start);
    expect(i).toBeGreaterThan(0);
    const regular = verse[1]!.base - verse[0]!.base;
    expect(verse[i]!.base - verse[i - 1]!.base).toBeGreaterThan(regular * 1.2);
  });
  it("preserves the final period on 44 and existing accented zepelín on 60/61", () => {
    expect(getReplicaSheet(44)!.tokens.some((t) => t.text.trim() === "arrebatado.")).toBe(true);
    expect(getReplicaSheet(60)!.tokens.some((t) => t.text.trim() === "zepelín")).toBe(true);
    expect(getReplicaSheet(61)!.tokens.some((t) => t.text.trim() === "zepelín")).toBe(true);
  });
});
