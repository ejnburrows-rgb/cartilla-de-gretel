import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const faithfulDir = path.join(publicDir, "cartilla", "art", "faithful");
const deliveryDir = path.join(publicDir, "cartilla", "art", "delivery", "faithful");
const deliveryManifestPath = path.join(publicDir, "cartilla", "art", "delivery", "manifest.json");
const sourceManifestPath = path.join(faithfulDir, "manifest.json");

export const DELIVERY_WIDTHS = [384, 768];
export const SAFE_PADDING = 10;
const ALPHA_EMPTY = 8;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function canonicalRelativeFromSrc(src) {
  const prefix = "/cartilla/art/faithful/";
  if (!src.startsWith(prefix) || !src.toLowerCase().endsWith(".webp")) return null;
  return src.slice(1);
}

export function deliveryRelativeFromSrc(src, width) {
  const canonical = canonicalRelativeFromSrc(src);
  if (!canonical) return null;
  return canonical.replace(
    "cartilla/art/faithful/",
    "cartilla/art/delivery/faithful/" + width + "/",
  );
}

function median(values) {
  if (!values.length) return 255;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function colorDistance(r, g, b, bg) {
  return Math.sqrt((r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2);
}

function borderIndices(width, height) {
  const out = [];
  const seen = new Set();
  const add = (x, y) => {
    const p = y * width + x;
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  };
  for (let x = 0; x < width; x++) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    add(0, y);
    add(width - 1, y);
  }
  return out;
}

function estimateBorderBackground(data, width, height) {
  const indices = borderIndices(width, height);
  const rs = [];
  const gs = [];
  const bs = [];
  for (const p of indices) {
    const i = p * 4;
    if (data[i + 3] <= ALPHA_EMPTY) continue;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  }
  if (!rs.length) {
    return { color: { r: 255, g: 255, b: 255 }, agreement: 0, paperLike: false };
  }
  const color = { r: median(rs), g: median(gs), b: median(bs) };
  let agreeing = 0;
  for (const p of indices) {
    const i = p * 4;
    if (data[i + 3] <= ALPHA_EMPTY) continue;
    if (colorDistance(data[i], data[i + 1], data[i + 2], color) <= 34) agreeing++;
  }
  const luminance = (color.r + color.g + color.b) / 3;
  const chroma = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
  return {
    color,
    agreement: agreeing / Math.max(1, rs.length),
    paperLike: luminance >= 188 && chroma <= 46 && agreeing / Math.max(1, rs.length) >= 0.55,
  };
}

function isBackgroundPixel(data, p, bg, threshold = 44) {
  const i = p * 4;
  if (data[i + 3] <= ALPHA_EMPTY) return true;
  const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
  return luminance >= 176 && colorDistance(data[i], data[i + 1], data[i + 2], bg) <= threshold;
}

function neighbors(p, width, height) {
  const x = p % width;
  const y = Math.floor(p / width);
  const out = [];
  if (x > 0) out.push(p - 1);
  if (x + 1 < width) out.push(p + 1);
  if (y > 0) out.push(p - width);
  if (y + 1 < height) out.push(p + width);
  return out;
}

function removeBorderBackground(data, width, height) {
  const estimated = estimateBorderBackground(data, width, height);
  const visited = new Uint8Array(width * height);
  const queue = [];
  for (const p of borderIndices(width, height)) {
    const i = p * 4;
    if (
      data[i + 3] <= ALPHA_EMPTY ||
      (estimated.paperLike && isBackgroundPixel(data, p, estimated.color))
    ) {
      visited[p] = 1;
      queue.push(p);
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q];
    for (const n of neighbors(p, width, height)) {
      if (visited[n]) continue;
      const i = n * 4;
      if (
        data[i + 3] <= ALPHA_EMPTY ||
        (estimated.paperLike && isBackgroundPixel(data, n, estimated.color))
      ) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  let removed = 0;
  for (let p = 0; p < visited.length; p++) {
    if (!visited[p]) continue;
    const i = p * 4;
    if (data[i + 3] > 0) removed++;
    data[i + 3] = 0;
  }

  if (estimated.paperLike) {
    const toClear = [];
    for (let p = 0; p < width * height; p++) {
      const i = p * 4;
      if (data[i + 3] <= ALPHA_EMPTY) continue;
      const touchesTransparency = neighbors(p, width, height).some(
        (n) => data[n * 4 + 3] <= ALPHA_EMPTY,
      );
      if (!touchesTransparency) continue;
      const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (
        luminance >= 205 &&
        colorDistance(data[i], data[i + 1], data[i + 2], estimated.color) <= 62
      ) {
        toClear.push(p);
      }
    }
    for (const p of toClear) {
      data[p * 4 + 3] = 0;
      removed++;
    }
  }

  return {
    data,
    backgroundRemoved: removed > 0,
    removedPixels: removed,
    estimatedBackground: estimated,
  };
}

function alphaBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let opaquePixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= ALPHA_EMPTY) continue;
      opaquePixels++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    opaquePixels,
  };
}

function cropForBounds(bounds, width, height) {
  if (!bounds) return { left: 0, top: 0, width, height, trimmed: false, touches: null };
  const touches = {
    left: bounds.x <= 2,
    top: bounds.y <= 2,
    right: bounds.x + bounds.width >= width - 2,
    bottom: bounds.y + bounds.height >= height - 2,
  };
  const left = touches.left ? 0 : Math.max(0, bounds.x - SAFE_PADDING);
  const top = touches.top ? 0 : Math.max(0, bounds.y - SAFE_PADDING);
  const right = touches.right ? width : Math.min(width, bounds.x + bounds.width + SAFE_PADDING);
  const bottom = touches.bottom ? height : Math.min(height, bounds.y + bounds.height + SAFE_PADDING);
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    trimmed: left > 0 || top > 0 || right < width || bottom < height,
    touches,
  };
}

function countInteriorTransparentPixels(data, width, height) {
  const outside = new Uint8Array(width * height);
  const queue = [];
  for (const p of borderIndices(width, height)) {
    if (data[p * 4 + 3] <= ALPHA_EMPTY) {
      outside[p] = 1;
      queue.push(p);
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q];
    for (const n of neighbors(p, width, height)) {
      if (outside[n] || data[n * 4 + 3] > ALPHA_EMPTY) continue;
      outside[n] = 1;
      queue.push(n);
    }
  }
  let interior = 0;
  for (let p = 0; p < width * height; p++) {
    if (data[p * 4 + 3] <= ALPHA_EMPTY && !outside[p]) interior++;
  }
  return interior;
}

function collectIllustrationSrcs(value, into = new Set()) {
  if (!value || typeof value !== "object") return into;
  if (Array.isArray(value)) {
    for (const item of value) collectIllustrationSrcs(item, into);
    return into;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "illustrationSrc" && typeof child === "string") into.add(child);
    else collectIllustrationSrcs(child, into);
  }
  return into;
}

function collectWiredFaithfulSrcs() {
  const into = new Set();
  for (const rel of [
    "src/content/consonants.json",
    "src/content/lessons.json",
    "src/data/page-layouts.json",
  ]) {
    const abs = path.join(rootDir, rel);
    if (fs.existsSync(abs)) collectIllustrationSrcs(readJson(abs), into);
  }
  const gallery = path.join(rootDir, "src", "content", "animal-gallery.ts");
  if (fs.existsSync(gallery)) {
    const text = fs.readFileSync(gallery, "utf8");
    const re = /["'\x60](\/cartilla\/art\/faithful\/[^"'\x60]+\.webp)["'\x60]/g;
    let match;
    while ((match = re.exec(text)) !== null) into.add(match[1]);
  }
  return [...into].filter((src) => canonicalRelativeFromSrc(src)).sort();
}

async function sourceDimensions(entry) {
  if (!entry.source || typeof entry.source !== "string") return null;
  const abs = path.join(rootDir, entry.source);
  if (!fs.existsSync(abs) || !/\.(png|jpe?g|webp)$/i.test(abs)) return null;
  const meta = await sharp(abs).metadata();
  return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
}

function cropBoxWarnings(entry, srcDim, canonicalDim) {
  const warnings = [];
  if (!Array.isArray(entry.cropBox) || entry.cropBox.length !== 4) return warnings;
  const values = entry.cropBox.map(Number);
  const x = values[0];
  const y = values[1];
  const w = values[2];
  const h = values[3];
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    warnings.push("invalid cropBox");
    return warnings;
  }
  if (srcDim && (x < 0 || y < 0 || x + w > srcDim.width || y + h > srcDim.height)) {
    warnings.push("cropBox exceeds source bounds " + srcDim.width + "x" + srcDim.height);
  }
  if (w < 32 || h < 32) warnings.push("suspiciously small cropBox " + w + "x" + h);
  if (canonicalDim && w >= 32 && h >= 32) {
    const cropRatio = w / h;
    const canonicalRatio = canonicalDim.width / canonicalDim.height;
    const drift = Math.abs(cropRatio - canonicalRatio) / Math.max(cropRatio, canonicalRatio);
    if (drift > 0.45) warnings.push("crop/canonical aspect drift " + Math.round(drift * 100) + "%");
  }
  return warnings;
}

async function processEntry(entry, checkOnly) {
  const relative = canonicalRelativeFromSrc(entry.src);
  if (!relative) return { skipped: true, entry };
  const canonicalAbs = path.join(publicDir, relative);
  if (!fs.existsSync(canonicalAbs)) {
    return {
      entry,
      missingCanonical: true,
      errors: [],
      warnings: [],
    };
  }

  const canonicalBytes = fs.readFileSync(canonicalAbs);
  const canonicalHash = crypto.createHash("sha256").update(canonicalBytes).digest("hex");
  const inputMeta = await sharp(canonicalBytes).metadata();
  const decoded = await sharp(canonicalBytes)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const width = decoded.info.width;
  const height = decoded.info.height;
  const cleaned = removeBorderBackground(Buffer.from(decoded.data), width, height);
  const bounds = alphaBounds(cleaned.data, width, height);
  const crop = cropForBounds(bounds, width, height);
  const interiorTransparentPixels = countInteriorTransparentPixels(cleaned.data, width, height);

  let normalized = sharp(cleaned.data, {
    raw: { width, height, channels: 4 },
  });
  if (crop.trimmed) {
    normalized = normalized.extract({
      left: crop.left,
      top: crop.top,
      width: crop.width,
      height: crop.height,
    });
  }
  const normalizedLossless = await normalized.webp({ lossless: true, alphaQuality: 100 }).toBuffer();
  const normalizedMeta = await sharp(normalizedLossless).metadata();

  const derivatives = [];
  for (const targetWidth of DELIVERY_WIDTHS) {
    const relOut = deliveryRelativeFromSrc(entry.src, targetWidth);
    const outAbs = path.join(publicDir, relOut);
    const out = await sharp(normalizedLossless)
      .resize({
        width: targetWidth,
        fit: "inside",
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
      .toBuffer();
    const meta = await sharp(out).metadata();
    if (!checkOnly) {
      fs.mkdirSync(path.dirname(outAbs), { recursive: true });
      fs.writeFileSync(outAbs, out);
    }
    derivatives.push({
      widthTier: targetWidth,
      path: "/" + relOut,
      width: meta.width,
      height: meta.height,
      bytes: out.length,
    });
  }

  const srcDim = await sourceDimensions(entry);
  const canonicalDim = { width, height };
  const warnings = cropBoxWarnings(entry, srcDim, canonicalDim);
  if (width < 64 || height < 64) warnings.push("low-resolution canonical " + width + "x" + height);
  if (crop.touches && Object.values(crop.touches).some(Boolean)) {
    warnings.push("visible content touches canonical crop edge; source recrop may be required");
  }

  return {
    slug: entry.slug ?? null,
    word: entry.word ?? null,
    lessonNumber: entry.lessonNumber ?? null,
    pageNumber: entry.pageNumber ?? null,
    sourcePage: entry.sourcePage ?? entry.sourceFlipchartPage ?? null,
    sourceAsset: entry.source ?? entry.sourceFlipchartPage ?? null,
    canonicalSrc: entry.src,
    canonical: {
      width,
      height,
      bytes: canonicalBytes.length,
      format: inputMeta.format ?? "webp",
      hasAlpha: Boolean(inputMeta.hasAlpha),
      sha256: canonicalHash,
    },
    cropBox: entry.cropBox ?? null,
    provenanceStatus: entry.provenanceStatus ?? null,
    cleanup: {
      backgroundRemoved: cleaned.backgroundRemoved,
      removedPixels: cleaned.removedPixels,
      estimatedBackground: cleaned.estimatedBackground,
      transparentPaddingTrimmed: crop.trimmed,
      normalizedWidth: normalizedMeta.width,
      normalizedHeight: normalizedMeta.height,
      contentBounds: bounds,
      touchesCropEdge: crop.touches,
      interiorTransparentPixels,
    },
    derivatives,
    warnings,
    errors: [],
  };
}

export async function prepareArtAssets({ checkOnly = false } = {}) {
  const manifest = readJson(sourceManifestPath);
  if (!Array.isArray(manifest)) throw new Error("faithful manifest must be an array");
  if (!checkOnly) fs.rmSync(deliveryDir, { recursive: true, force: true });

  const records = [];
  for (const entry of manifest) records.push(await processEntry(entry, checkOnly));

  const bySrc = new Map();
  const duplicateSrcs = [];
  for (const entry of manifest) {
    if (!entry || !entry.src) continue;
    if (bySrc.has(entry.src)) duplicateSrcs.push(entry.src);
    bySrc.set(entry.src, entry);
  }

  const wired = collectWiredFaithfulSrcs();
  const wiredSet = new Set(wired);
  const missingManifestMappings = wired.filter((src) => !bySrc.has(src));
  const missingCanonicalRecords = records.filter((record) => record.missingCanonical);
  const missingWiredCanonical = missingCanonicalRecords
    .map((record) => record.entry?.src)
    .filter((src) => src && wiredSet.has(src));

  const qaPath = path.join(faithfulDir, "qa-results.json");
  const qa = fs.existsSync(qaPath) ? readJson(qaPath) : { results: [] };
  const qaBySrc = new Map(
    (qa.results ?? []).map((result) => [
      "/" + String(result.file ?? "").replace(/^public\//, ""),
      result,
    ]),
  );
  const wiredQaFailures = wired
    .map((src) => ({ src, qa: qaBySrc.get(src) }))
    .filter(({ qa }) => !qa || qa.verdict !== "PASS");

  const hashGroups = new Map();
  for (const record of records) {
    if (!record?.canonical?.sha256) continue;
    const arr = hashGroups.get(record.canonical.sha256) ?? [];
    arr.push(record);
    hashGroups.set(record.canonical.sha256, arr);
  }
  const duplicateContent = [...hashGroups.values()]
    .filter((group) => group.length > 1)
    .map((group) =>
      group.map((record) => ({
        src: record.canonicalSrc,
        word: record.word,
        lessonNumber: record.lessonNumber,
      })),
    );

  const unresolvedSourceIssues = missingCanonicalRecords.map((record) => ({
    src: record.entry?.src ?? null,
    word: record.entry?.word ?? record.entry?.slug ?? null,
    lessonNumber: record.entry?.lessonNumber ?? null,
    sourceAsset: record.entry?.source ?? record.entry?.sourceFlipchartPage ?? null,
    provenanceStatus: record.entry?.provenanceStatus ?? null,
    reason: "Manifest record exists but no canonical production cutout is retained in the repository.",
  }));

  const errors = [
    ...records.flatMap((record) => record.errors ?? []),
    ...duplicateSrcs.map((src) => "duplicate manifest src " + src),
    ...missingManifestMappings.map((src) => "wired faithful art missing from manifest " + src),
    ...missingWiredCanonical.map((src) => "wired faithful art missing canonical file " + src),
    ...wiredQaFailures.map(({ src, qa }) =>
      qa
        ? "wired faithful art failed prior visual QA " + src + ": " + (qa.reason ?? qa.verdict)
        : "wired faithful art missing prior visual QA result " + src,
    ),
  ];
  const warnings = [
    ...records.flatMap((record) =>
      (record.warnings ?? []).map(
        (warning) => (record.canonicalSrc ?? record.entry?.src ?? "unknown") + ": " + warning,
      ),
    ),
    ...unresolvedSourceIssues.map(
      (issue) =>
        "unavailable source cutout (not wired): " +
        issue.src +
        (issue.sourceAsset ? " — source reference " + issue.sourceAsset : ""),
    ),
    ...duplicateContent.map(
      (group) =>
        "duplicate image bytes across mappings: " +
        group.map((x) => (x.word ?? "?") + "=" + x.src).join(", "),
    ),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    sourceManifest: "/cartilla/art/faithful/manifest.json",
    canonicalPolicy:
      "Canonical faithful WebP files remain untouched. Delivery derivatives are disposable build output.",
    counts: {
      manifestEntries: manifest.length,
      wiredProductionAssets: wired.length,
      processedCanonicalAssets: records.filter((record) => record.canonical).length,
      unavailableManifestAssets: unresolvedSourceIssues.length,
      wiredQaPass: wired.length - wiredQaFailures.length,
      backgroundCleaned: records.filter((record) => record.cleanup?.backgroundRemoved).length,
      paddingTrimmed: records.filter((record) => record.cleanup?.transparentPaddingTrimmed).length,
      edgeTouchWarnings: records.filter(
        (record) =>
          record.cleanup?.touchesCropEdge &&
          Object.values(record.cleanup.touchesCropEdge).some(Boolean),
      ).length,
      duplicateContentGroups: duplicateContent.length,
      errors: errors.length,
      warnings: warnings.length,
    },
    errors,
    warnings,
    duplicateContent,
    unresolvedSourceIssues,
    assets: records.filter((record) => record.canonical),
  };

  if (!checkOnly) writeJson(deliveryManifestPath, report);

  console.log("ART_ASSET_AUDIT " + JSON.stringify(report.counts));
  for (const warning of warnings) console.warn("ART_ASSET_WARNING " + warning);
  for (const error of errors) console.error("ART_ASSET_ERROR " + error);

  if (errors.length) {
    throw new Error("Asset preparation failed with " + errors.length + " error(s).");
  }
  return report;
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  prepareArtAssets({ checkOnly: process.argv.includes("--check") }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
