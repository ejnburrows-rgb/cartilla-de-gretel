import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const inputPath = getArg("--input");
const wordTarget = getArg("--word") || getArg("--target");
const dryRun = args.includes("--dry-run");

if (!inputPath) {
  console.error("Usage: node scripts/replace-and-purge-single-art.mjs --input <image-path> [--word <word-or-target>] [--dry-run]");
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`Error: input file not found at ${inputPath}`);
  process.exit(1);
}

function sha256File(file) {
  const buf = fs.readFileSync(file);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function norm(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function main() {
  const target = norm(wordTarget || path.basename(inputPath, path.extname(inputPath)));
  console.log(`Processing single-source replacement for target: "${target}" from input: "${inputPath}"`);

  // Special case: Splash Screen Cover
  if (target === "cover" || target === "splash_cover" || target === "portada") {
    const coverDest = path.join(rootDir, "public", "cartilla", "images", "cover.png");
    console.log(`Target is Splash Screen Cover -> Destination: ${coverDest}`);

    const oldSha = fs.existsSync(coverDest) ? sha256File(coverDest) : null;
    const img = sharp(inputPath);
    const meta = await img.metadata();
    console.log(`Input dimensions: ${meta.width}x${meta.height}, format: ${meta.format}`);

    if (!dryRun) {
      fs.mkdirSync(path.dirname(coverDest), { recursive: true });
      await img.png({ quality: 95 }).toFile(coverDest + ".tmp");
      fs.renameSync(coverDest + ".tmp", coverDest);
      const newSha = sha256File(coverDest);
      console.log(`Successfully replaced cover! Old SHA: ${oldSha}, New SHA: ${newSha}`);

      // Log replacement
      logAudit({
        type: "COVER_REPLACEMENT",
        target: "cover",
        oldPath: coverDest,
        oldSha,
        newPath: coverDest,
        newSha,
        inputSource: inputPath,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log("[DRY-RUN] Would replace cover.png");
    }
    return;
  }

  // Look up Drawing Group and faithful destination
  const faithfulManifestPath = path.join(rootDir, "public", "cartilla", "art", "faithful", "manifest.json");
  const faithfulManifest = JSON.parse(fs.readFileSync(faithfulManifestPath, "utf8"));

  let faithfulEntry = faithfulManifest.find(e => norm(e.slug) === target || norm(e.word) === target);

  // If not in faithful manifest, search MASTER-MAPPING.csv
  const masterMappingPath = path.join(rootDir, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv");
  const csvLines = fs.readFileSync(masterMappingPath, "utf8").split("\n").filter(Boolean);
  const matchingCsvRows = [];
  for (let i = 1; i < csvLines.length; i++) {
    const row = csvLines[i];
    const parts = row.split(",");
    const label = norm(parts[5]);
    if (label === target || parts[0].toLowerCase().includes(target)) {
      matchingCsvRows.push({
        artworkId: parts[0],
        book: parts[1],
        pageSheet: parts[2],
        lessonItem: parts[3],
        drawingGroupId: parts[4],
        drawingLabel: parts[5],
        destPath: parts[10]
      });
    }
  }

  console.log(`Found ${matchingCsvRows.length} matching placements in MASTER-MAPPING.csv`);

  // Determine canonical destination in faithful
  let canonicalRelative = null;
  if (faithfulEntry) {
    canonicalRelative = faithfulEntry.src.replace(/^\//, "");
  } else if (matchingCsvRows.length > 0 && matchingCsvRows[0].destPath && matchingCsvRows[0].destPath.startsWith("public/cartilla/art/faithful/")) {
    canonicalRelative = matchingCsvRows[0].destPath.replace(/^public\//, "");
  } else {
    // Determine appropriate subfolder
    canonicalRelative = `cartilla/art/faithful/reconciled/${target}.webp`;
  }

  const canonicalAbs = path.join(rootDir, "public", canonicalRelative);
  console.log(`Canonical master location: ${canonicalAbs}`);

  // Sharp processing: Master WebP
  const img = sharp(inputPath);
  const meta = await img.metadata();
  console.log(`Input dimensions: ${meta.width}x${meta.height}, format: ${meta.format}, hasAlpha: ${meta.hasAlpha}`);

  // Collect obsolete files to purge
  const filesToPurge = new Set();
  matchingCsvRows.forEach(r => {
    if (r.destPath && fs.existsSync(path.join(rootDir, r.destPath))) {
      const p = path.resolve(rootDir, r.destPath);
      if (p !== canonicalAbs && !p.includes("cartilla/art/delivery/")) {
        filesToPurge.add(p);
      }
    }
  });

  // Check old crops inventory for obsolete files
  const oldCropsPath = path.join(rootDir, "docs", "art-board", "old-crops-replacement-inventory.json");
  if (fs.existsSync(oldCropsPath)) {
    const oldCrops = JSON.parse(fs.readFileSync(oldCropsPath, "utf8"));
    oldCrops.forEach(item => {
      if (norm(item.word) === target) {
        if (item.currentFile && fs.existsSync(path.join(rootDir, item.currentFile))) {
          const abs = path.resolve(rootDir, item.currentFile);
          if (abs !== canonicalAbs && !abs.includes("cartilla/art/delivery/")) {
            filesToPurge.add(abs);
          }
        }
      }
    });
  }

  if (dryRun) {
    console.log("[DRY-RUN] Would write canonical master:", canonicalAbs);
    console.log("[DRY-RUN] Would purge files:", Array.from(filesToPurge));
    return;
  }

  // 1. Write Canonical Master
  fs.mkdirSync(path.dirname(canonicalAbs), { recursive: true });
  await sharp(inputPath).webp({ quality: 92, lossless: false }).toFile(canonicalAbs + ".tmp");
  fs.renameSync(canonicalAbs + ".tmp", canonicalAbs);
  const newMasterSha = sha256File(canonicalAbs);
  console.log(`Wrote canonical master (SHA256: ${newMasterSha})`);

  // 2. Generate Delivery Tiers (384 and 768)
  const deliveryTiers = [384, 768];
  for (const w of deliveryTiers) {
    const delRel = canonicalRelative.replace("cartilla/art/faithful/", `cartilla/art/delivery/faithful/${w}/`);
    const delAbs = path.join(rootDir, "public", delRel);
    fs.mkdirSync(path.dirname(delAbs), { recursive: true });
    await sharp(canonicalAbs).resize({ width: w, withoutEnlargement: true }).webp({ quality: 88 }).toFile(delAbs + ".tmp");
    fs.renameSync(delAbs + ".tmp", delAbs);
    console.log(`Generated delivery tier ${w}w: ${delRel} (SHA256: ${sha256File(delAbs)})`);
  }

  // 3. Update faithful manifest
  if (!faithfulEntry) {
    faithfulEntry = {
      slug: target,
      word: wordTarget || target,
      lessonNumber: null,
      pageNumber: null,
      src: "/" + canonicalRelative.replace(/\\/g, "/"),
      sourceFlipchartPage: null,
      cropBox: null,
      provenanceStatus: "VERIFIED-OWNER-INTAKE-" + new Date().toISOString().slice(0, 10)
    };
    faithfulManifest.push(faithfulEntry);
  } else {
    faithfulEntry.provenanceStatus = "VERIFIED-OWNER-INTAKE-" + new Date().toISOString().slice(0, 10);
  }
  fs.writeFileSync(faithfulManifestPath, JSON.stringify(faithfulManifest, null, 2) + "\n");

  // 4. Update old-crops inventory if target was listed
  if (fs.existsSync(oldCropsPath)) {
    const oldCrops = JSON.parse(fs.readFileSync(oldCropsPath, "utf8"));
    let updated = false;
    oldCrops.forEach(item => {
      if (norm(item.word) === target) {
        item.status = "RESOLVED";
        item.resolvedAt = new Date().toISOString();
        item.resolvedSource = inputPath;
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(oldCropsPath, JSON.stringify(oldCrops, null, 2) + "\n");
      console.log(`Updated status in old-crops-replacement-inventory.json to RESOLVED`);
    }
  }

  // 5. Update board-data.json
  const boardDataPath = path.join(rootDir, "docs", "art-board", "board-data.json");
  if (fs.existsSync(boardDataPath)) {
    const boardData = JSON.parse(fs.readFileSync(boardDataPath, "utf8"));
    let boardUpdated = false;
    if (Array.isArray(boardData.placements)) {
      boardData.placements.forEach(p => {
        if (norm(p.label) === target || norm(p.word) === target) {
          p.resolved = true;
          p.canonicalSrc = "/" + canonicalRelative.replace(/\\/g, "/");
          boardUpdated = true;
        }
      });
    }
    if (boardUpdated) {
      fs.writeFileSync(boardDataPath, JSON.stringify(boardData, null, 2) + "\n");
      console.log(`Updated board-data.json references`);
    }
  }

  // 6. Purge Obsolete Crops & Log
  const purgedList = [];
  for (const oldFile of filesToPurge) {
    if (fs.existsSync(oldFile)) {
      const oldSha = sha256File(oldFile);
      fs.unlinkSync(oldFile);
      purgedList.push({ file: path.relative(rootDir, oldFile), sha: oldSha });
      console.log(`PURGED obsolete crop file: ${path.relative(rootDir, oldFile)}`);
    }
  }

  // 7. Write Audit Log
  logAudit({
    type: "SINGLE_ART_REPLACEMENT_AND_PURGE",
    target,
    inputSource: inputPath,
    canonicalMaster: canonicalRelative,
    canonicalSha: newMasterSha,
    purgedFiles: purgedList,
    affectedPlacementsCount: matchingCsvRows.length,
    timestamp: new Date().toISOString()
  });

  console.log(`Replacement and simultaneous purge complete for: "${target}"!`);
}

function logAudit(entry) {
  const logPath = path.join(rootDir, "docs", "art-board", "deleted-obsolete-crops-log.json");
  let log = [];
  if (fs.existsSync(logPath)) {
    try {
      log = JSON.parse(fs.readFileSync(logPath, "utf8"));
    } catch {
      log = [];
    }
  }
  log.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
}

main().catch(err => {
  console.error("Replacement script error:", err);
  process.exit(1);
});
