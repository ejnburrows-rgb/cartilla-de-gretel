import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function flip(srcPath, outPath) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.translate(0, img.height);
  ctx.scale(1, -1);
  ctx.drawImage(img, 0, 0);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}
await flip("scratch/book-inspect/badge-4.png", "scratch/book-inspect/badge-4-flip.png");
console.log("done");
