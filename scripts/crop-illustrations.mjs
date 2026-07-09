#!/usr/bin/env node
/**
 * scripts/crop-illustrations.mjs
 *
 * Mechanical, deterministic crop tool. Reads scripts/crop-manifest.json
 * (an array of { slug, source, x, y, width, height, output }), crops each
 * region out of its real source scan with sharp, and writes an optimized
 * webp to public/cartilla/art/extracted/.
 *
 * This tool does not guess crop boxes — it only cuts exactly the
 * rectangle it's told to. Generate the manifest with
 * scripts/generate-crop-manifest.mjs, which sources coordinates from
 * already-verified data and lists anything it can't determine in
 * OPERATOR-NEEDS.md instead of inventing a box.
 *
 * Usage:
 *   node scripts/crop-illustrations.mjs [--manifest path] [--force]
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const manifestIdx = args.indexOf("--manifest");
const manifestPath = manifestIdx !== -1
  ? path.resolve(args[manifestIdx + 1])
  : path.join(__dirname, "crop-manifest.json");
const force = args.includes("--force");

function loadManifest() {
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌  Manifest not found: ${manifestPath}`);
    console.error(`    Run  node scripts/generate-crop-manifest.mjs  first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function validateEntry(entry, i) {
  const required = ["slug", "source", "x", "y", "width", "height", "output"];
  const missing = required.filter((k) => entry[k] === undefined || entry[k] === null);
  if (missing.length > 0) {
    return `entry[${i}] (${entry.slug ?? "?"}) missing field(s): ${missing.join(", ")}`;
  }
  if (entry.width <= 0 || entry.height <= 0) {
    return `entry[${i}] (${entry.slug}) has non-positive width/height`;
  }
  return null;
}

async function cropOne(entry) {
  const sourcePath = path.isAbsolute(entry.source) ? entry.source : path.join(rootDir, entry.source);
  const outputPath = path.isAbsolute(entry.output) ? entry.output : path.join(rootDir, entry.output);

  if (!fs.existsSync(sourcePath)) {
    return { slug: entry.slug, status: "missing-source", detail: entry.source };
  }
  if (!force && fs.existsSync(outputPath)) {
    return { slug: entry.slug, status: "skipped-exists", detail: entry.output };
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  try {
    await sharp(sourcePath)
      .extract({ left: entry.x, top: entry.y, width: entry.width, height: entry.height })
      .webp({ quality: 90 })
      .toFile(outputPath);
    return { slug: entry.slug, status: "produced", detail: entry.output };
  } catch (err) {
    return { slug: entry.slug, status: "error", detail: err.message };
  }
}

async function main() {
  console.log("✂️   crop-illustrations.mjs — mechanical crop, no guessing");
  console.log(`   manifest: ${path.relative(rootDir, manifestPath)}`);
  console.log(`   force: ${force}\n`);

  const manifest = loadManifest();
  if (!Array.isArray(manifest)) {
    console.error("❌  Manifest must be a JSON array.");
    process.exit(1);
  }

  const results = [];
  for (let i = 0; i < manifest.length; i++) {
    const entry = manifest[i];
    const err = validateEntry(entry, i);
    if (err) {
      results.push({ slug: entry.slug ?? `entry[${i}]`, status: "invalid-entry", detail: err });
      continue;
    }
    results.push(await cropOne(entry));
  }

  const byStatus = results.reduce((acc, r) => {
    (acc[r.status] ??= []).push(r);
    return acc;
  }, {});

  console.log(`Total entries: ${results.length}`);
  for (const [status, items] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${items.length}`);
  }

  if (byStatus.produced) {
    console.log("\nProduced:");
    for (const r of byStatus.produced) console.log(`  ✓ ${r.slug} → ${r.detail}`);
  }
  if (byStatus["missing-source"] || byStatus["invalid-entry"] || byStatus.error) {
    console.log("\nNeeds attention:");
    for (const r of [...(byStatus["missing-source"] ?? []), ...(byStatus["invalid-entry"] ?? []), ...(byStatus.error ?? [])]) {
      console.log(`  ✗ ${r.slug} — ${r.status}: ${r.detail}`);
    }
  }

  const failed = (byStatus["missing-source"]?.length ?? 0) + (byStatus["invalid-entry"]?.length ?? 0) + (byStatus.error?.length ?? 0);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err);
  process.exit(1);
});
