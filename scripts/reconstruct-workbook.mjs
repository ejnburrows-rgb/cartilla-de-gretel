import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256File(file) {
  return sha256Buffer(fs.readFileSync(file));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function refs(value) {
  return String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number);
}

function validNormBox(box) {
  return (
    box &&
    ["x", "y", "width", "height"].every(
      (k) => Number.isFinite(box[k]) && box[k] >= 0 && box[k] <= 1,
    ) &&
    box.width > 0 &&
    box.height > 0 &&
    box.x + box.width <= 1.000001 &&
    box.y + box.height <= 1.000001
  );
}

function pxBox(box, width, height) {
  if (!validNormBox(box)) throw new Error("Invalid normalized box " + JSON.stringify(box));
  const left = Math.max(0, Math.round(box.x * width));
  const top = Math.max(0, Math.round(box.y * height));
  const right = Math.min(width, Math.round((box.x + box.width) * width));
  const bottom = Math.min(height, Math.round((box.y + box.height) * height));
  const w = right - left;
  const h = bottom - top;
  if (w <= 0 || h <= 0) throw new Error("Normalized box resolves to an empty pixel region");
  return { left, top, width: w, height: h };
}

const GEOMETRY_KEYS = [
  "subject_identity",
  "subject_count",
  "pose_action",
  "anatomy",
  "silhouette",
  "proportions",
  "face_expression",
  "linework",
  "props",
  "orientation",
  "composition",
  "educational_meaning",
];

function exactGeometryVerified(item) {
  return GEOMETRY_KEYS.every((key) => item.geometry_checks?.[key] === true);
}

async function openPdf(file) {
  const data = new Uint8Array(fs.readFileSync(file));
  return pdfjsLib
    .getDocument({
      data,
      isEvalSupported: false,
      useSystemFonts: true,
      useWorkerFetch: false,
    })
    .promise;
}

async function renderPdfPage(doc, pageNumber, scale) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const width = Math.ceil(viewport.width);
  const height = Math.ceil(viewport.height);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { buffer: canvas.toBuffer("image/png"), width, height };
}

function median(values) {
  if (!values.length) return 255;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
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

function colorDistance(r, g, b, bg) {
  return Math.sqrt((r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2);
}

function estimateBorderColor(data, width, height) {
  const rs = [];
  const gs = [];
  const bs = [];
  for (const p of borderIndices(width, height)) {
    const i = p * 4;
    if (data[i + 3] < 20) continue;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  }
  return { r: median(rs), g: median(gs), b: median(bs) };
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

async function removeBorderPaper(input) {
  const decoded = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = decoded.info;
  const data = Buffer.from(decoded.data);
  const bg = estimateBorderColor(data, width, height);
  const queue = [];
  const visited = new Uint8Array(width * height);

  const isPaper = (p) => {
    const i = p * 4;
    if (data[i + 3] < 20) return true;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    return lum >= 170 && colorDistance(data[i], data[i + 1], data[i + 2], bg) <= 48;
  };

  for (const p of borderIndices(width, height)) {
    if (isPaper(p)) {
      visited[p] = 1;
      queue.push(p);
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q];
    for (const n of neighbors(p, width, height)) {
      if (visited[n] || !isPaper(n)) continue;
      visited[n] = 1;
      queue.push(n);
    }
  }
  for (let p = 0; p < visited.length; p++) {
    if (visited[p]) data[p * 4 + 3] = 0;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a < 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) throw new Error("Source crop became empty after border-paper removal");

  const margin = 4;
  const left = Math.max(0, minX - margin);
  const top = Math.max(0, minY - margin);
  const right = Math.min(width, maxX + 1 + margin);
  const bottom = Math.min(height, maxY + 1 + margin);

  return sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: right - left, height: bottom - top })
    .png()
    .toBuffer();
}

async function cropNormalized(image, box) {
  const meta = await sharp(image).metadata();
  if (!meta.width || !meta.height) throw new Error("Could not read image dimensions");
  const rect = pxBox(box, meta.width, meta.height);
  return {
    rect,
    buffer: await sharp(image).extract(rect).png().toBuffer(),
  };
}

async function estimatePaperColor(crop) {
  const decoded = await sharp(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return estimateBorderColor(decoded.data, decoded.info.width, decoded.info.height);
}

async function buildReplacementPatch(targetCrop, source, targetWidth, targetHeight) {
  const paper = await estimatePaperColor(targetCrop);
  const fitted = await sharp(source)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: { r: paper.r, g: paper.g, b: paper.b, alpha: 1 },
    },
  })
    .composite([{ input: fitted, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function createProof(originalCrop, sourceCrop, finalCrop, output) {
  const panelW = 420;
  const panelH = 420;
  const headerH = 48;
  const panel = async (input) =>
    sharp(input)
      .resize({
        width: panelW,
        height: panelH,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

  const [a, b, c] = await Promise.all([panel(originalCrop), panel(sourceCrop), panel(finalCrop)]);
  const labels = ["WORKBOOK ORIGINAL", "SOURCE / VERIFIED COLOR", "RECONSTRUCTED"];
  const svg = Buffer.from(
    `<svg width="${panelW * 3}" height="${headerH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      ${labels
        .map(
          (label, i) =>
            `<text x="${i * panelW + 12}" y="30" font-family="sans-serif" font-size="18" font-weight="700" fill="#111">${label}</text>`,
        )
        .join("")}
    </svg>`,
  );

  ensureDir(path.dirname(output));
  await sharp({
    create: {
      width: panelW * 3,
      height: headerH + panelH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: svg, left: 0, top: 0 },
      { input: a, left: 0, top: headerH },
      { input: b, left: panelW, top: headerH },
      { input: c, left: panelW * 2, top: headerH },
    ])
    .png()
    .toFile(output);
}

async function outsideTargetDiff(original, output, boxes) {
  const a = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return Number.POSITIVE_INFINITY;
  const width = a.info.width;
  const height = a.info.height;
  const inside = (x, y) =>
    boxes.some(
      (box) =>
        x >= box.left &&
        x < box.left + box.width &&
        y >= box.top &&
        y < box.top + box.height,
    );

  let changed = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (inside(x, y)) continue;
      const p = (y * width + x) * 4;
      if (
        a.data[p] !== b.data[p] ||
        a.data[p + 1] !== b.data[p + 1] ||
        a.data[p + 2] !== b.data[p + 2] ||
        a.data[p + 3] !== b.data[p + 3]
      ) {
        changed++;
      }
    }
  }
  return changed;
}

function mappingPages(row) {
  return new Set([...refs(row?.primary_flip_pages), ...refs(row?.supplemental_flip_pages)]);
}

async function main() {
  const args = parseArgs(process.argv);
  const workbookPath = path.resolve(args["workbook-pdf"] || "");
  const flipchartPath = path.resolve(args["flipchart-pdf"] || "");
  const planPath = path.resolve(
    args.plan || path.join(root, "src/data/reconstruction/reconstruction-plan.json"),
  );
  const outDir = path.resolve(args["out-dir"] || path.join(root, "reconstruction-output"));
  const scale = Number(args.scale || 3);

  if (!args["workbook-pdf"] || !fs.existsSync(workbookPath)) {
    throw new Error("Pass --workbook-pdf pointing to the real 98-sheet Workbook PDF");
  }
  if (!args["flipchart-pdf"] || !fs.existsSync(flipchartPath)) {
    throw new Error("Pass --flipchart-pdf pointing to the real 62-page Flip Chart PDF");
  }
  if (!fs.existsSync(planPath)) throw new Error("Reconstruction plan not found: " + planPath);
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("--scale must be > 0");

  const plan = readJson(planPath);
  const mapping = readJson(path.join(root, "src/data/reconstruction/student-to-flipchart-284.json"));
  const pageIndex = readJson(
    path.join(root, "src/data/reconstruction/pdf-sheet-to-printed-page.json"),
  );
  const mappingBySheet = new Map(mapping.mappings.map((x) => [x.student_pdf_page, x]));
  const printedToSheet = new Map(pageIndex.printed_pages.map((x) => [x.printed_page, x.pdf_sheet]));

  if (!Array.isArray(plan.items)) throw new Error("reconstruction-plan.json must contain items[]");
  if (plan.items.length === 0) {
    console.log("RECONSTRUCTION_PLAN_EMPTY no object-level placements have been verified yet");
    return;
  }

  const workbookSha = sha256File(workbookPath);
  const flipchartSha = sha256File(flipchartPath);
  const workbookDoc = await openPdf(workbookPath);
  const flipchartDoc = await openPdf(flipchartPath);
  if (workbookDoc.numPages !== 98) throw new Error(`Workbook source must have 98 sheets; found ${workbookDoc.numPages}`);
  if (flipchartDoc.numPages !== 62) throw new Error(`Flip Chart source must have 62 pages; found ${flipchartDoc.numPages}`);

  const grouped = new Map();
  for (const item of plan.items) {
    if (!item.id) throw new Error("Every reconstruction item needs an id");
    if (!Number.isInteger(item.printed_page) || item.printed_page < 1 || item.printed_page > 90) {
      throw new Error(`${item.id}: invalid printed_page`);
    }
    if (!Number.isInteger(item.workbook_pdf_sheet)) {
      throw new Error(`${item.id}: workbook_pdf_sheet is required`);
    }
    if (printedToSheet.get(item.printed_page) !== item.workbook_pdf_sheet) {
      throw new Error(
        `${item.id}: printed page ${item.printed_page} does not map to PDF sheet ${item.workbook_pdf_sheet}`,
      );
    }
    if (!validNormBox(item.workbook_box_norm)) {
      throw new Error(`${item.id}: invalid workbook_box_norm`);
    }
    if (!["EXACT_COLORED_COUNTERPART", "COLOR_TRANSFER_REQUIRED"].includes(item.strategy)) {
      throw new Error(`${item.id}: invalid strategy`);
    }
    if (!Number.isInteger(item.flipchart_pdf_page)) {
      throw new Error(`${item.id}: flipchart_pdf_page is required`);
    }
    const allowed = mappingPages(mappingBySheet.get(item.workbook_pdf_sheet));
    if (!allowed.has(item.flipchart_pdf_page)) {
      throw new Error(
        `${item.id}: Flip Chart page ${item.flipchart_pdf_page} is outside the authoritative 284-link mapping for Workbook PDF sheet ${item.workbook_pdf_sheet}`,
      );
    }
    if (item.strategy === "EXACT_COLORED_COUNTERPART") {
      if (!validNormBox(item.flipchart_box_norm)) {
        throw new Error(`${item.id}: exact counterpart requires flipchart_box_norm`);
      }
      if (!exactGeometryVerified(item)) {
        throw new Error(`${item.id}: exact counterpart is missing one or more geometry PASS checks`);
      }
    } else {
      if (!item.verified_colorized_asset) {
        throw new Error(
          `${item.id}: COLOR_TRANSFER_REQUIRED is fail-closed until verified_colorized_asset is supplied`,
        );
      }
      if (item.color_transfer_verification !== "PASS") {
        throw new Error(
          `${item.id}: COLOR_TRANSFER_REQUIRED asset must have color_transfer_verification=PASS`,
        );
      }
    }
    const list = grouped.get(item.printed_page) ?? [];
    list.push(item);
    grouped.set(item.printed_page, list);
  }

  ensureDir(outDir);
  const pageRecords = [];

  for (const [printedPage, items] of [...grouped.entries()].sort((a, b) => a[0] - b[0])) {
    const sheet = printedToSheet.get(printedPage);
    const original = await renderPdfPage(workbookDoc, sheet, scale);
    let pageBuffer = original.buffer;
    const placements = [];
    const targetBoxes = [];

    for (const item of items) {
      const target = pxBox(item.workbook_box_norm, original.width, original.height);
      targetBoxes.push(target);
      const originalCrop = await sharp(original.buffer).extract(target).png().toBuffer();

      let sourceBuffer;
      let sourceProofBuffer;
      if (item.strategy === "EXACT_COLORED_COUNTERPART") {
        const flipPage = await renderPdfPage(flipchartDoc, item.flipchart_pdf_page, scale);
        const source = await cropNormalized(flipPage.buffer, item.flipchart_box_norm);
        sourceBuffer = await removeBorderPaper(source.buffer);
        sourceProofBuffer = sourceBuffer;
      } else {
        const assetPath = path.resolve(root, item.verified_colorized_asset);
        if (!fs.existsSync(assetPath)) {
          throw new Error(`${item.id}: verified colorized asset does not exist: ${assetPath}`);
        }
        sourceBuffer = fs.readFileSync(assetPath);
        sourceProofBuffer = sourceBuffer;
      }

      const sourceMeta = await sharp(sourceBuffer).metadata();
      if (!sourceMeta.width || !sourceMeta.height) {
        throw new Error(`${item.id}: could not read replacement dimensions`);
      }
      const targetRatio = target.width / target.height;
      const sourceRatio = sourceMeta.width / sourceMeta.height;
      const aspectDrift = Math.abs(targetRatio - sourceRatio) / Math.max(targetRatio, sourceRatio);
      const maxAspectDrift = Number(item.max_aspect_drift ?? 0.35);
      if (aspectDrift > maxAspectDrift) {
        throw new Error(
          `${item.id}: source/target aspect drift ${(aspectDrift * 100).toFixed(1)}% exceeds ${(
            maxAspectDrift * 100
          ).toFixed(1)}%`,
        );
      }

      const patch = await buildReplacementPatch(
        originalCrop,
        sourceBuffer,
        target.width,
        target.height,
      );
      pageBuffer = await sharp(pageBuffer)
        .composite([{ input: patch, left: target.left, top: target.top }])
        .png()
        .toBuffer();

      const finalCrop = await sharp(pageBuffer).extract(target).png().toBuffer();
      const proofPath = path.join(outDir, "proof", `${item.id}.png`);
      await createProof(originalCrop, sourceProofBuffer, finalCrop, proofPath);

      placements.push({
        id: item.id,
        strategy: item.strategy,
        workbook_box_norm: item.workbook_box_norm,
        flipchart_pdf_page: item.flipchart_pdf_page,
        flipchart_source_file: path.basename(flipchartPath),
        flipchart_source_sha256: flipchartSha,
        flipchart_box_norm: item.flipchart_box_norm ?? null,
        geometry_checks: item.geometry_checks ?? null,
        mapping_verified: true,
        verified_colorized_asset: item.verified_colorized_asset ?? null,
        verified_colorized_asset_sha256: item.verified_colorized_asset
          ? sha256File(path.resolve(root, item.verified_colorized_asset))
          : null,
        color_transfer_verification: item.color_transfer_verification ?? null,
        aspect_drift: aspectDrift,
        proof_path: path.relative(outDir, proofPath).replaceAll(path.sep, "/"),
      });
    }

    const outsideChanged = await outsideTargetDiff(original.buffer, pageBuffer, targetBoxes);
    if (outsideChanged !== 0) {
      throw new Error(
        `printed page ${printedPage}: ${outsideChanged} pixels changed outside declared target regions`,
      );
    }

    const outputName = `page-${String(printedPage).padStart(3, "0")}.png`;
    const outputFile = path.join(outDir, "pages", outputName);
    ensureDir(path.dirname(outputFile));
    fs.writeFileSync(outputFile, pageBuffer);

    pageRecords.push({
      printed_page: printedPage,
      workbook_pdf_sheet: sheet,
      workbook_source_file: path.basename(workbookPath),
      workbook_source_sha256: workbookSha,
      output_file: path.relative(outDir, outputFile).replaceAll(path.sep, "/"),
      production_output_path: `/cartilla/art/reconstructed/workbook/${outputName}`,
      output_sha256: sha256Buffer(pageBuffer),
      structural_status: "PASS",
      verification_status: "UNVERIFIED",
      outside_target_changed_pixels: outsideChanged,
      placements,
    });

    console.log(
      "RECONSTRUCTED_PAGE " +
        JSON.stringify({
          printedPage,
          workbookPdfSheet: sheet,
          placements: placements.length,
          outsideTargetChangedPixels: outsideChanged,
          outputFile,
        }),
    );
  }

  const runManifest = {
    version: "2026-09-27",
    generated_at: new Date().toISOString(),
    engine: "scripts/reconstruct-workbook.mjs",
    workbook_source_file: path.basename(workbookPath),
    workbook_source_sha256: workbookSha,
    flipchart_source_file: path.basename(flipchartPath),
    flipchart_source_sha256: flipchartSha,
    source_mapping: "src/data/reconstruction/student-to-flipchart-284.json",
    page_index: "src/data/reconstruction/pdf-sheet-to-printed-page.json",
    note:
      "Structural PASS verifies deterministic placement and zero changes outside declared target boxes. verification_status remains UNVERIFIED until rendered visual proof is reviewed.",
    pages: pageRecords,
  };
  fs.writeFileSync(
    path.join(outDir, "run-manifest.json"),
    JSON.stringify(runManifest, null, 2) + "\n",
  );

  console.log(
    "RECONSTRUCTION_RUN_COMPLETE " +
      JSON.stringify({
        pages: pageRecords.length,
        placements: pageRecords.reduce((n, p) => n + p.placements.length, 0),
        outputDir: outDir,
      }),
  );
}

main().catch((error) => {
  console.error("RECONSTRUCTION_ERROR " + (error?.stack || error));
  process.exitCode = 1;
});
