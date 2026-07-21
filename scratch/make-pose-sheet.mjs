import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const DIR = "public/cartilla/images/gretel/poses";
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".webp")).sort();
console.log("poses:", files.length, files.join(", "));
const CELL = 240, LABEL_H = 24, COLS = 6;
const comps = [];
for (let i = 0; i < files.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const img = await sharp(path.join(DIR, files[i])).resize(CELL, CELL - LABEL_H, { fit: "contain", background: "#dddddd" }).flatten({ background: "#dddddd" }).png().toBuffer();
  const svg = Buffer.from(`<svg width="${CELL}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="17" font-size="12" fill="#fff" font-family="monospace">${files[i].replace(".webp","")}</text></svg>`);
  comps.push({ input: img, left: col * CELL, top: row * CELL });
  comps.push({ input: svg, left: col * CELL, top: row * CELL + CELL - LABEL_H });
}
const H = Math.ceil(files.length / COLS) * CELL;
await sharp({ create: { width: COLS * CELL, height: H, channels: 3, background: "#fff" } }).composite(comps).jpeg({ quality: 88 }).toFile("/tmp/qa-sheets/poses.jpg");
console.log("done");
