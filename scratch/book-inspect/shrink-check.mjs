import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
async function shrink(p, out, maxW=800) {
  const img = await loadImage(fs.readFileSync(p));
  const s = maxW/img.width;
  const c = createCanvas(Math.round(img.width*s), Math.round(img.height*s));
  c.getContext("2d").drawImage(img, 0,0,c.width,c.height);
  fs.writeFileSync(out, c.toBuffer("image/png"));
}
for (const n of [4, 20, 50, 86, 92]) {
  const nn = String(n).padStart(3,"0");
  await shrink(`public/cartilla/art/color/workbook-corrected/page-${nn}.png`, `scratch/book-inspect/corrected-${n}.png`);
}
console.log("done");
