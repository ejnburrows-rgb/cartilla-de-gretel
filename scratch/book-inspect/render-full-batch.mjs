import { createCanvas, Path2D, Image } from "@napi-rs/canvas";
globalThis.Path2D = Path2D;
globalThis.Image = Image;

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
const fs = await import("fs");

const SRC = "/root/.claude/uploads/6ab2aa08-f59b-5039-83ac-b3a7a9f784e4/97a44668-La_cartilla_Workbook.pdf";
const OUT_DIR = "public/cartilla/art/color/workbook-corrected";
const SCALE = 2550 / 612; // match existing scan width (2550x3301)

const data = new Uint8Array(fs.readFileSync(SRC));
const doc = await pdfjsLib.getDocument({ data }).promise;
console.log("total pages", doc.numPages);

const warned = [];
for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");

  let hadWarning = false;
  const origWarn = console.warn;
  console.warn = (...args) => { hadWarning = true; origWarn(...args); };
  await page.render({ canvasContext: ctx, viewport }).promise;
  console.warn = origWarn;
  if (hadWarning) warned.push(pageNum);

  const outPath = `${OUT_DIR}/page-${String(pageNum).padStart(3, "0")}.png`;
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
  if (pageNum % 10 === 0 || pageNum === doc.numPages) console.log("rendered", pageNum, `${viewport.width}x${viewport.height}`);
}
console.log("done. pages with decode warnings:", JSON.stringify(warned));
