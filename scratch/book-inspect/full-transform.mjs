import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function transform(srcPath, outPath, mode, maxW = 1400) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const scale = maxW / img.width;
  const ow = Math.round(img.width * scale), oh = Math.round(img.height * scale);
  const canvas = createCanvas(ow, oh);
  const ctx = canvas.getContext("2d");
  if (mode === "flop") { ctx.translate(ow, 0); ctx.scale(-1, 1); }
  else if (mode === "rot180") { ctx.translate(ow, oh); ctx.scale(-1, -1); }
  ctx.drawImage(img, 0, 0, ow, oh);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}

await transform("public/cartilla/art/color/workbook/page-004.png", "scratch/book-inspect/full4-flop.png", "flop");
await transform("public/cartilla/art/color/workbook/page-004.png", "scratch/book-inspect/full4-rot180.png", "rot180");
console.log("done");
