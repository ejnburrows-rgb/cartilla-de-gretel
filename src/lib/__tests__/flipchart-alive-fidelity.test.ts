import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLivingActor } from "../living-actor-registry";

// The Flip Chart moving pictures must carry the sheet picture unchanged: each
// -alive.svg embeds the sheet PNG's exact bytes, placed at its own size at the
// origin, so the moving parts sit exactly where the drawing has them.
const ROOT = resolve(__dirname, "../../..");
const FC = "/cartilla/art/optimized/flipchart-native";
const PICTURES = [
  "p004-oso",
  "p004-oveja",
  "p004-olla",
  "p006-elefante",
  "p007-iman",
  "p015-sopa",
  "p024-lala",
  "p008-unicornio",
];

describe("Flip Chart moving pictures keep the sheet drawing", () => {
  for (const name of PICTURES) {
    it(`${name}: embeds the sheet picture byte-for-byte at its own size`, () => {
      const src = `${FC}/${name}.png`;
      const actor = getLivingActor(src);
      expect(actor?.aliveSrc).toBe(`${FC}/${name}-alive.svg`);
      const still = readFileSync(resolve(ROOT, `public${src}`));
      const svg = readFileSync(resolve(ROOT, `public${actor!.aliveSrc}`), "utf8");
      expect(svg).toContain(`data:image/png;base64,${still.toString("base64")}`);
      const w = still.readUInt32BE(16);
      const h = still.readUInt32BE(20);
      expect(svg).toMatch(new RegExp(`viewBox="0 0 ${w} ${h}"`));
      expect(svg).toMatch(new RegExp(`<image[^>]*x="0" y="0" width="${w}" height="${h}"`));
    });
  }

  it("keeps the differently cropped Lámina 3 olla and imán still", () => {
    expect(getLivingActor(`${FC}/p003-olla.png`)).toBeNull();
    expect(getLivingActor(`${FC}/p003-iman.png`)).toBeNull();
  });
});
