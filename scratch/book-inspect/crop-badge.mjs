import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function cropBadge(srcPath, outPath) {
  const img = await loadImage(fs.readFileSync(srcPath));
  // top-right corner crop, full res
  const cw = Math.round(img.width * 0.28);
  const ch = Math.round(img.height * 0.08);
  const sx = img.width - cw;
  const sy = 0;
  const canvas = createCanvas(cw * 2, ch * 2);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, cw * 2, ch * 2);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath);
}

for (const n of [3, 4, 5, 6, 7, 8, 20]) {
  const p = `public/cartilla/art/color/workbook/page-${String(n).padStart(3,"0")}.png`;
  await cropBadge(p, `scratch/book-inspect/badge-${n}.png`);
}
