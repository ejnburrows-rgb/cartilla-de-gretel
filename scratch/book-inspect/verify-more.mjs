import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function flip(srcPath, outPath, maxW = 900) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const scale = maxW / img.width;
  const ow = Math.round(img.width * scale), oh = Math.round(img.height * scale);
  const canvas = createCanvas(ow, oh);
  const ctx = canvas.getContext("2d");
  ctx.translate(0, oh);
  ctx.scale(1, -1);
  ctx.drawImage(img, 0, 0, ow, oh);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}
for (const n of [1, 50, 92]) {
  const p = `public/cartilla/art/color/workbook/page-${String(n).padStart(3,"0")}.png`;
  await flip(p, `scratch/book-inspect/verify-${n}-flip.png`);
}
console.log("done");
