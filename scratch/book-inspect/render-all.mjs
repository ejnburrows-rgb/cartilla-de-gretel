import { createCanvas, Path2D, Image } from "@napi-rs/canvas";
globalThis.Path2D = Path2D;
globalThis.Image = Image;

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
const fs = await import("fs");

const data = new Uint8Array(fs.readFileSync("public/book/book.pdf"));
const doc = await pdfjsLib.getDocument({ data }).promise;
const total = doc.numPages;
console.log("total pages", total);

const failed = [];
for (let pageNum = 1; pageNum <= total; pageNum++) {
  const outPath = `scratch/book-inspect/page-${String(pageNum).padStart(3, "0")}.png`;
  if (fs.existsSync(outPath)) continue;
  try {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  } catch (e) {
    failed.push(pageNum);
    console.log("FAILED", pageNum, e.message);
  }
}
console.log("done. failed:", failed);
