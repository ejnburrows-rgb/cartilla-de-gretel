import { describe, expect, it } from "vitest";
import { getReplicaSheet, replicaReadingOrder } from "@/lib/flipchart-replica";

const read = (page: number) =>
  replicaReadingOrder(getReplicaSheet(page)!).map((item) => (item.kind === "art" ? `[${item.art.word}]` : item.token.text.trim()));

describe("Flip Chart replica reading order", () => {
  it("reads the lesson letter before the syllables that ring it", () => {
    const tokens = getReplicaSheet(9)!.tokens.map((t) => t.text.trim());
    expect(tokens.slice(0, 6)).toEqual(["Mm", "ma", "me", "mi", "mo", "mu"]);
    expect(getReplicaSheet(24)!.tokens.map((t) => t.text.trim()).slice(0, 6)).toEqual(["Ll", "la", "le", "li", "lo", "lu"]);
    for (let page = 3; page <= 62; page++) {
      const sheet = getReplicaSheet(page);
      const letter = sheet?.tokens.findIndex((t) => t.kind === "letter") ?? -1;
      if (letter >= 0) expect(letter, `sheet ${page}`).toBe(0);
    }
  });

  it("puts each picture next to its words instead of all pictures first", () => {
    const order = read(9);
    expect(order.indexOf("[mamá]")).toBeGreaterThan(order.indexOf("mu"));
    expect(order.indexOf("[mamá]")).toBeLessThan(order.indexOf("mamá"));
    expect(order.indexOf("[Meme]")).toBeGreaterThan(order.indexOf("mima"));
    expect(order.indexOf("[Meme]")).toBeLessThan(order.indexOf("Meme"));
  });

  it("keeps every picture and text exactly once", () => {
    for (let page = 3; page <= 62; page++) {
      const sheet = getReplicaSheet(page);
      if (!sheet) continue;
      const items = replicaReadingOrder(sheet);
      expect(items.filter((i) => i.kind === "art")).toHaveLength(sheet.art.length);
      expect(items.filter((i) => i.kind === "token").map((i) => (i.kind === "token" ? i.token.id : ""))).toEqual(sheet.tokens.map((t) => t.id));
    }
  });
});
