import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function transformScaled(srcPath, outPath, mode, maxW = 1100) {
  const img = await loadImage(fs.readFileSync(srcPath));
  const w = img.width, h = img.height;
  const scale = maxW / w;
  const ow = Math.round(w * scale), oh = Math.round(h * scale);
  const canvas = createCanvas(ow, oh);
  const ctx = canvas.getContext("2d");
  if (mode === "flop") { ctx.translate(ow, 0); ctx.scale(-1, 1); }
  else if (mode === "flip") { ctx.translate(0, oh); ctx.scale(1, -1); }
  else if (mode === "rot180") { ctx.translate(ow, oh); ctx.scale(-1, -1); }
  ctx.drawImage(img, 0, 0, ow, oh);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath, `${ow}x${oh} mode=${mode}`);
}

const p = "public/cartilla/art/color/workbook/page-020.png";
await transformScaled(p, "scratch/book-inspect/s-flop.png", "flop");
await transformScaled(p, "scratch/book-inspect/s-rot180.png", "rot180");
await transformScaled(p, "scratch/book-inspect/s-flip.png", "flip");
await transformScaled(p, "scratch/book-inspect/s-none.png", "none");
