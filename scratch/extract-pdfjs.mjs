import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";

const pdfPath = "C:\\Users\\EJN\\Desktop\\La Cartilla\\Main Book\\61-Libro del alumno.pdf";
const outDir = "scratch/pdf_out";

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdfDocument = await loadingTask.promise;
  console.log(`Loaded PDF. Pages: ${pdfDocument.numPages}`);
  
  // Test extracting page 1
  const page = await pdfDocument.getPage(1);
  const scale = 300 / 72; // 300 DPI
  const viewport = page.getViewport({ scale });
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outDir, `page-1.png`), buffer);
  console.log("Saved page 1.");
}

run().catch(console.error);
