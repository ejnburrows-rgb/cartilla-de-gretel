import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLivingActor } from "../living-actor-registry";

// The Workbook vowel-review moving pictures must carry the approved faithful
// drawing unchanged: each -alive.svg embeds the still picture's exact bytes, and
// its size matches the still so the moving parts sit where the drawing has them.
const ROOT = resolve(__dirname, "../../..");
const PICTURES = [
  "vocal-o/oso",
  "vocal-o/oveja",
  // vocal-o/olla: the redrawn pot (PR #888) has no steam, so it has no rig and stays still.
  "vocal-e/elefante",
  // vocal-a/avion: the redrawn jet (PR #888) has no propeller and is painted on its
  // own blue sky, so nothing can move without moving scenery; it stays still.
  "vocal-a/abeja",
  "vocal-a/abanico",
  "vocal-i/iman",
];

function webpSize(buf: Buffer) {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
}

describe("Workbook vowel-review moving pictures keep the approved drawing", () => {
  for (const name of PICTURES) {
    it(`${name}: embeds the faithful still byte-for-byte at its own size`, () => {
      const src = `/cartilla/art/faithful/${name}.webp`;
      const actor = getLivingActor(src);
      expect(actor?.aliveSrc).toBe(`/cartilla/art/faithful/${name}-alive.svg`);
      const still = readFileSync(resolve(ROOT, `public${src}`));
      const svg = readFileSync(resolve(ROOT, `public${actor!.aliveSrc}`), "utf8");
      expect(svg).toContain(`data:image/webp;base64,${still.toString("base64")}`);
      const [w, h] = webpSize(still);
      const view =
        svg
          .match(/viewBox="([-\d. ]+)"/)?.[1]
          .split(" ")
          .map(Number) ?? [];
      // The picture is never redrawn: it is placed at its own size inside the
      // SVG (avión gets room for its streaks, so its box may be larger).
      expect(new RegExp(`<image[^>]*width="${w}"[^>]*height="${h}"`).test(svg)).toBe(true);
      expect(view[2]).toBeGreaterThanOrEqual(w);
      expect(view[3]).toBeGreaterThanOrEqual(h);
    });
  }
});
