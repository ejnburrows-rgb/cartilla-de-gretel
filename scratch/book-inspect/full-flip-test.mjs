import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function flip(srcPath, outPath, maxW = 1400) {
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
await flip("public/cartilla/art/color/workbook/page-004.png", "scratch/book-inspect/full4-flip.png");
console.log("done");
