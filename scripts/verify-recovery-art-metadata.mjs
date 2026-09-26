import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(root, "src");
const manifestPath = path.join(root, "public/cartilla/art/faithful/manifest.json");
const coveragePath = path.join(root, "tests/e2e/recovery-visual-coverage.json");
const inventoryPath = path.join(root, "docs/production-art-inventory.json");
const faithfulPattern = /\/cartilla\/art\/faithful\/[^"'`\s)]+\.webp/g;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function productionFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") return [];
      return productionFiles(abs);
    }
    if (!/\.(json|ts|tsx)$/.test(entry.name) || entry.name.endsWith(".gen.ts")) return [];
    return [abs];
  });
}

function references() {
  const bySrc = new Map();
  for (const abs of productionFiles(srcRoot)) {
    const text = fs.readFileSync(abs, "utf8");
    for (const match of text.matchAll(faithfulPattern)) {
      const before = text.slice(0, match.index);
      const location = `${path.relative(root, abs).replaceAll("\\", "/")}:${before.split("\n").length}`;
      const locations = bySrc.get(match[0]) ?? [];
      locations.push(location);
      bySrc.set(match[0], locations);
    }
  }
  return bySrc;
}

async function buildInventory() {
  const manifestBytes = fs.readFileSync(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const manifestBySrc = new Map(manifest.map((entry) => [entry.src, entry]));
  const refs = references();
  const assets = [];
  const errors = [];

  for (const [src, locations] of [...refs].sort(([a], [b]) => a.localeCompare(b))) {
    const entry = manifestBySrc.get(src);
    const canonicalPath = path.join(root, "public", src.slice(1));
    if (!entry) errors.push(`Referenced faithful asset is absent from manifest: ${src}`);
    if (!fs.existsSync(canonicalPath)) {
      errors.push(`Referenced faithful asset is missing: ${src}`);
      continue;
    }
    const bytes = fs.readFileSync(canonicalPath);
    const meta = await sharp(bytes).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    assets.push({
      src,
      source: entry?.source ?? entry?.sourceFlipchartPage ?? null,
      derivative: {
        canonical: src,
        width384: src.replace("/faithful/", "/delivery/faithful/384/"),
        width768: src.replace("/faithful/", "/delivery/faithful/768/"),
      },
      lessonNumber: entry?.lessonNumber ?? null,
      pageNumber: entry?.pageNumber ?? entry?.sourcePage ?? null,
      assetClass: "cutout",
      dimensions: { width, height },
      hasAlpha: Boolean(meta.hasAlpha),
      aspectRatio: height ? Number((width / height).toFixed(6)) : null,
      provenanceStatus: entry?.provenanceStatus ?? null,
      sha256: sha256(bytes),
      referenceCount: locations.length,
      referenceLocations: [...new Set(locations)].sort(),
    });
  }

  const referenced = new Set(refs.keys());
  const coverageBytes = fs.readFileSync(coveragePath);
  return {
    schemaVersion: 1,
    sourceManifest: "public/cartilla/art/faithful/manifest.json",
    sourceManifestSha256: sha256(manifestBytes),
    visualCoverageManifest: "tests/e2e/recovery-visual-coverage.json",
    visualCoverageSha256: sha256(coverageBytes),
    assetSetSha256: sha256(assets.map((asset) => `${asset.src}:${asset.sha256}`).join("\n")),
    counts: {
      referencedProductionAssets: assets.length,
      manifestEntries: manifest.length,
      unreferencedManifestEntries: manifest.filter((entry) => !referenced.has(entry.src)).length,
      errors: errors.length,
    },
    errors,
    unreferencedManifestEntries: manifest
      .filter((entry) => !referenced.has(entry.src))
      .map((entry) => entry.src)
      .sort(),
    assets,
  };
}

const inventory = await buildInventory();
const serialized = `${JSON.stringify(inventory, null, 2)}\n`;
if (process.argv.includes("--write")) {
  fs.writeFileSync(inventoryPath, serialized);
  console.log(`RECOVERY_ART_METADATA_UPDATED ${path.relative(root, inventoryPath)}`);
} else {
  if (!fs.existsSync(inventoryPath) || fs.readFileSync(inventoryPath, "utf8") !== serialized) {
    console.error("RECOVERY_ART_METADATA_STALE run: pnpm visual:metadata:update");
    process.exitCode = 1;
  }
  if (inventory.errors.length) {
    inventory.errors.forEach((error) => console.error(`RECOVERY_ART_METADATA_ERROR ${error}`));
    process.exitCode = 1;
  }
  if (!process.exitCode) console.log(`RECOVERY_ART_METADATA_OK ${inventory.assetSetSha256}`);
}
