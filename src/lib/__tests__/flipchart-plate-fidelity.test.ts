import { describe, expect, it } from "vitest";
import { classifyLayoutType, getNativeFlipchartPage } from "@/lib/flipchart-native";

// Every Flip Chart picture plate must show exactly the pictures printed on
// that page of the book, in printed reading order, cropped from that page.
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zñ-]/g, "");

const plates: number[] = [];
for (let page = 3; page <= 62; page++) {
  const type = classifyLayoutType(page);
  if (type === "vowel-header" || type === "consonant-vocab") plates.push(page);
}

describe("Flip Chart picture plates match the printed book", () => {
  it("covers every vowel and consonant vocabulary plate", () => {
    expect(plates.length).toBe(24);
  });

  it.each(plates)("plate %i shows its own printed pictures, in order", (page) => {
    const native = getNativeFlipchartPage(page)!;
    const placed = [
      ...native.words.map((w) => ({ text: (w.lead ?? "") + (w.rest || w.parts.join("")), x: w.x, y: w.y })),
      ...native.body
        .filter((b) => b.y > 700)
        .flatMap((b) => b.text.split(/\s+/).map((text, i) => ({ text, x: b.x + i, y: b.y }))),
    ].filter((w) => norm(w.text).length > 1);
    // Reading order: rows top to bottom (same row within 60 units), then left to right.
    placed.sort((a, b) => (Math.abs(a.y - b.y) < 60 ? a.x - b.x : a.y - b.y));
    const printed = placed.map((w) => norm(w.text));
    const pictures = native.art.filter((a) => !a.word.startsWith("Ilustración"));
    expect(pictures.map((a) => norm(a.word))).toEqual(printed);
    const pad = String(page).padStart(3, "0");
    for (const art of native.art) expect(art.src).toContain(`/flipchart-native/p${pad}-`);
  });
});
