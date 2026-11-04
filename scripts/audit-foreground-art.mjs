import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const manifest = read("public/cartilla/art/faithful/manifest.json");
const qaResults = read("public/cartilla/art/faithful/qa-results.json");
const quarantine = read("public/cartilla/art/faithful/quarantine.json");
const flipchartNative = read("src/data/flipchart-native-assets.json");
const flipchartFrames = read("src/data/flipchart-frames.json");

// Deterministic Flip Chart-native provenance check. Declared source-page/crop
// metadata alone is not proof, so each output is compared pixel-for-pixel with
// the crop of its declared HD source page. Only an affirmative match passes;
// anything that cannot be proven stays pending.
const NATIVE_MATCH_SIZE = 256;
const NATIVE_NCC_THRESHOLD = 0.95;
const NATIVE_MEAN_DIFF_THRESHOLD = 8;
const NATIVE_ASPECT_TOLERANCE = 0.02;

function meanAbsoluteDifference(a, b) {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(a[i] - b[i]);
  return sum / n;
}

function normalizedCrossCorrelation(a, b) {
  const n = Math.min(a.length, b.length);
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < n; i++) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= n;
  meanB /= n;
  let numerator = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    numerator += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  if (denomA === 0 || denomB === 0) return 0;
  return numerator / (Math.sqrt(denomA) * Math.sqrt(denomB));
}

async function nativeCropEvidence(slot, localPath) {
  const pending = (reason) => ({
    cropMatch: false,
    aspectMatch: false,
    matchScore: null,
    meanDiff: null,
    evidence: null,
    pendingReason: reason,
  });
  const pageNumber = Number(slot.sourcePage);
  const frame = flipchartFrames[String(pageNumber)];
  const sourceRel = `public/cartilla/art/hd/flipchart/page-${String(pageNumber).padStart(3, "0")}.jpg`;
  const sourcePath = path.join(root, sourceRel);
  if (!frame || !fs.existsSync(sourcePath)) {
    return pending(!frame ? "no declared page frame" : `missing HD source page ${sourceRel}`);
  }
  const [bx, by, bw, bh] = slot.crop.map(Number);
  if (!(bw > 0 && bh > 0)) return pending("declared crop has no positive area");
  const sourceMeta = await sharp(sourcePath).metadata();
  const sourceWidth = sourceMeta.width ?? 0;
  const sourceHeight = sourceMeta.height ?? 0;
  const sx = sourceWidth / Number(frame.width);
  const sy = sourceHeight / Number(frame.height);
  const left = Math.max(0, Math.round(bx * sx));
  const top = Math.max(0, Math.round(by * sy));
  const width = Math.min(Math.round(bw * sx), sourceWidth - left);
  const height = Math.min(Math.round(bh * sy), sourceHeight - top);
  if (width < 2 || height < 2) {
    return pending("declared crop falls outside the HD source page");
  }
  const cropAspect = width / height;
  const outMeta = await sharp(localPath).metadata();
  const outAspect = (outMeta.width ?? 0) / (outMeta.height ?? 0);
  const aspectMatch =
    outAspect > 0 && Math.abs(Math.log(outAspect / cropAspect)) < NATIVE_ASPECT_TOLERANCE;
  const size = NATIVE_MATCH_SIZE;
  const sourceSample = await sharp(sourcePath)
    .extract({ left, top, width, height })
    .resize(size, size, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .greyscale()
    .raw()
    .toBuffer();
  const outputSample = await sharp(localPath)
    .resize(size, size, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .greyscale()
    .raw()
    .toBuffer();
  const ncc = normalizedCrossCorrelation(sourceSample, outputSample);
  const meanDiff = meanAbsoluteDifference(sourceSample, outputSample);
  const cropMatch =
    aspectMatch && ncc >= NATIVE_NCC_THRESHOLD && meanDiff <= NATIVE_MEAN_DIFF_THRESHOLD;
  const aspectDelta = Math.abs(Math.log(outAspect / cropAspect));
  return {
    cropMatch,
    aspectMatch,
    matchScore: Math.round(ncc * 100),
    meanDiff: Math.round(meanDiff * 10) / 10,
    evidence: cropMatch
      ? `deterministic crop correspondence (ncc ${ncc.toFixed(3)}, mean diff ${meanDiff.toFixed(1)}, aspect delta ${aspectDelta.toFixed(4)})`
      : null,
    pendingReason: cropMatch
      ? null
      : `no deterministic crop correspondence (ncc ${ncc.toFixed(3)}, mean diff ${meanDiff.toFixed(1)}, aspectMatch ${aspectMatch})`,
  };
}

const manifestBySrc = new Map(manifest.filter((m) => m && m.src).map((m) => [m.src, m]));
const qaBySrc = new Map((qaResults.results || []).map((q) => [q.file.replace("public/", "/"), q]));
const quarantinedSrcs = new Set((quarantine.assets || []).map((q) => q.src));

const wiredFaithfulSrcs = new Set();
const searchObj = (obj) => {
  if (typeof obj === "string" && obj.startsWith("/cartilla/art/faithful/")) {
    wiredFaithfulSrcs.add(obj);
  } else if (obj && typeof obj === "object") {
    for (const v of Object.values(obj)) searchObj(v);
  }
};

searchObj(read("src/data/page-layouts.json"));
searchObj(read("src/content/lessons.json"));
searchObj(read("src/content/consonants.json"));
searchObj(read("src/data/flipchart-production-art.json"));
if (fs.existsSync(path.join(root, "src/content/picture-vocabulary.json"))) {
  searchObj(read("src/content/picture-vocabulary.json"));
}

function scanTs(rel) {
  const fullPath = path.join(root, rel);
  if (!fs.existsSync(fullPath)) return;
  const text = fs.readFileSync(fullPath, "utf8");
  const matches = text.match(/\/cartilla\/art\/faithful\/[^\x22\x27\x60]+\.webp/g) || [];
  for (const m of matches) {
    wiredFaithfulSrcs.add(m);
  }
}

scanTs("src/content/animal-gallery.ts");
scanTs("src/lib/living-actor-registry.ts");
scanTs("src/lib/living-blink-map.ts");
scanTs("src/lib/living-art-runtime.ts");

// Keep required-but-missing motion evidence visible without wiring broken runtime assets.
for (const src of [
  "/cartilla/art/faithful/leccion-7-m/mono-blink.webp",
  "/cartilla/art/faithful/leccion-9-s/sapo-blink.webp",
]) {
  wiredFaithfulSrcs.add(src);
}

const flipchartNativeSlots = [];
const sortedNativeEntries = Object.entries(flipchartNative).sort(
  ([a], [b]) => Number(a) - Number(b),
);

for (const [pageKey, assets] of sortedNativeEntries) {
  for (const a of assets) {
    flipchartNativeSlots.push({
      page: pageKey,
      word: a.word,
      src: a.src,
      sourcePage: a.sourcePage,
      crop: a.crop,
      verified: a.verified === true,
    });
  }
}

async function audit() {
  const sortedWiredSrcs = Array.from(wiredFaithfulSrcs).sort((a, b) => a.localeCompare(b));
  const faithfulAudit = [];

  for (const src of sortedWiredSrcs) {
    const localPath = path.join(root, "public", src.slice(1));
    const exists = fs.existsSync(localPath);
    const m = manifestBySrc.get(src) || {};
    const q = qaBySrc.get(src) || {};
    const prov = m.provenanceStatus || "";
    const qaVerdict = q.verdict || "";

    let dimensions = "0x0";
    let bytes = 0;
    if (exists) {
      const meta = await sharp(localPath).metadata();
      dimensions = `${meta.width}x${meta.height}`;
      bytes = fs.statSync(localPath).size;
    }

    const sourceNote = String(m.note || m.sourceNote || "");
    const explicitlyNeedsVerification = /(?:re-?verify|verify existing|needs? verification)/i.test(sourceNote);

    let category = "PENDING NO VERIFIED SOURCE";
    if (!exists || explicitlyNeedsVerification) {
      category = "PENDING NO VERIFIED SOURCE";
    } else if (quarantinedSrcs.has(src) || qaVerdict === "FAIL") {
      category = "WRONG SOURCE";
    } else if (prov.includes("RECOLORED") || prov.includes("COLOR-TRANSFER")) {
      category = "VERIFIED COLOR TRANSFER";
    } else if (prov.includes("FIXED") && prov.includes("CROP")) {
      category = "CROP FIX";
    } else if (
      qaVerdict === "PASS" &&
      (prov.includes("VERIFIED") ||
        prov.includes("BACKFILLED") ||
        prov.includes("RECOVERED") ||
        prov.includes("QA-PASS") ||
        Boolean(m.sourceFlipchartPage))
    ) {
      category = "PASS";
    } else {
      category = "PENDING NO VERIFIED SOURCE";
    }

    faithfulAudit.push({
      src,
      word: m.word || m.slug || path.basename(src, ".webp"),
      classification: category,
      provenance: prov,
      qaVerdict,
      dimensions,
      bytes,
      isQuarantined: quarantinedSrcs.has(src),
    });
  }

  const nativeAudit = [];
  for (const slot of flipchartNativeSlots) {
    const localPath = path.join(root, "public", slot.src.slice(1));
    const exists = fs.existsSync(localPath);
    let dimensions = "0x0";
    let bytes = 0;
    if (exists) {
      const meta = await sharp(localPath).metadata();
      dimensions = `${meta.width}x${meta.height}`;
      bytes = fs.statSync(localPath).size;
    }

    const sourcePageMatches = Number(slot.sourcePage) === Number(slot.page);
    const hasCropEvidence =
      Array.isArray(slot.crop) &&
      slot.crop.length === 4 &&
      slot.crop.map(Number).every(Number.isFinite) &&
      Number(slot.crop[2]) > 0 &&
      Number(slot.crop[3]) > 0;

    // Only a deterministic source-crop-to-output comparison can prove provenance.
    const evidence = exists
      ? await nativeCropEvidence(slot, localPath)
      : { cropMatch: false, aspectMatch: false, matchScore: null, meanDiff: null, evidence: null, pendingReason: "output file missing" };

    let category = "PENDING NO VERIFIED SOURCE";
    if (exists && evidence.cropMatch) {
      category = "PASS";
    }

    nativeAudit.push({
      src: slot.src,
      word: slot.word,
      page: slot.page,
      sourcePage: slot.sourcePage,
      crop: slot.crop,
      classification: category,
      dimensions,
      bytes,
      exists,
      verified: slot.verified,
      sourcePageMatches,
      hasCropEvidence,
      cropMatch: evidence.cropMatch,
      aspectMatch: evidence.aspectMatch,
      matchScore: evidence.matchScore,
      meanDiff: evidence.meanDiff,
      evidence: evidence.evidence,
      pendingReason: evidence.pendingReason,
    });
  }

  const breakdownFaithful = {};
  for (const a of faithfulAudit) {
    breakdownFaithful[a.classification] = (breakdownFaithful[a.classification] || 0) + 1;
  }

  const breakdownNative = {};
  for (const a of nativeAudit) {
    breakdownNative[a.classification] = (breakdownNative[a.classification] || 0) + 1;
  }

  console.log("Faithful Foreground Audit Breakdown:", breakdownFaithful);
  console.log("Flipchart Native Audit Breakdown:", breakdownNative);

  const outputPath = process.env.ART_AUDIT_OUTPUT
    ? path.resolve(process.env.ART_AUDIT_OUTPUT)
    : path.join(root, "docs", "production-art-classification-audit.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        counts: {
          faithfulWired: faithfulAudit.length,
          flipchartNativeWired: nativeAudit.length,
          breakdownFaithful,
          breakdownNative,
        },
        faithfulAudit,
        nativeAudit,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote classification audit to ${path.relative(root, outputPath) || outputPath}`);
}

audit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
