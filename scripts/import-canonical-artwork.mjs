import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { processOwnerArtIntake, rootDir } from "./validate-owner-art-package.mjs";

const root = rootDir;
const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes("--dry-run");
const allowOverwriteVerified =
  args.includes("--allow-overwrite-verified") || args.includes("--force");
const requestedPackage = arg("--package");
const mappingPath = arg("--mapping");

const candidates = [
  requestedPackage,
  process.env.CARTILLA_ASSET_PACKAGE,
  path.join(os.homedir(), "Downloads", "cartilla_master_assets_package.zip"),
  path.join(os.homedir(), "Google Drive", "My Drive", "cartilla_master_assets_package.zip"),
  path.join(os.homedir(), "My Drive", "cartilla_master_assets_package.zip"),
].filter(Boolean);

const sourcePath = candidates.find((p) => fs.existsSync(p));

if (!sourcePath) {
  console.error("No asset package found. Provide --package <path> or set CARTILLA_ASSET_PACKAGE.");
  process.exit(1);
}

// Check whether package uses the new owner intake structure or legacy global_index.json
let isLegacyPackage = false;
if (fs.statSync(sourcePath).isFile() && sourcePath.toLowerCase().endsWith(".zip")) {
  const checkWork = path.join(root, ".cartilla-art-import-check");
  fs.rmSync(checkWork, { recursive: true, force: true });
  fs.mkdirSync(checkWork, { recursive: true });
  try {
    const files = execFileSync("tar", ["-tf", sourcePath], { encoding: "utf8" });
    if (files.includes("global_index.json") && !mappingPath) {
      isLegacyPackage = true;
    }
  } catch {
    // Ignore tar list error
  } finally {
    fs.rmSync(checkWork, { recursive: true, force: true });
  }
} else if (fs.statSync(sourcePath).isDirectory()) {
  if (fs.existsSync(path.join(sourcePath, "global_index.json")) && !mappingPath) {
    isLegacyPackage = true;
  }
}

if (!isLegacyPackage) {
  // Use deterministic owner art intake pipeline
  processOwnerArtIntake({
    packagePath: sourcePath,
    mappingPath,
    dryRun,
    allowOverwriteVerified,
    root,
  })
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (report.ambiguousMappings.length > 0) {
        console.warn("Ambiguous items were not changed. Explicit mapping required.");
      }
    })
    .catch((err) => {
      console.error(`Import Error: ${err.message}`);
      process.exit(1);
    });
} else {
  // Legacy global_index.json intake pipeline
  const work = path.join(root, ".cartilla-art-import");
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  let packageRoot = sourcePath;
  if (sourcePath.toLowerCase().endsWith(".zip")) {
    const extractDir = path.join(work, "package");
    fs.mkdirSync(extractDir, { recursive: true });
    execFileSync("tar", ["-xf", sourcePath, "-C", extractDir], { stdio: "inherit" });
    packageRoot = extractDir;
  }

  const globalIndexPath = path.join(packageRoot, "global_index.json");
  if (!fs.existsSync(globalIndexPath)) {
    throw new Error("global_index.json missing from canonical package.");
  }
  const globalIndex = JSON.parse(fs.readFileSync(globalIndexPath, "utf8"));
  const faithfulManifestPath = path.join(
    root,
    "public",
    "cartilla",
    "art",
    "faithful",
    "manifest.json",
  );
  const faithful = JSON.parse(fs.readFileSync(faithfulManifestPath, "utf8"));

  const norm = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const basenameSlug = (relative) => {
    const stem = norm(path.basename(relative, path.extname(relative)));
    return stem
      .replace(/^p\d+_/, "")
      .replace(/^(vocab|vignette|story|cover)_/, "")
      .replace(/_\d+$/, "");
  };

  const modern = globalIndex
    .filter((x) => x?.modernized_file)
    .map((x) => ({
      ...x,
      abs: path.join(packageRoot, String(x.modernized_file).replaceAll("/", path.sep)),
      slug: basenameSlug(x.modernized_file),
    }))
    .filter((x) => fs.existsSync(x.abs));

  const bySlug = new Map();
  for (const item of modern) {
    const list = bySlug.get(item.slug) ?? [];
    list.push(item);
    bySlug.set(item.slug, list);
  }

  function choose(entry, options) {
    if (options.length === 1) return { item: options[0], method: "slug-exact" };

    const sourceFlip = Number(entry.sourceFlipchartPage);
    if (Number.isFinite(sourceFlip)) {
      const hit = options.find(
        (x) => Number(x.page) === sourceFlip && String(x.source).startsWith("flipchart"),
      );
      if (hit) return { item: hit, method: "slug+flipchart-page" };
    }

    const workbookPage = Number(entry.pageNumber);
    if (Number.isFinite(workbookPage)) {
      const hit = options.find(
        (x) => Number(x.page) === workbookPage && String(x.source) === "workbook",
      );
      if (hit) return { item: hit, method: "slug+workbook-page" };
    }

    const preferred = options.find((x) => String(x.source) === "flipchart");
    return preferred ? { item: preferred, method: "slug-prefer-flipchart" } : null;
  }

  const backupRoot = path.join(
    root,
    ".cartilla-art-backup",
    new Date().toISOString().replace(/[:.]/g, "-"),
  );
  const importedRoot = path.join(root, "public", "cartilla", "art", "canonical-modernized");
  if (!dryRun) {
    fs.mkdirSync(backupRoot, { recursive: true });
    fs.mkdirSync(importedRoot, { recursive: true });
  }

  const report = [];
  let matched = 0;
  let ambiguous = 0;
  let unresolved = 0;

  for (const entry of faithful) {
    const slug = norm(entry.slug || entry.word);
    const options = bySlug.get(slug) ?? [];
    if (!options.length) {
      unresolved += 1;
      report.push({ src: entry.src, slug, status: "unresolved" });
      continue;
    }
    const selected = choose(entry, options);
    if (!selected) {
      ambiguous += 1;
      report.push({
        src: entry.src,
        slug,
        status: "ambiguous",
        candidates: options.map((x) => x.modernized_file),
      });
      continue;
    }

    const target = path.join(root, "public", entry.src.replace(/^\//, ""));
    const backup = path.join(backupRoot, entry.src.replace(/^\//, ""));
    const canonicalCopy = path.join(
      importedRoot,
      String(selected.item.source),
      path.basename(selected.item.abs),
    );
    if (!dryRun) {
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.mkdirSync(path.dirname(canonicalCopy), { recursive: true });
      if (fs.existsSync(target)) fs.copyFileSync(target, backup);
      fs.copyFileSync(selected.item.abs, canonicalCopy);
      await sharp(selected.item.abs)
        .flatten({ background: "#ffffff" })
        .webp({ quality: 92, effort: 5 })
        .toFile(target);
    }
    matched += 1;
    report.push({
      src: entry.src,
      productionSrc: entry.src,
      canonicalSrc: `/cartilla/art/canonical-modernized/${String(selected.item.source)}/${path.basename(selected.item.abs)}`,
      slug,
      status: "matched",
      method: selected.method,
      packageAsset: selected.item.modernized_file,
    });
  }

  const importManifest = {
    version: "2026-09-28",
    status: dryRun ? "dry-run" : "imported",
    canonicalDirection: "Gretel 2.0 modernized country/tole + digital polish",
    generatedAt: new Date().toISOString(),
    packageSource: sourcePath,
    assets: report,
    summary: { imported: modern.length, matched, ambiguous, unresolved },
  };

  const outputManifest = path.join(root, "src", "data", "canonical-artwork-import.json");
  if (!dryRun) fs.writeFileSync(outputManifest, JSON.stringify(importManifest, null, 2) + "\n");

  const digest = crypto.createHash("sha256").update(JSON.stringify(importManifest)).digest("hex");
  console.log(
    JSON.stringify(
      { ...importManifest.summary, digest, backupRoot: dryRun ? null : backupRoot },
      null,
      2,
    ),
  );

  if (ambiguous > 0) console.warn("Ambiguous items were not changed.");
  if (unresolved > 0) console.warn("Unresolved items were not changed.");
}
