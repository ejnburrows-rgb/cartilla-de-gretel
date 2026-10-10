import { describe, expect, it } from "vitest";
import pageOneArt from "@/data/workbook-page1-art.json";
import { getPageLayout, type PageRegion } from "@/lib/book-faithful";
import { approvedWorkbookRegions } from "@/lib/workbook-approved-art";

function imageSlots(regions: readonly PageRegion[]) {
  const slots: Array<{ caption: string | undefined; src: string | undefined }> = [];
  for (const region of regions) {
    if (region.illustrationSrc) slots.push({ caption: region.caption, src: region.illustrationSrc });
    for (const cell of region.cells ?? []) slots.push({ caption: cell.caption, src: cell.illustrationSrc });
    for (const row of region.vowelRows ?? [])
      for (const cell of row.cells) slots.push({ caption: cell.caption, src: cell.illustrationSrc });
    for (const pair of region.vowelPairs ?? []) slots.push({ caption: pair.caption, src: pair.illustrationSrc });
    for (const row of region.matchRows ?? [])
      for (const word of row) if (word.illustrationSrc) slots.push({ caption: word.word, src: word.illustrationSrc });
    for (const item of region.fillItems ?? []) if (item.illustrationSrc) slots.push({ caption: item.wordBox, src: item.illustrationSrc });
  }
  return slots;
}

describe("Student Workbook: final owner-art slots", () => {
  it("retains each of the 20 recorded owner-approved Page 1 pictures, in its exact original slot", () => {
    const original = getPageLayout(1) ?? [];
    const filtered = approvedWorkbookRegions(1, original);
    const expected = new Set(pageOneArt.ownerColor.map((item) => `${item.word}|${item.src}`));
    const cells = filtered.find((region) => region.regionType === "picture-grid")?.cells ?? [];
    expect(cells).toHaveLength(20);
    expect(cells.every((cell) => expected.has(`${cell.caption}|${cell.illustrationSrc}`))).toBe(true);
    expect(cells.every((cell) => Boolean(cell.illustrationSrc))).toBe(true);
  });

  it("never treats an approved illustration as approval for a different workbook page", () => {
    const original = getPageLayout(4) ?? [];
    const filtered = approvedWorkbookRegions(4, original);
    expect(imageSlots(filtered).every((slot) => slot.src === undefined)).toBe(true);
    expect(imageSlots(filtered).length).toBeGreaterThan(0);
  });

  it("does not substitute an image when an approved caption is paired with a different file", () => {
    const original = getPageLayout(1) ?? [];
    const altered = original.map((region) =>
      region.regionType === "picture-grid"
        ? { ...region, cells: region.cells?.map((cell, index) =>
            index === 0 ? { ...cell, illustrationSrc: "/unapproved-other-picture.png" } : cell,
          ) }
        : region,
    );
    const cells = approvedWorkbookRegions(1, altered).find((region) => region.regionType === "picture-grid")?.cells ?? [];
    expect(cells[0]?.illustrationSrc).toBeUndefined();
  });

  it("leaves curriculum and exercise answers unchanged across all 90 pages", () => {
    for (let page = 1; page <= 90; page++) {
      const original = getPageLayout(page) ?? [];
      const filtered = approvedWorkbookRegions(page, original);
      expect(filtered.map((region) => region.regionType)).toEqual(original.map((region) => region.regionType));
      expect(filtered.map((region) => region.id)).toEqual(original.map((region) => region.id));
      for (let i = 0; i < original.length; i++) {
        expect(filtered[i]?.text).toEqual(original[i]?.text);
        expect(filtered[i]?.cells?.map((cell) => cell.correct)).toEqual(original[i]?.cells?.map((cell) => cell.correct));
      }
    }
  });

  it("keeps every nonapproved image slot empty (including nested interactive cells)", () => {
    for (let page = 2; page <= 90; page++) {
      const filtered = approvedWorkbookRegions(page, getPageLayout(page) ?? []);
      expect(imageSlots(filtered).every((slot) => !slot.src)).toBe(true);
    }
  });
});
