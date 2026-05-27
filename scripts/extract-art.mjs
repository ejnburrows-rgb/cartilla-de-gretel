#!/usr/bin/env node
/**
 * scripts/extract-art.mjs
 *
 * Stage 1 of the art pipeline.
 *
 * Renders every page of every source PDF to a raw PNG using
 * scripts/pdf-to-png.swift (PDFKit + Core Graphics, macOS only).
 * This uses Apple's own PDF renderer — perfectly faithful to the original
 * scanned art, no generative AI, no colour changes, no invented imagery.
 *
 * Output layout:
 *   public/cartilla/art/raw/<docKey>/page-<NNN>.png
 *
 * Usage:
 *   node scripts/extract-art.mjs [--dpi 300] [--pdf workbook] [--force]
 *
 * Options:
 *   --dpi <n>    Render DPI (default 300). Higher = larger files + slower.
 *   --pdf <key>  Process one PDF only (workbook | flipchart | evals).
 *   --force      Re-render pages even if the output PNG already exists.
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_DPI = 300;

const SOURCE_PDFs = {
  workbook: path.resolve(
    __dirname,
    "../../Cartilla 1 Interactivos/La cartilla Workbook.pdf"
  ),
  flipchart: path.resolve(
    __dirname,
    "../../Cartilla 1 Interactivos/La Cartilla de Gretel Flip Chart.pdf"
  ),
  evals: path.resolve(
    __dirname,
    "../../Cartilla 1 Interactivos/La Cartilla Eval Master 7-24 - Copy.pdf"
  ),
};

const RAW_OUT   = path.resolve(__dirname, "../public/cartilla/art/raw");
const SWIFT_RENDERER = path.resolve(__dirname, "pdf-to-png.swift");

// ── CLI args ─────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const pdfIdx    = args.indexOf("--pdf");
const targetPdf = pdfIdx !== -1 ? args[pdfIdx + 1] : null;

const dpiIdx    = args.indexOf("--dpi");
const dpi       = dpiIdx !== -1 ? parseInt(args[dpiIdx + 1]) || DEFAULT_DPI : DEFAULT_DPI;
const force     = args.includes("--force");

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

/**
 * Extract all pages of one PDF to RAW_OUT/<docKey>/.
 * Delegates rendering to the Swift/PDFKit renderer for perfect fidelity.
 */
function extractPdf(docKey, pdfPath) {
  if (!fs.existsSync(pdfPath)) {
    console.warn(`⚠️  PDF not found, skipping: ${pdfPath}`);
    return { docKey, pages: 0 };
  }

  console.log(`\n📄 [${docKey}] — ${dpi} dpi`);
  console.log(`   ${pdfPath}`);

  const outDir = path.join(RAW_OUT, docKey);
  ensureDir(outDir);

  // If not --force, count how many pages already exist and skip if complete
  if (!force) {
    const existing = fs
      .readdirSync(outDir)
      .filter((f) => /^page-\d{3}\.png$/.test(f));
    if (existing.length > 0) {
      console.log(`   ⏭  ${existing.length} pages already in cache (use --force to re-render)`);
      return { docKey, pages: existing.length };
    }
  }

  // Run the Swift renderer — it writes pages to outDir and logs progress to stderr
  const result = spawnSync(
    "swift",
    [SWIFT_RENDERER, pdfPath, outDir, String(dpi)],
    {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024, // 64 MB
    }
  );

  // Swift logs progress to stderr; relay it
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw new Error(`Failed to spawn Swift renderer: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Swift renderer exited with status ${result.status}`);
  }

  const pages = fs
    .readdirSync(outDir)
    .filter((f) => /^page-\d{3}\.png$/.test(f)).length;

  console.log(`   ✓  ${pages} pages → ${path.relative(process.cwd(), outDir)}`);
  return { docKey, pages };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🎨 extract-art.mjs — PDF → raw PNG (faithful scan reproduction)");
  console.log(`   Renderer: Apple PDFKit / Core Graphics (Swift)`);
  console.log(`   DPI: ${dpi} | Force: ${force}`);
  console.log("");

  // Verify Swift renderer script exists
  if (!fs.existsSync(SWIFT_RENDERER)) {
    console.error(`❌  Swift renderer not found: ${SWIFT_RENDERER}`);
    process.exit(1);
  }

  // Verify swift is on PATH
  const swiftCheck = spawnSync("swift", ["--version"], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (swiftCheck.error || swiftCheck.status !== 0) {
    console.error("❌  'swift' not found. Xcode Command Line Tools required.");
    console.error("    Install with: xcode-select --install");
    process.exit(1);
  }

  ensureDir(RAW_OUT);

  if (targetPdf && !SOURCE_PDFs[targetPdf]) {
    console.error(
      `❌  Unknown PDF key "${targetPdf}". Valid keys: ${Object.keys(SOURCE_PDFs).join(", ")}`
    );
    process.exit(1);
  }

  const entries = targetPdf
    ? [[targetPdf, SOURCE_PDFs[targetPdf]]]
    : Object.entries(SOURCE_PDFs);

  const results = [];
  for (const [key, pdfPath] of entries) {
    results.push(extractPdf(key, pdfPath));
  }

  console.log("\n✅  Extraction complete.");
  for (const { docKey, pages } of results) {
    console.log(`   ${docKey}: ${pages} pages`);
  }
  console.log("\n→  Run  node scripts/polish-art.mjs  to upscale + sharpen.");
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err);
  process.exit(1);
});
