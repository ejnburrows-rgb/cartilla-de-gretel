import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "public/cartilla/art/faithful";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const fp = path.join(d, e.name);
  if (e.isDirectory()) {
    if (e.name === "_originals" || e.name === "_needs-recrop") return [];
    return walk(fp);
  }
  return e.name.endsWith(".webp") ? [fp] : [];
});
const files = walk(ROOT).sort();
console.log("crops:", files.length);

const CELL = 240, LABEL_H = 26, COLS = 6, ROWS = 5;
const PER = COLS * ROWS;

for (let s = 0; s * PER < files.length; s++) {
  const batch = files.slice(s * PER, (s + 1) * PER);
  const composites = [];
  for (let i = 0; i < batch.length; i++) {
    const f = batch[i];
    const col = i % COLS, row = Math.floor(i / COLS);
    const img = await sharp(f).resize(CELL, CELL - LABEL_H, { fit: "contain", background: { r: 238, g: 238, b: 238, alpha: 1 } }).flatten({ background: "#eeeeee" }).png().toBuffer();
    const label = path.relative(ROOT, f).replace(".webp", "");
    const svg = Buffer.from(`<svg width="${CELL}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="18" font-size="13" fill="#fff" font-family="monospace">${label.slice(0, 30)}</text></svg>`);
    composites.push({ input: img, left: col * CELL, top: row * (CELL) });
    composites.push({ input: svg, left: col * CELL, top: row * CELL + (CELL - LABEL_H) });
  }
  const H = Math.ceil(batch.length / COLS) * CELL;
  await sharp({ create: { width: COLS * CELL, height: H, channels: 3, background: "#ffffff" } })
    .composite(composites).jpeg({ quality: 85 }).toFile(`/tmp/qa-sheets/sheet-${String(s).padStart(2, "0")}.jpg`);
  console.log("sheet", s, batch.length);
}
