import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const auditPath = path.join(
  process.cwd(),
  "docs",
  "production-art-classification-audit.json"
);

export async function verifyArtDrop(dropDir) {
  if (!fs.existsSync(auditPath)) {
    throw new Error(`Audit file not found at ${auditPath}`);
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, "utf-8"));
  const pendingSlots = audit.faithfulAudit.filter(
    (item) => item.classification === "PENDING NO VERIFIED SOURCE"
  );

  const expectedByFilename = new Map();
  for (const slot of pendingSlots) {
    const filename = path.basename(slot.src);
    if (!expectedByFilename.has(filename)) {
      expectedByFilename.set(filename, []);
    }
    expectedByFilename.get(filename).push(slot);
  }

  if (!fs.existsSync(dropDir)) {
    throw new Error(`Drop directory not found at ${dropDir}`);
  }

  const dropFiles = fs
    .readdirSync(dropDir)
    .filter((file) => !file.startsWith("."))
    .sort();

  const report = {
    dropDir,
    timestamp: new Date().toISOString(),
    expectedPendingCount: pendingSlots.length,
    dropFileCount: dropFiles.length,
    matches: [],
    unknownFiles: [],
    missingSlots: [],
    invalidFiles: [],
  };

  const processedDropFiles = new Set();
  const matchedExpectedSlots = new Set();

  for (const filename of dropFiles) {
    const filePath = path.join(dropDir, filename);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      continue;
    }

    try {
      const metadata = await sharp(filePath).metadata();
      const fileInfo = {
        filename,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        bytes: stat.size,
      };

      if (expectedByFilename.has(filename)) {
        const slots = expectedByFilename.get(filename);
        if (slots.length > 1) {
          // Multiple slots expect this filename.
          // Map to all of them, but note it.
          report.matches.push({
            file: fileInfo,
            slots: slots.map((s) => s.src),
            note: "Ambiguous: matches multiple slots",
          });
          slots.forEach((s) => matchedExpectedSlots.add(s.src));
        } else {
          report.matches.push({
            file: fileInfo,
            slots: [slots[0].src],
          });
          matchedExpectedSlots.add(slots[0].src);
        }
      } else {
        report.unknownFiles.push(fileInfo);
      }
    } catch (e) {
      report.invalidFiles.push({
        filename,
        error: "Not a valid/readable image",
      });
    }
  }

  for (const slot of pendingSlots) {
    if (!matchedExpectedSlots.has(slot.src)) {
      report.missingSlots.push(slot.src);
    }
  }

  return report;
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: node verify-owner-art-drop.mjs <drop_directory>");
    process.exit(1);
  }

  const dropDir = path.resolve(process.cwd(), args[0]);

  try {
    const report = await verifyArtDrop(dropDir);

    console.log("=== La Cartilla de Gretel: Owner Art Drop Report ===");
    console.log(`Drop directory : ${report.dropDir}`);
    console.log(`Expected slots : ${report.expectedPendingCount}`);
    console.log(`Files in drop  : ${report.dropFileCount}`);
    console.log(`Matched slots  : ${report.matches.length}`);
    console.log(`Unknown files  : ${report.unknownFiles.length}`);
    console.log(`Missing slots  : ${report.missingSlots.length}`);
    console.log(`Invalid files  : ${report.invalidFiles.length}`);

    if (report.unknownFiles.length > 0) {
      console.log("\nUnknown files (not matching any pending slot):");
      report.unknownFiles.forEach((f) =>
        console.log(`  - ${f.filename} (${f.width}x${f.height}, ${f.bytes}b)`)
      );
    }

    if (report.invalidFiles.length > 0) {
      console.log("\nInvalid or unreadable files:");
      report.invalidFiles.forEach((f) =>
        console.log(`  - ${f.filename} (${f.error})`)
      );
    }

    if (report.missingSlots.length > 0) {
      console.log("\nMissing slots (still required):");
      report.missingSlots.forEach((s) => console.log(`  - ${s}`));
    }

    const outPath = path.join(process.cwd(), "docs", "owner-art-drop-manifest.json");
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\nMachine-readable report written to: docs/owner-art-drop-manifest.json`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
