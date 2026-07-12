#!/usr/bin/env node
/**
 * Asset integrity checker for final release QA.
 *
 * Verifies that files referenced by key manifests exist under public/.
 * Safe to run after integration; does not modify product code.
 *
 * Usage:
 *   node scripts/validation/check-asset-integrity.mjs
 *   node scripts/validation/check-asset-integrity.mjs --json
 *
 * Output:
 *   generated/final-release-qa/results/asset-integrity.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const resultsDir = path.join(root, "generated", "final-release-qa", "results");
fs.mkdirSync(resultsDir, { recursive: true });

const problems = [];
const checked = [];

function existsPublic(urlPath) {
  const clean = String(urlPath || "").split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) return { ok: false, full: null, reason: "not-absolute-public-url" };
  const full = path.join(root, "public", clean.replace(/^\//, ""));
  return { ok: fs.existsSync(full), full, clean };
}

function record(kind, ref, where, ok, detail = null) {
  const row = { kind, ref, where, ok, detail };
  checked.push(row);
  if (!ok) problems.push(row);
}

// 1) Faithful art manifest
const faithfulManifest = path.join(root, "public", "cartilla", "art", "faithful", "manifest.json");
if (!fs.existsSync(faithfulManifest)) {
  record("manifest-missing", "public/cartilla/art/faithful/manifest.json", "repo", false);
} else {
  try {
    const entries = JSON.parse(fs.readFileSync(faithfulManifest, "utf8"));
    if (!Array.isArray(entries)) {
      record("manifest-shape", "faithful/manifest.json", "root", false, "expected array");
    } else {
      record("manifest-present", "faithful/manifest.json", "root", true, `entries=${entries.length}`);
      for (const e of entries) {
        const src = e?.src;
        if (!src) {
          record("manifest-entry", e?.slug || "(no-slug)", "faithful/manifest.json", false, "missing src");
          continue;
        }
        const { ok } = existsPublic(src);
        record("faithful-src", src, `slug=${e.slug || "?"}`, ok);
      }
    }
  } catch (err) {
    record("manifest-parse", "faithful/manifest.json", "root", false, String(err));
  }
}

// 2) Gretel production poses (canonical set — filenames are gretel-<pose>.webp)
const gretelPoseFiles = [
  "gretel-idle.webp",
  "gretel-cheer.webp",
  "gretel-point.webp",
  "gretel-talk.webp",
  "gretel-wave.webp",
  "gretel-blink.webp",
];
for (const name of gretelPoseFiles) {
  const p = `/cartilla/images/gretel/poses/${name}`;
  const { ok } = existsPublic(p);
  record("gretel-pose", p, "poses", ok);
}

// 3) Workbook HD page spot range (if folder exists)
const hdWorkbookDir = path.join(root, "public", "cartilla", "art", "hd", "workbook");
if (fs.existsSync(hdWorkbookDir)) {
  const files = fs.readdirSync(hdWorkbookDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  record("hd-workbook-dir", "public/cartilla/art/hd/workbook", "assets", true, `files=${files.length}`);
} else {
  // Alternate path used historically
  const alt = path.join(root, "public", "art", "hd");
  if (fs.existsSync(alt)) {
    const files = fs.readdirSync(alt).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    record("hd-workbook-dir", "public/art/hd", "assets", true, `files=${files.length}`);
  } else {
    record("hd-workbook-dir", "public/cartilla/art/hd/workbook|public/art/hd", "assets", false, "directory missing");
  }
}

// 4) Workbook manifest (content) if present
const workbookManifest = path.join(root, "src", "content", "workbook", "workbook-manifest.json");
if (fs.existsSync(workbookManifest)) {
  try {
    const wm = JSON.parse(fs.readFileSync(workbookManifest, "utf8"));
    const pages = wm?.pages || wm?.applicationPages || [];
    const pageCount = Array.isArray(pages) ? pages.length : wm?.pageCount || null;
    record("workbook-manifest", "src/content/workbook/workbook-manifest.json", "content", true, `pageCount=${pageCount}`);
  } catch (err) {
    record("workbook-manifest", "src/content/workbook/workbook-manifest.json", "content", false, String(err));
  }
} else {
  record("workbook-manifest", "src/content/workbook/workbook-manifest.json", "content", false, "missing");
}

const report = {
  generatedAt: new Date().toISOString(),
  phase: "final-release-qa",
  root,
  summary: {
    checked: checked.length,
    problems: problems.length,
    ok: problems.length === 0,
  },
  problems,
  checked,
};

const outPath = path.join(resultsDir, "asset-integrity.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

const asJson = process.argv.includes("--json");
if (asJson) {
  console.log(JSON.stringify(report.summary));
} else {
  console.log(`Asset integrity: checked=${checked.length} problems=${problems.length}`);
  console.log(`Report: ${path.relative(root, outPath).replace(/\\/g, "/")}`);
  if (problems.length) {
    for (const p of problems.slice(0, 40)) {
      console.log(` - [${p.kind}] ${p.ref} @ ${p.where}${p.detail ? ` (${p.detail})` : ""}`);
    }
    if (problems.length > 40) console.log(` ... +${problems.length - 40} more`);
  }
}

process.exit(problems.length ? 1 : 0);
