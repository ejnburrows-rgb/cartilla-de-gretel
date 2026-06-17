import { createCanvas, Path2D, Image } from "@napi-rs/canvas";
globalThis.Path2D = Path2D;
globalThis.Image = Image;

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
const fs = await import("fs");

const data = new Uint8Array(fs.readFileSync("public/book/book.pdf"));
const doc = await pdfjsLib.getDocument({ data }).promise;

const page = await doc.getPage(5);
const viewport = page.getViewport({ scale: 4 });
const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext("2d");
await page.render({ canvasContext: ctx, viewport }).promise;
fs.writeFileSync("scratch/book-inspect/index-hires.png", canvas.toBuffer("image/png"));
console.log("done");
