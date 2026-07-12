#!/usr/bin/env node
/**
 * Missing asset-reference scanner for final release QA.
 *
 * Walks src/ (+ selected public manifests) for absolute asset URLs and checks
 * that corresponding files exist under public/.
 *
 * Usage:
 *   node scripts/validation/check-missing-references.mjs
 *   node scripts/validation/check-missing-references.mjs --json
 *
 * Output:
 *   generated/final-release-qa/results/missing-references.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const resultsDir = path.join(root, "generated", "final-release-qa", "results");
fs.mkdirSync(resultsDir, { recursive: true });

const ASSET_RE =
  /["'`](\/(?:cartilla|art|audio|fonts|icons|book)\/[A-Za-z0-9_@./+\-]+\.(?:png|jpe?g|webp|gif|svg|mp3|mp4|woff2|pdf|webmanifest))["'`]/g;

const SCAN_DIRS = [
  path.join(root, "src"),
  path.join(root, "public", "cartilla", "art", "faithful"),
];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  ".git",
  "_archive",
  "generated",
  "scratch",
]);

const TEXT_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".md",
  ".html",
]);

/** @type {{ file: string, line: number, ref: string }[]} */
const missing = [];
/** @type {{ file: string, line: number, ref: string }[]} */
const found = [];
const seen = new Set();

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (TEXT_EXTS.has(path.extname(ent.name).toLowerCase())) out.push(full);
  }
  return out;
}

function publicExists(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  const full = path.join(root, "public", clean.replace(/^\//, ""));
  return fs.existsSync(full);
}

const files = SCAN_DIRS.flatMap((d) => walk(d));
for (const file of files) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  // Skip huge generated route trees if any binary slipped through
  if (text.length > 5_000_000) continue;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    ASSET_RE.lastIndex = 0;
    let m;
    while ((m = ASSET_RE.exec(line)) !== null) {
      const ref = m[1];
      const key = `${file}::${ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const rel = path.relative(root, file).replace(/\\/g, "/");
      const row = { file: rel, line: i + 1, ref };
      if (publicExists(ref)) found.push(row);
      else missing.push(row);
    }
  }
}

// Unique missing refs (rollup)
const byRef = new Map();
for (const row of missing) {
  if (!byRef.has(row.ref)) byRef.set(row.ref, []);
  byRef.get(row.ref).push(`${row.file}:${row.line}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  phase: "final-release-qa",
  scannedFiles: files.length,
  uniqueRefsOk: new Set(found.map((f) => f.ref)).size,
  uniqueRefsMissing: byRef.size,
  missingCount: missing.length,
  ok: missing.length === 0,
  missingByRef: Object.fromEntries(
    [...byRef.entries()].map(([ref, locs]) => [ref, locs.slice(0, 10)]),
  ),
  missingSample: missing.slice(0, 100),
};

const outPath = path.join(resultsDir, "missing-references.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

if (process.argv.includes("--json")) {
  console.log(
    JSON.stringify({
      scannedFiles: report.scannedFiles,
      uniqueRefsMissing: report.uniqueRefsMissing,
      ok: report.ok,
    }),
  );
} else {
  console.log(
    `Missing-reference scan: files=${report.scannedFiles} missingRefs=${report.uniqueRefsMissing} occurrences=${report.missingCount}`,
  );
  console.log(`Report: ${path.relative(root, outPath).replace(/\\/g, "/")}`);
  const refs = [...byRef.keys()].slice(0, 30);
  for (const ref of refs) {
    console.log(` - ${ref} (${byRef.get(ref).length} hits)`);
  }
  if (byRef.size > 30) console.log(` ... +${byRef.size - 30} more refs`);
}

// Non-zero exit when missing — integration gate can require clean or triage allowlist later
process.exit(missing.length ? 1 : 0);
