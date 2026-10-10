import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(__dirname, "..");

export const DELIVERY_WIDTHS = [384, 768];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

export function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "");
}

/**
  Identifies current faithful rows and their source verification status.
 */
export function identifyTargetSlots(root = rootDir) {
  const manifestPath = path.join(root, "public", "cartilla", "art", "faithful", "manifest.json");
  const qaPath = path.join(root, "public", "cartilla", "art", "faithful", "qa-results.json");
  const quarantinePath = path.join(
    root,
    "public",
    "cartilla",
    "art",
    "faithful",
    "quarantine.json",
  );

  const manifest = fs.existsSync(manifestPath) ? readJson(manifestPath) : [];
  const qa = fs.existsSync(qaPath) ? readJson(qaPath) : { results: [] };
  const quarantine = fs.existsSync(quarantinePath) ? readJson(quarantinePath) : { assets: [] };

  const qaBySrc = new Map(
    (qa.results || []).map((q) => [String(q.file ?? "").replace(/^public\//, "/"), q]),
  );
  const quarantinedSrcs = new Set((quarantine.assets || []).map((q) => q.src));

  return manifest.map((entry) => {
    const src = entry.src;
    const localPath = path.join(root, "public", src.replace(/^\//, ""));
    const exists = fs.existsSync(localPath);
    const q = qaBySrc.get(src) || {};
    const prov = String(entry.provenanceStatus || "");
    const qaVerdict = String(q.verdict || "");
    const sourceNote = String(entry.note || entry.sourceNote || "");
    const explicitlyNeedsVerification = /(?:re-?verify|verify existing|needs? verification)/i.test(
      sourceNote,
    );

    let classification = "PENDING NO VERIFIED SOURCE";
    let isVerified = false;

    if (!exists || explicitlyNeedsVerification) {
      classification = "PENDING NO VERIFIED SOURCE";
      isVerified = false;
    } else if (quarantinedSrcs.has(src) || qaVerdict === "FAIL") {
      classification = "WRONG SOURCE";
      isVerified = false;
    } else if (prov.includes("RECOLORED") || prov.includes("COLOR-TRANSFER")) {
      classification = "VERIFIED COLOR TRANSFER";
      isVerified = true;
    } else if (prov.includes("FIXED") && prov.includes("CROP")) {
      classification = "CROP FIX";
      isVerified = true;
    } else if (
      qaVerdict === "PASS" &&
      (prov.includes("VERIFIED") ||
        prov.includes("BACKFILLED") ||
        prov.includes("RECOVERED") ||
        prov.includes("QA-PASS") ||
        Boolean(entry.sourceFlipchartPage))
    ) {
      classification = "PASS";
      isVerified = true;
    } else {
      classification = "PENDING NO VERIFIED SOURCE";
      isVerified = false;
    }

    return {
      src,
      word: entry.word || entry.slug || path.basename(src, ".webp"),
      slug: entry.slug || norm(entry.word),
      lessonNumber: entry.lessonNumber ?? null,
      pageNumber: entry.pageNumber ?? null,
      localPath,
      exists,
      isVerified,
      classification,
      provenanceStatus: prov,
      qaVerdict,
      manifestEntry: entry,
    };
  });
}

/**
  Performs image sanity checks using Sharp.
 */
export async function verifySuppliedImage(filePath, targetSlot, options = {}) {
  const { allowOverwriteVerified = false, root = rootDir } = options;

  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      reason: "FILE_NOT_FOUND",
      details: "Supplied image file does not exist.",
    };
  }

  // Target path sanity check
  const resolvedTarget = path.resolve(root, "public", targetSlot.src.replace(/^\//, ""));
  const allowedBase = path.resolve(root, "public", "cartilla", "art");
  if (!resolvedTarget.startsWith(allowedBase + path.sep)) {
    return {
      valid: false,
      reason: "UNSAFE_TARGET_PATH",
      details: `Target path ${targetSlot.src} is outside public/cartilla/art.`,
    };
  }

  // Overwrite protection
  if (targetSlot.isVerified && !allowOverwriteVerified) {
    return {
      valid: false,
      reason: "BLOCKED_VERIFIED_OVERWRITE",
      details: `Slot ${targetSlot.src} is already verified (${targetSlot.classification}). Explicit --allow-overwrite-verified required.`,
    };
  }

  // Image decode & dimensions sanity check
  let metadata;
  let decoded;
  try {
    const fileBytes = fs.readFileSync(filePath);
    metadata = await sharp(fileBytes).metadata();
    decoded = await sharp(fileBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  } catch (err) {
    return {
      valid: false,
      reason: "FAILED_DECODE",
      details: `Failed to decode image file: ${err.message}`,
    };
  }

  const width = decoded.info.width;
  const height = decoded.info.height;

  if (!width || !height || width < 32 || height < 32) {
    return {
      valid: false,
      reason: "FAILED_DIMENSIONS",
      details: `Invalid dimensions ${width}x${height}. Minimum size is 32x32.`,
    };
  }

  // Transparency & crop sanity check
  const data = decoded.data;
  let opaquePixels = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        opaquePixels++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (opaquePixels === 0 || maxX < 0) {
    return {
      valid: false,
      reason: "FAILED_TRANSPARENCY_CROP",
      details: "Image contains no visible opaque content (all transparent).",
    };
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;

  if (contentWidth < 8 || contentHeight < 8) {
    return {
      valid: false,
      reason: "FAILED_TRANSPARENCY_CROP",
      details: `Opaque content box is too small (${contentWidth}x${contentHeight}).`,
    };
  }

  return {
    valid: true,
    metadata: {
      width,
      height,
      format: metadata.format,
      opaquePixels,
      contentBounds: { x: minX, y: minY, width: contentWidth, height: contentHeight },
    },
  };
}

/**
  Main package intake validator & importer.
 */
export async function processOwnerArtIntake(options = {}) {
  const {
    packagePath,
    mappingPath,
    explicitMappings,
    dryRun = true,
    allowOverwriteVerified = false,
    root = rootDir,
  } = options;

  if (!packagePath || !fs.existsSync(packagePath)) {
    throw new Error(`Owner art package path not found: ${packagePath}`);
  }

  const allSlots = identifyTargetSlots(root);
  const slotsBySrc = new Map(allSlots.map((s) => [s.src, s]));
  const slotsByWord = new Map();
  for (const s of allSlots) {
    const keys = new Set([s.slug, norm(s.word)].filter(Boolean));
    for (const key of keys) {
      const list = slotsByWord.get(key) || [];
      list.push(s);
      slotsByWord.set(key, list);
    }
  }

  // Handle extracted package directory or zip file
  let tempExtractDir = null;
  let packageDir = packagePath;

  if (fs.statSync(packagePath).isFile()) {
    if (!packagePath.toLowerCase().endsWith(".zip")) {
      throw new Error("Owner package file must be a .zip archive or a directory.");
    }
    tempExtractDir = path.join(root, ".cartilla-art-intake-temp", crypto.randomUUID());
    fs.mkdirSync(tempExtractDir, { recursive: true });
    execFileSync("tar", ["-xf", packagePath, "-C", tempExtractDir]);
    packageDir = tempExtractDir;
  }

  try {
    // Determine mapping entries
    let rawMappings = explicitMappings || null;

    if (!rawMappings && mappingPath && fs.existsSync(mappingPath)) {
      const parsed = readJson(mappingPath);
      rawMappings = Array.isArray(parsed) ? parsed : parsed.mappings || null;
    }

    const packageMappingFile = path.join(packageDir, "mapping.json");
    if (!rawMappings && fs.existsSync(packageMappingFile)) {
      const parsed = readJson(packageMappingFile);
      rawMappings = Array.isArray(parsed) ? parsed : parsed.mappings || null;
    }

    // List all image files in package
    function listFilesRecursive(dir, base = "") {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const rel = path.join(base, entry.name);
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(listFilesRecursive(abs, rel));
        } else if (/\.(png|jpe?g|webp)$/i.test(entry.name) && entry.name !== "mapping.json") {
          results.push(rel);
        }
      }
      return results;
    }

    const packageFiles = listFilesRecursive(packageDir);

    // Resolve mappings
    const resolvedMappings = [];
    const ambiguousMappings = [];
    const unmappedFiles = [];

    if (rawMappings && Array.isArray(rawMappings)) {
      // Explicit mappings provided
      for (const mapEntry of rawMappings) {
        const relFile = mapEntry.file || mapEntry.filename || mapEntry.path;
        if (!relFile) continue;

        const absFile = path.join(packageDir, relFile);
        let targetSlot = null;

        if (mapEntry.slot || mapEntry.src) {
          const slotSrc = String(mapEntry.slot || mapEntry.src);
          const normalizedSrc = slotSrc.startsWith("/") ? slotSrc : "/" + slotSrc;
          targetSlot = slotsBySrc.get(normalizedSrc) || null;
        } else if (mapEntry.word || mapEntry.slug) {
          const wordSlug = norm(mapEntry.word || mapEntry.slug);
          const matches = slotsByWord.get(wordSlug) || [];
          if (mapEntry.lessonNumber != null) {
            targetSlot =
              matches.find((m) => Number(m.lessonNumber) === Number(mapEntry.lessonNumber)) || null;
          } else if (matches.length === 1) {
            targetSlot = matches[0];
          } else if (matches.length > 1) {
            ambiguousMappings.push({
              file: relFile,
              reason: "AMBIGUOUS_WORD_MATCH",
              candidates: matches.map((m) => m.src),
            });
            continue;
          }
        }

        if (!targetSlot) {
          unmappedFiles.push({ file: relFile, reason: "TARGET_SLOT_NOT_FOUND" });
          continue;
        }

        resolvedMappings.push({ file: relFile, absFile, slot: targetSlot });
      }
    } else {
      // Automatic fallback: require unambiguous filename stem matching
      for (const relFile of packageFiles) {
        const fileStem = norm(path.basename(relFile, path.extname(relFile)));
        const matches = slotsByWord.get(fileStem) || [];

        if (matches.length === 1) {
          resolvedMappings.push({
            file: relFile,
            absFile: path.join(packageDir, relFile),
            slot: matches[0],
          });
        } else if (matches.length > 1) {
          ambiguousMappings.push({
            file: relFile,
            reason: "AMBIGUOUS_FILENAME_MATCH",
            candidates: matches.map((m) => m.src),
          });
        } else {
          unmappedFiles.push({ file: relFile, reason: "UNMAPPED_UNKNOWN_SLOT" });
        }
      }
    }

    // Check for duplicate target slots in mappings
    const slotUsage = new Map();
    for (const item of resolvedMappings) {
      const list = slotUsage.get(item.slot.src) || [];
      list.push(item.file);
      slotUsage.set(item.slot.src, list);
    }

    for (const [slotSrc, files] of slotUsage.entries()) {
      if (files.length > 1) {
        ambiguousMappings.push({
          slot: slotSrc,
          reason: "MULTIPLE_FILES_MAPPED_TO_SAME_SLOT",
          files,
        });
      }
    }

    // Validate image sanity & classification plan
    const plan = [];
    const filesChanged = [];
    const derivativesGenerated = [];

    for (const item of resolvedMappings) {
      const sanity = await verifySuppliedImage(item.absFile, item.slot, {
        allowOverwriteVerified,
        root,
      });

      const proposedClassification = sanity.valid
        ? "VERIFIED OWNER INTAKE"
        : item.slot.classification;
      const action = sanity.valid ? (dryRun ? "WOULD_IMPORT" : "IMPORTED") : "REJECTED";

      plan.push({
        slot: item.slot.src,
        word: item.slot.word,
        suppliedFile: item.file,
        currentClassification: item.slot.classification,
        proposedClassification,
        sanity,
        action,
      });

      if (sanity.valid && !dryRun) {
        // Execute intake for this valid target
        const targetAbs = item.slot.localPath;
        fs.mkdirSync(path.dirname(targetAbs), { recursive: true });

        // Convert supplied file to WebP at target canonical path
        await sharp(item.absFile).webp({ quality: 92, effort: 5 }).toFile(targetAbs);

        filesChanged.push(item.slot.src);

        // Update manifest provenance
        const manifestPath = path.join(
          root,
          "public",
          "cartilla",
          "art",
          "faithful",
          "manifest.json",
        );
        const manifest = readJson(manifestPath);
        const idx = manifest.findIndex((m) => m.src === item.slot.src);
        const nowIso = new Date().toISOString().split("T")[0];
        if (idx >= 0) {
          manifest[idx].provenanceStatus = `VERIFIED-OWNER-INTAKE-${nowIso}`;
          manifest[idx].note = "Verified owner-supplied foreground artwork intake.";
          writeJson(manifestPath, manifest);
        }

        // Update qa-results.json
        const qaPath = path.join(root, "public", "cartilla", "art", "faithful", "qa-results.json");
        if (fs.existsSync(qaPath)) {
          const qa = readJson(qaPath);
          const qaIdx = (qa.results || []).findIndex((q) => q.file === `public${item.slot.src}`);
          if (qaIdx >= 0) {
            qa.results[qaIdx].verdict = "PASS";
            qa.results[qaIdx].note = "Owner artwork intake verified.";
          } else {
            qa.results = qa.results || [];
            qa.results.push({
              file: `public${item.slot.src}`,
              verdict: "PASS",
              note: "Owner artwork intake verified.",
            });
          }
          writeJson(qaPath, qa);
        }

        // Regenerate delivery derivatives strictly for this target
        const normalized = await sharp(targetAbs)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        const normalizedLossless = await sharp(normalized.data, {
          raw: { width: normalized.info.width, height: normalized.info.height, channels: 4 },
        })
          .webp({ lossless: true, alphaQuality: 100 })
          .toBuffer();

        for (const widthTier of DELIVERY_WIDTHS) {
          const relDelivery = item.slot.src.replace(
            "/art/faithful/",
            `/art/delivery/faithful/${widthTier}/`,
          );
          const absDelivery = path.join(root, "public", relDelivery.replace(/^\//, ""));
          fs.mkdirSync(path.dirname(absDelivery), { recursive: true });

          await sharp(normalizedLossless)
            .resize({
              width: widthTier,
              fit: "inside",
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3,
            })
            .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
            .toFile(absDelivery);

          derivativesGenerated.push(relDelivery);
        }
      }
    }

    // Re-evaluate target slots to calculate exact still missing slots
    const updatedSlots = identifyTargetSlots(root);
    const stillMissingSlots = updatedSlots
      .filter(
        (s) =>
          !s.isVerified && (dryRun ? !plan.some((p) => p.slot === s.src && p.sanity.valid) : true),
      )
      .map((s) => ({ src: s.src, word: s.word, lessonNumber: s.lessonNumber }));

    return {
      status: dryRun ? "dry-run" : "imported",
      timestamp: new Date().toISOString(),
      summary: {
        totalTargetSlots: allSlots.length,
        currentlyVerifiedSlots: allSlots.filter((s) => s.isVerified).length,
        currentlyPendingSlots: allSlots.filter((s) => !s.isVerified).length,
        suppliedFilesCount: packageFiles.length,
        validMappedImports: plan.filter((p) => p.sanity.valid).length,
        rejectedImports: plan.filter((p) => !p.sanity.valid).length,
        ambiguousMappingsCount: ambiguousMappings.length,
        unmappedFilesCount: unmappedFiles.length,
        stillMissingSlotsCount: stillMissingSlots.length,
      },
      plan,
      ambiguousMappings,
      unmappedFiles,
      filesChanged,
      derivativesGenerated,
      stillMissingSlots,
    };
  } finally {
    if (tempExtractDir && fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
  }
}

// CLI Execution Support
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const packageArg = getArg("--package") || args.find((a) => !a.startsWith("--"));
  const mappingArg = getArg("--mapping");
  const dryRun = args.includes("--dry-run");
  const allowOverwriteVerified =
    args.includes("--allow-overwrite-verified") || args.includes("--force");
  const jsonOutput = args.includes("--json");

  if (!packageArg) {
    console.error(
      "Usage: node scripts/validate-owner-art-package.mjs --package <path-to-folder-or-zip> [--mapping <mapping.json>] [--dry-run] [--force] [--json]",
    );
    process.exit(1);
  }

  processOwnerArtIntake({
    packagePath: path.resolve(packageArg),
    mappingPath: mappingArg ? path.resolve(mappingArg) : undefined,
    dryRun,
    allowOverwriteVerified,
    root: rootDir,
  })
    .then((report) => {
      if (jsonOutput) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`\n=== OWNER ART INTAKE REPORT (${report.status.toUpperCase()}) ===`);
        console.log(`Total Target Slots: ${report.summary.totalTargetSlots}`);
        console.log(`Currently Verified: ${report.summary.currentlyVerifiedSlots}`);
        console.log(`Currently Pending:  ${report.summary.currentlyPendingSlots}`);
        console.log(`Supplied Files:     ${report.summary.suppliedFilesCount}`);
        console.log(`Valid Mapped:       ${report.summary.validMappedImports}`);
        console.log(`Rejected:           ${report.summary.rejectedImports}`);
        console.log(`Ambiguous Mappings: ${report.summary.ambiguousMappingsCount}`);
        console.log(`Still Missing:      ${report.summary.stillMissingSlotsCount}\n`);

        if (report.plan.length > 0) {
          console.log("CLASSIFICATION PLAN:");
          for (const item of report.plan) {
            const flag = item.sanity.valid ? "✓" : "✗";
            console.log(` [${flag}] ${item.slot} (${item.word})`);
            console.log(`     Supplied: ${item.suppliedFile}`);
            console.log(
              `     Status: ${item.currentClassification} -> ${item.proposedClassification}`,
            );
            if (!item.sanity.valid) {
              console.log(`     Reason: ${item.sanity.reason} - ${item.sanity.details}`);
            }
          }
          console.log("");
        }

        if (report.ambiguousMappings.length > 0) {
          console.warn("AMBIGUOUS MAPPINGS (EXPLICIT MAPPING REQUIRED):");
          for (const amb of report.ambiguousMappings) {
            console.warn(` - ${amb.file || amb.slot}: ${amb.reason}`);
          }
          console.log("");
        }

        if (report.stillMissingSlots.length > 0) {
          console.log(`STILL MISSING SLOTS (${report.stillMissingSlots.length}):`);
          for (const s of report.stillMissingSlots) {
            console.log(` - ${s.src} (${s.word})`);
          }
        }
      }
    })
    .catch((err) => {
      console.error(`Intake Error: ${err.message}`);
      process.exit(1);
    });
}
