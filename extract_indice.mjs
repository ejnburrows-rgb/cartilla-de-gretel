import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const workerPath = resolve(__dirname, 'node_modules/.pnpm/pdfjs-dist@5.7.284/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
GlobalWorkerOptions.workerSrc = new URL(`file://${workerPath.replace(/\\/g, '/')}`).href;

const data = new Uint8Array(readFileSync('./public/book/book.pdf'));
const pdf = await getDocument({ data, useSystemFonts: true, disableFontFace: true, verbosity: 0 }).promise;

console.log('Total pages:', pdf.numPages);

// Look at pages around the intro / vowel transitions and first consonant
// Pages 1-5: opening/indice
// Pages around 19-30: where Mm is supposed to start per consonants.json
// Sample specific pages to understand structure
const pagesToCheck = [
  // Opening pages
  1, 2, 3, 4, 5, 6,
  // Pages around where intro + vowels should be (pages 1-18 per lesson-catalog)
  7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  // Pages around start of consonant lessons
  22, 23, 24, 25, 26, 27, 28,
  // Pages around s (27-30), t (31-34)
  29, 30, 31, 32, 33, 34,
];

for (const pageNum of pagesToCheck) {
  const page = await pdf.getPage(pageNum);
  const tc = await page.getTextContent();
  const items = tc.items.map(i => ({ str: i.str, x: Math.round(i.transform[4]), y: Math.round(i.transform[5]) }));
  const allText = items.map(i => i.str).join(' ').slice(0, 200);
  console.log(`PAGE ${pageNum}: ${allText}`);
}
