#!/usr/bin/env node
// Extracts every page of public/book/book.pdf as a high-DPI PNG into
// public/cartilla/art/raw/page-NNN.png. Deterministic, no AI redraws.
// Exits 0 on any failure so the build never breaks.

import fs from "node:fs";
import path from "node:path";

const PDF_PATH = "public/book/book.pdf";
const OUT_DIR = "public/cartilla/art/raw";
const SCALE = 2; // ~144 DPI; good polish ceiling vs build-time budget
const TIME_BUDGET_MS = 90_000;
const started = Date.now();

if (!fs.existsSync(PDF_PATH)) {
  console.log("[extract-art] no PDF at", PDF_PATH, "- skipping");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let pdfjs;
let canvasMod;
try {
  pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  canvasMod = await import("@napi-rs/canvas");
} catch (e) {
  console.log("[extract-art] dependency missing:", e.message);
  process.exit(0);
}

// pdfjs-dist in Node has no worker; disable it.
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "";
}

const data = new Uint8Array(fs.readFileSync(PDF_PATH));
let doc;
try {
  doc = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;
} catch (e) {
  console.log("[extract-art] failed to open PDF:", e.message);
  process.exit(0);
}

const total = doc.numPages;
console.log("[extract-art] PDF has", total, "pages, scale", SCALE);
let written = 0;
for (let i = 1; i <= total; i++) {
  if (Date.now() - started > TIME_BUDGET_MS) {
    console.log("[extract-art] time budget exceeded at page", i, "of", total);
    break;
  }
  try {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = canvasMod.createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    const buf = await canvas.encode("png");
    const outPath = path.join(
      OUT_DIR,
      `page-${String(i).padStart(3, "0")}.png`,
    );
    fs.writeFileSync(outPath, buf);
    written++;
    page.cleanup();
  } catch (e) {
    console.log("[extract-art] page", i, "failed:", e.message);
  }
}
console.log(
  "[extract-art] wrote",
  written,
  "/",
  total,
  "pages in",
  ((Date.now() - started) / 1000).toFixed(1) + "s",
);
process.exit(0);
