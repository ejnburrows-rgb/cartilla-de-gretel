import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function rot180(srcPath, outPath) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.translate(img.width, img.height);
  ctx.scale(-1, -1);
  ctx.drawImage(img, 0, 0);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}

for (const n of [4, 6, 8, 20]) {
  await rot180(`scratch/book-inspect/badge-${n}.png`, `scratch/book-inspect/badge-${n}-rot.png`);
}
console.log("done");
