#!/usr/bin/env node
// verify-pdf.mjs
// Validates the fetched workbook PDF header and writes a status JSON for
// downstream pipeline steps. Always exits 0 so the build never aborts on a
// missing or malformed PDF; the frontend degrades gracefully via
// BookArtFigure placeholders.

import {
  readFileSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const PDF_PATH = join(ROOT, "public", "book", "book.pdf");
const STATUS_PATH = join(
  ROOT,
  "public",
  "cartilla",
  "art",
  "_pdf-status.json"
);
const start = Date.now();

function writeStatus(status) {
  try {
    mkdirSync(dirname(STATUS_PATH), { recursive: true });
    writeFileSync(
      STATUS_PATH,
      JSON.stringify(
        { ...status, checkedAt: new Date().toISOString() },
        null,
        2
      )
    );
  } catch (e) {
    console.warn("[verify-pdf] could not write status:", e?.message ?? e);
  }
}

if (!existsSync(PDF_PATH)) {
  console.warn(
    `[verify-pdf] missing ${PDF_PATH}; continuing without verification.`
  );
  writeStatus({ ok: false, reason: "missing", path: PDF_PATH });
  process.exit(0);
}

try {
  const stat = statSync(PDF_PATH);
  const buf = readFileSync(PDF_PATH);
  const head = buf.subarray(0, 8).toString("latin1");
  const ok = head.startsWith("%PDF-");
  console.log(
    `[verify-pdf] size=${stat.size}B header="${head}" ok=${ok} elapsed=${Date.now() - start}ms`
  );
  writeStatus({ ok, size: stat.size, header: head });
} catch (e) {
  console.warn("[verify-pdf] read failed:", e?.message ?? e);
  writeStatus({
    ok: false,
    reason: "read-failed",
    error: String(e?.message ?? e),
  });
}
process.exit(0);
