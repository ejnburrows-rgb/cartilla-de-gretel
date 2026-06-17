import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function flop(srcPath, outPath) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.translate(img.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}

for (const n of [3, 4, 5, 6, 7, 8, 20]) {
  await flop(`scratch/book-inspect/badge-${n}.png`, `scratch/book-inspect/badge-${n}-flop.png`);
}
console.log("done");
