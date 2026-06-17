import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";

async function go() {
  const img = await loadImage(fs.readFileSync("scratch/book-inspect/full4-flop.png"));
  const cw = Math.round(img.width * 0.28);
  const ch = Math.round(img.height * 0.08);
  const canvas = createCanvas(cw * 3, ch * 3);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, cw, ch, 0, 0, cw * 3, ch * 3);
  fs.writeFileSync("scratch/book-inspect/full4-flop-corner.png", canvas.toBuffer("image/png"));
}
go();
