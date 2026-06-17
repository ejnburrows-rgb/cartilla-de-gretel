import { createCanvas, Path2D, Image } from "@napi-rs/canvas";
globalThis.Path2D = Path2D;
globalThis.Image = Image;

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
const fs = await import("fs");

const data = new Uint8Array(fs.readFileSync("/root/.claude/uploads/6ab2aa08-f59b-5039-83ac-b3a7a9f784e4/97a44668-La_cartilla_Workbook.pdf"));
const doc = await pdfjsLib.getDocument({ data }).promise;

for (const pageNum of [2, 26, 50, 86, 87, 92]) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  fs.writeFileSync(`scratch/book-inspect/upload-${pageNum}.png`, canvas.toBuffer("image/png"));
  console.log("rendered", pageNum);
}
