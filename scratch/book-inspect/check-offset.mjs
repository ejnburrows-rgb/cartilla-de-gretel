import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function shrink(srcPath, outPath, maxW = 900) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const scale = maxW / img.width;
  const ow = Math.round(img.width * scale), oh = Math.round(img.height * scale);
  const canvas = createCanvas(ow, oh);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, ow, oh);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath);
}

for (const n of [4, 5, 6, 7, 8]) {
  const p = `public/cartilla/art/color/workbook/page-${String(n).padStart(3,"0")}.png`;
  await shrink(p, `scratch/book-inspect/check-${n}.png`);
}
