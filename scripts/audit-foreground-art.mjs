import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const manifest = read("public/cartilla/art/faithful/manifest.json");
const qaResults = read("public/cartilla/art/faithful/qa-results.json");
const quarantine = read("public/cartilla/art/faithful/quarantine.json");
const flipchartNative = read("src/data/flipchart-native-assets.json");

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

    const pad = String(slot.sourcePage).padStart(3, "0");
    const bgRel = `public/cartilla/backgrounds/final/flipchart/FlipChart_Page_${pad}.png`;
    const hdRel = `public/cartilla/art/hd/flipchart/page-${pad}.jpg`;
    const heroRel = `public/cartilla/art/faithful/flipchart/flipchart-p${pad}-hero.webp`;

    const bgPath = path.join(root, bgRel);
    const hdPath = path.join(root, hdRel);
    const heroPath = path.join(root, heroRel);

    const bgExists = fs.existsSync(bgPath);
    const hdExists = fs.existsSync(hdPath);
    const heroExists = fs.existsSync(heroPath);

    const sourceMaterialExists = bgExists || hdExists || heroExists;

    let hasValidSourceCrop = false;
    let sourceMaterialFile = null;

    if (hasCropEvidence && sourceMaterialExists) {
      const [left, top, width, height] = slot.crop.map(Number);

      if (bgExists) {
        const meta = await sharp(bgPath).metadata();
        if (left >= 0 && top >= 0 && left + width <= meta.width && top + height <= meta.height) {
          hasValidSourceCrop = true;
          sourceMaterialFile = bgRel;
        }
      }
      if (!hasValidSourceCrop && hdExists) {
        const meta = await sharp(hdPath).metadata();
        if (left >= 0 && top >= 0 && left + width <= meta.width && top + height <= meta.height) {
          hasValidSourceCrop = true;
          sourceMaterialFile = hdRel;
        }
      }
      if (!hasValidSourceCrop && heroExists) {
        const meta = await sharp(heroPath).metadata();
        if (left >= 0 && top >= 0 && left + width <= meta.width && top + height <= meta.height) {
          hasValidSourceCrop = true;
          sourceMaterialFile = heroRel;
        }
      }
    }

    const isVerified = exists && sourcePageMatches && hasCropEvidence && sourceMaterialExists && hasValidSourceCrop;
    const category = isVerified ? "PASS" : "PENDING NO VERIFIED SOURCE";

    const missingEvidenceParts = [];
    if (!exists) missingEvidenceParts.push("missing output file");
    if (!sourcePageMatches) missingEvidenceParts.push("sourcePage does not match page");
    if (!hasCropEvidence) missingEvidenceParts.push("invalid or missing crop coordinates");
    if (!sourceMaterialExists) missingEvidenceParts.push("missing repository source material file");
    if (hasCropEvidence && sourceMaterialExists && !hasValidSourceCrop) missingEvidenceParts.push("crop bounds exceed source material dimensions");

    const missingEvidence = missingEvidenceParts.length > 0 ? missingEvidenceParts.join("; ") : null;

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
      verified: isVerified,
      sourcePageMatches,
      hasCropEvidence,
      sourceMaterialExists,
      hasValidSourceCrop,
      sourceMaterialFile,
      missingEvidence,
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
