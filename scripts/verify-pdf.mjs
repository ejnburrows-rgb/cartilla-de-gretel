#!/usr/bin/env node
// verify-pdf.mjs — fail the build if the workbook PDF did not land.
// Runs after prebuild-fetch-pdfs.mjs. Non-zero exit blocks the deploy so a
// broken site cannot ship silently.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PDF_PATH = path.join(ROOT, "public/book/book.pdf");
const MIN_BYTES = 50_000; // anything smaller is almost certainly an error page

function fail(msg) {
  console.error("\u274c  PDF verify failed: " + msg);
  process.exit(1);
}

if (!fs.existsSync(PDF_PATH)) {
  fail(`public/book/book.pdf is missing. Prebuild fetcher must run before this script.`);
}

const stat = fs.statSync(PDF_PATH);
if (!stat.isFile()) fail(`public/book/book.pdf is not a regular file.`);
if (stat.size < MIN_BYTES)
  fail(
    `public/book/book.pdf is only ${stat.size} bytes (< ${MIN_BYTES}). Likely an HTML error response.`,
  );

// Sniff the file header for %PDF-
const fd = fs.openSync(PDF_PATH, "r");
const buf = Buffer.alloc(8);
fs.readSync(fd, buf, 0, 8, 0);
fs.closeSync(fd);
const header = buf.toString("utf8", 0, 5);
if (header !== "%PDF-")
  fail(
    `public/book/book.pdf does not start with %PDF- (got "${header}"). File is corrupted or HTML.`,
  );

const sizeKb = Math.round(stat.size / 1024);
console.log(`\u2705  PDF verified: public/book/book.pdf (${sizeKb} KB, header %PDF-)`);
process.exit(0);
