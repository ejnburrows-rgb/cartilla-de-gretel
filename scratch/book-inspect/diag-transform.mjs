import { createCanvas, Image } from "@napi-rs/canvas";
import fs from "fs";

function transform(srcPath, outPath, mode) {
  const img = new Image();
  img.src = fs.readFileSync(srcPath);
  const w = img.width, h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (mode === "flop") {
    // horizontal mirror
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  } else if (mode === "flip") {
    // vertical mirror
    ctx.translate(0, h);
    ctx.scale(1, -1);
  } else if (mode === "rot180") {
    ctx.translate(w, h);
    ctx.scale(-1, -1);
  }
  ctx.drawImage(img, 0, 0, w, h);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("wrote", outPath, `${w}x${h}`);
}

const live = "public/cartilla/art/color/workbook/page-020.png";
transform(live, "scratch/book-inspect/diag-020-flop.png", "flop");
transform(live, "scratch/book-inspect/diag-020-rot180.png", "rot180");
const live1 = "public/cartilla/art/color/workbook/page-001.png";
transform(live1, "scratch/book-inspect/diag-001-flop.png", "flop");
