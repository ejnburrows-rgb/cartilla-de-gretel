import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const manifest = read("public/cartilla/art/faithful/manifest.json");
const qaResults = read("public/cartilla/art/faithful/qa-results.json");
const quarantine = read("public/cartilla/art/faithful/quarantine.json");
const flipchartNative = read("src/data/flipchart-native-assets.json");

const manifestBySrc = new Map(manifest.filter((m) => m.src).map((m) => [m.src, m]));
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

const galleryText = fs.readFileSync(path.join(root, "src/content/animal-gallery.ts"), "utf8");
const re = /["'](\/cartilla\/art\/faithful\/[^"']+\.webp)["']/g;
let match;
while ((match = re.exec(galleryText)) !== null) {
  wiredFaithfulSrcs.add(match[1]);
}

const flipchartNativeSlots = [];
for (const [pageKey, assets] of Object.entries(flipchartNative)) {
  for (const a of assets) {
    flipchartNativeSlots.push({
      page: pageKey,
      word: a.word,
      src: a.src,
      crop: a.crop,
    });
  }
}

async function audit() {
  const faithfulAudit = [];
  for (const src of Array.from(wiredFaithfulSrcs).sort()) {
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

    let category = "PASS";
    if (!exists) {
      category = "PENDING NO VERIFIED SOURCE";
    } else if (
      prov.includes("RECOLORED") ||
      prov.includes("BACKFILLED") ||
      prov.includes("COLOR-TRANSFER")
    ) {
      category = "VERIFIED COLOR TRANSFER";
    } else if (prov.includes("FIXED") && prov.includes("CROP")) {
      category = "CROP FIX";
    } else if (quarantinedSrcs.has(src) || qaVerdict === "FAIL") {
      category = "WRONG SOURCE";
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

    nativeAudit.push({
      src: slot.src,
      word: slot.word,
      page: slot.page,
      classification: exists ? "PASS" : "PENDING NO VERIFIED SOURCE",
      dimensions,
      bytes,
      exists,
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

  fs.writeFileSync(
    path.join(root, "docs", "production-art-classification-audit.json"),
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
  console.log("Wrote classification audit to docs/production-art-classification-audit.json");
}

audit().catch(console.error);
