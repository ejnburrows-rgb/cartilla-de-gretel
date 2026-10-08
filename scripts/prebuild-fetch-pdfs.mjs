import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const pdfPath = path.join(rootDir, "public", "book", "book.pdf");

export const CANONICAL_BOOK_PDF_SHA256 = "cbe050520bafefaea9c19c75eee6dd48ab3476a6377dc45009d176c18aab0a3b";
export const CANONICAL_BOOK_PDF_BYTES = 15500956;
export const MIN_BOOK_PDF_BYTES = 10_000_000;

export function validateBookPdf(
  buffer,
  {
    expectedSha256 = CANONICAL_BOOK_PDF_SHA256,
    expectedBytes = CANONICAL_BOOK_PDF_BYTES,
    minBytes = MIN_BOOK_PDF_BYTES,
  } = {},
) {
  if (!Buffer.isBuffer(buffer)) throw new Error("Workbook PDF bytes are not a Buffer.");
  if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("Workbook PDF signature is invalid.");
  }
  if (buffer.length < minBytes) {
    throw new Error(`Workbook PDF is too small (${buffer.length} bytes).`);
  }
  if (expectedBytes != null && buffer.length !== expectedBytes) {
    throw new Error(`Workbook PDF byte length mismatch (${buffer.length} !== ${expectedBytes}).`);
  }
  const digest = createHash("sha256").update(buffer).digest("hex");
  if (digest !== expectedSha256) {
    throw new Error(`Workbook PDF SHA-256 mismatch (${digest}).`);
  }
  return { bytes: buffer.length, sha256: digest };
}

export function redactBookPdfUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "BOOK_PDF_URL";
  }
}

function writeBookPdfAtomic(buffer) {
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  const temporaryPath = `${pdfPath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, buffer);
    fs.renameSync(temporaryPath, pdfPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true });
  }
}

export async function main() {
  if (fs.existsSync(pdfPath)) {
    const buffer = fs.readFileSync(pdfPath);
    const proof = validateBookPdf(buffer);
    console.log(
      `[prebuild-fetch-pdfs] Canonical public/book/book.pdf found (${proof.bytes} bytes, sha256 ${proof.sha256}).`,
    );
    return;
  }

  const url = process.env.BOOK_PDF_URL;
  if (!url) {
    console.log(
      "[prebuild-fetch-pdfs] public/book/book.pdf not present and BOOK_PDF_URL is not configured. Runtime source fallback remains responsible for the workbook PDF.",
    );
    return;
  }

  console.log(
    `[prebuild-fetch-pdfs] Fetching canonical book.pdf from ${redactBookPdfUrl(url)} via BOOK_PDF_URL...`,
  );

  let res;
  try {
    res = await fetch(url);
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    throw new Error(`Failed to fetch BOOK_PDF_URL (${name}).`);
  }

  if (!res.ok) {
    throw new Error(`BOOK_PDF_URL returned HTTP ${res.status}.`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const proof = validateBookPdf(buffer);
  writeBookPdfAtomic(buffer);
  console.log(
    `[prebuild-fetch-pdfs] Installed canonical public/book/book.pdf atomically (${proof.bytes} bytes, sha256 ${proof.sha256}).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(
      `[prebuild-fetch-pdfs] ${error instanceof Error ? error.message : "Workbook PDF fetch failed."}`,
    );
    process.exitCode = 1;
  });
}
