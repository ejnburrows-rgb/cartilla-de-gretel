import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function go() {
  const img = await loadImage(fs.readFileSync("scratch/book-inspect/full4-flop.png"));
  const x = 0, y = Math.round(img.height * 0.87), w = Math.round(img.width * 0.85), h = Math.round(img.height * 0.12);
  const canvas = createCanvas(w * 2, h * 2);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, x, y, w, h, 0, 0, w * 2, h * 2);
  fs.writeFileSync("scratch/book-inspect/full4-flop-instr.png", canvas.toBuffer("image/png"));
}
go();
