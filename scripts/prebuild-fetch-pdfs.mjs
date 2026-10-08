import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const pdfPath = path.join(rootDir, "public", "book", "book.pdf");

async function main() {
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`[prebuild-fetch-pdfs] public/book/book.pdf found (${stats.size} bytes).`);
    return;
  }

  const url = process.env.BOOK_PDF_URL;
  if (url) {
    console.log(`[prebuild-fetch-pdfs] Fetching book.pdf from ${url}...`);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
        fs.writeFileSync(pdfPath, buffer);
        console.log(`[prebuild-fetch-pdfs] Successfully downloaded public/book/book.pdf (${buffer.length} bytes).`);
        return;
      }
      console.warn(`[prebuild-fetch-pdfs] HTTP ${res.status} when fetching BOOK_PDF_URL.`);
    } catch (err) {
      console.warn(`[prebuild-fetch-pdfs] Failed to fetch BOOK_PDF_URL: ${err.message}`);
    }
  }

  console.log("[prebuild-fetch-pdfs] public/book/book.pdf not present in repo. On-demand runtime fetch will be used if configured.");
}

main();
