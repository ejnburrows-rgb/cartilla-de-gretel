import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function transform(srcPath, outPath, mode) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const w = img.width, h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.save();
  if (mode === "flop") { ctx.translate(w, 0); ctx.scale(-1, 1); }
  else if (mode === "flip") { ctx.translate(0, h); ctx.scale(1, -1); }
  else if (mode === "rot180") { ctx.translate(w, h); ctx.scale(-1, -1); }
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath, `${w}x${h} mode=${mode}`);
}

await transform("public/cartilla/art/color/workbook/page-020.png", "scratch/book-inspect/d2-020-flop.png", "flop");
await transform("public/cartilla/art/color/workbook/page-020.png", "scratch/book-inspect/d2-020-rot180.png", "rot180");
await transform("public/cartilla/art/color/workbook/page-020.png", "scratch/book-inspect/d2-020-flip.png", "flip");
