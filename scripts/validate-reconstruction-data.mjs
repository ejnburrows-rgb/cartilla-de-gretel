import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function refs(value) {
  return String(value ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number);
}

function normalizeSrc(value) {
  return "/" + String(value ?? "").replace(/^public\//, "").replace(/^\/+/, "");
}

function isSha(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function validBox(box) {
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

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const mapping = readJson("src/data/reconstruction/student-to-flipchart-284.json");
assert(mapping.student_pages === 98, "284 mapping must declare 98 student PDF sheets");
assert(mapping.flipchart_pages === 62, "284 mapping must declare 62 Flip Chart pages");
assert(Array.isArray(mapping.mappings) && mapping.mappings.length === 98, "284 mapping must contain 98 records");

const mappingBySheet = new Map();
let totalLinks = 0;
for (const row of mapping.mappings ?? []) {
  assert(Number.isInteger(row.student_pdf_page) && row.student_pdf_page >= 1 && row.student_pdf_page <= 98,
    "invalid student_pdf_page in 284 mapping");
  assert(!mappingBySheet.has(row.student_pdf_page), `duplicate student_pdf_page ${row.student_pdf_page}`);
  mappingBySheet.set(row.student_pdf_page, row);
  const all = [...refs(row.primary_flip_pages), ...refs(row.supplemental_flip_pages)];
  totalLinks += all.length;
  for (const page of all) {
    assert(Number.isInteger(page) && page >= 1 && page <= 62,
      `invalid Flip Chart page ${page} for student PDF sheet ${row.student_pdf_page}`);
  }
}
assert(totalLinks === 284, `authoritative mapping must contain exactly 284 links; found ${totalLinks}`);
for (let sheet = 1; sheet <= 98; sheet++) {
  assert(mappingBySheet.has(sheet), `284 mapping missing student PDF sheet ${sheet}`);
}

const pageIndex = readJson("src/data/reconstruction/pdf-sheet-to-printed-page.json");
assert(pageIndex.pdf_sheet_count === 98, "page index must declare 98 PDF sheets");
assert(pageIndex.printed_page_count === 90, "page index must declare 90 printed pages");
assert(pageIndex.pdf_sheets?.length === 98, "page index must list all 98 PDF sheets");
assert(pageIndex.printed_pages?.length === 90, "page index must list all 90 printed pages");

const sheetToPrinted = new Map((pageIndex.pdf_sheets ?? []).map((x) => [x.pdf_sheet, x.printed_page]));
const printedToSheet = new Map((pageIndex.printed_pages ?? []).map((x) => [x.printed_page, x.pdf_sheet]));
for (let sheet = 1; sheet <= 98; sheet++) {
  assert(sheetToPrinted.has(sheet), `page index missing PDF sheet ${sheet}`);
}
for (let printed = 1; printed <= 90; printed++) {
  assert(printedToSheet.has(printed), `page index missing printed page ${printed}`);
  const sheet = printedToSheet.get(printed);
  if (sheet != null) {
    assert(sheetToPrinted.get(sheet) === printed,
      `page index inverse mismatch: printed ${printed} -> sheet ${sheet}`);
  }
}
const missingPrinted = (pageIndex.printed_pages ?? [])
  .filter((x) => x.status === "MISSING_FROM_98_PAGE_SOURCE")
  .map((x) => x.printed_page)
  .sort((a, b) => a - b);
assert(JSON.stringify(missingPrinted) === JSON.stringify([86, 87]),
  `expected only printed pages 86-87 missing from source; found ${missingPrinted.join(",")}`);
assert(sheetToPrinted.get(7) === 1 && sheetToPrinted.get(10) === 4,
  "verified front offset mapping is not preserved");
assert(sheetToPrinted.get(91) === 85 && sheetToPrinted.get(92) === 88 &&
       sheetToPrinted.get(93) === 89 && sheetToPrinted.get(94) === 90,
  "verified tail page mapping is not preserved");

const availablePrintedPages = (pageIndex.printed_pages ?? [])
  .filter((page) => page.status === "AVAILABLE")
  .map((page) => page.printed_page);
for (const printed of availablePrintedPages) {
  const sourceFile = path.join(
    root,
    "public",
    "cartilla",
    "art",
    "source",
    "workbook",
    `page-${String(printed).padStart(3, "0")}.jpg`,
  );
  assert(fs.existsSync(sourceFile), `available Workbook source page ${printed} is missing`);
  if (fs.existsSync(sourceFile)) {
    assert(fs.statSync(sourceFile).size > 0, `available Workbook source page ${printed} is empty`);
  }
}

const plan = readJson("src/data/reconstruction/reconstruction-plan.json");
assert(Array.isArray(plan.items), "reconstruction plan must contain items[]");
const planIds = new Set();
const planStrategies = new Set([
  "EXACT_COLORED_COUNTERPART",
  "COLOR_TRANSFER_REQUIRED",
  "NO_VALID_COUNTERPART",
]);
const validNormBox = (box) =>
  box &&
  ["x", "y", "width", "height"].every(
    (key) => Number.isFinite(box[key]) && box[key] >= 0 && box[key] <= 1,
  ) &&
  box.width > 0 &&
  box.height > 0 &&
  box.x + box.width <= 1.000001 &&
  box.y + box.height <= 1.000001;
const geometryKeys = [
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
for (const item of plan.items) {
  assert(typeof item.id === "string" && item.id.length > 0, "plan item missing id");
  assert(!planIds.has(item.id), `duplicate reconstruction plan id ${item.id}`);
  planIds.add(item.id);
  assert(planStrategies.has(item.strategy), `${item.id}: invalid strategy`);
  assert(Number.isInteger(item.workbook_pdf_sheet), `${item.id}: invalid workbook sheet`);
  assert(printedToSheet.get(item.printed_page) === item.workbook_pdf_sheet,
    `${item.id}: workbook sheet/printed page mismatch`);
  assert(validNormBox(item.workbook_box_norm), `${item.id}: invalid workbook box`);
  if (item.strategy === "NO_VALID_COUNTERPART") {
    assert(item.flipchart_pdf_page == null, `${item.id}: no-counterpart item must not claim a source page`);
    assert(Array.isArray(item.reviewed_flipchart_pages), `${item.id}: missing reviewed source pages`);
    continue;
  }
  assert(Number.isInteger(item.flipchart_pdf_page), `${item.id}: invalid Flip Chart page`);
  const mappingRow = mappingBySheet.get(item.workbook_pdf_sheet);
  const allowedSourcePages = new Set([
    ...refs(mappingRow?.primary_flip_pages),
    ...refs(mappingRow?.supplemental_flip_pages),
  ]);
  assert(allowedSourcePages.has(item.flipchart_pdf_page),
    `${item.id}: source page is outside authoritative mapping`);
  assert(validNormBox(item.flipchart_box_norm), `${item.id}: invalid Flip Chart box`);
  if (item.strategy === "EXACT_COLORED_COUNTERPART") {
    assert(geometryKeys.every((key) => item.geometry_checks?.[key] === true),
      `${item.id}: exact counterpart lacks complete geometry PASS checks`);
  } else if (item.color_transfer_verification === "PASS") {
    assert(typeof item.verified_colorized_asset === "string" && item.verified_colorized_asset.length > 0,
      `${item.id}: verified color transfer lacks an asset`);
  } else {
    assert(item.color_transfer_verification === "PENDING",
      `${item.id}: color transfer must be PENDING or PASS`);
  }
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
const strategyCounts = Object.fromEntries(
  [...planStrategies].map((strategy) => [strategy, plan.items.filter((item) => item.strategy === strategy).length]),
);
assert(plan.summary?.total_object_records === plan.items.length,
  "reconstruction plan summary total does not match items");
for (const [strategy, count] of Object.entries(strategyCounts)) {
  assert(plan.summary?.[strategy] === count,
    `reconstruction plan summary mismatch for ${strategy}`);
}

const faithful = readJson("public/cartilla/art/faithful/manifest.json");
const quarantine = readJson("public/cartilla/art/faithful/quarantine.json");
const qa = readJson("public/cartilla/art/faithful/qa-results.json");
const qaBySrc = new Map((qa.results ?? []).map((x) => [normalizeSrc(x.file), x]));
const activeSrcs = new Set((faithful ?? []).map((x) => normalizeSrc(x.src)));
const quarantineSrcs = new Set((quarantine.assets ?? []).map((x) => normalizeSrc(x.src)));

assert(Array.isArray(faithful), "active faithful manifest must be an array");
assert(quarantine.count === 35 && quarantineSrcs.size === 35,
  `expected 35 quarantined faithful assets; found ${quarantineSrcs.size}`);
for (const src of activeSrcs) {
  assert(!quarantineSrcs.has(src), `quarantined asset remains in active manifest: ${src}`);
  const q = qaBySrc.get(src);
  assert(q?.verdict === "PASS", `active faithful asset lacks PASS QA: ${src}`);
}
for (const src of quarantineSrcs) {
  const q = qaBySrc.get(src);
  assert(q?.verdict === "FAIL", `quarantine entry is not backed by FAIL QA: ${src}`);
}

const production = readJson("src/data/reconstruction/production-manifest.json");
assert(Array.isArray(production.assets), "production reconstruction manifest must contain assets[]");

for (const asset of production.assets ?? []) {
  assert(Number.isInteger(asset.printed_page) && asset.printed_page >= 1 && asset.printed_page <= 90,
    "production asset has invalid printed_page");
  assert(Number.isInteger(asset.workbook_pdf_sheet) && asset.workbook_pdf_sheet >= 1 && asset.workbook_pdf_sheet <= 98,
    `production page ${asset.printed_page} has invalid workbook_pdf_sheet`);
  assert(printedToSheet.get(asset.printed_page) === asset.workbook_pdf_sheet,
    `production page ${asset.printed_page} does not match canonical PDF-sheet index`);
  assert(typeof asset.workbook_source_file === "string" && asset.workbook_source_file.length > 0,
    `production page ${asset.printed_page} missing workbook_source_file`);
  assert(isSha(asset.workbook_source_sha256),
    `production page ${asset.printed_page} missing valid workbook source SHA-256`);
  assert(typeof asset.output_path === "string" &&
         /^\/cartilla\/art\/reconstructed\/workbook\/page-\d{3}\.png$/.test(asset.output_path),
    `production page ${asset.printed_page} has invalid reconstructed output_path`);
  assert(isSha(asset.output_sha256),
    `production page ${asset.printed_page} missing valid output SHA-256`);
  const outputFile = path.join(root, "public", asset.output_path.replace(/^\/+/, ""));
  assert(fs.existsSync(outputFile),
    `production page ${asset.printed_page} output file is missing`);
  if (fs.existsSync(outputFile)) {
    assert(sha256File(outputFile) === asset.output_sha256,
      `production page ${asset.printed_page} output hash does not match the locked master`);
  }
  assert(asset.verification_status === "PASS",
    `production page ${asset.printed_page} is not visually verified PASS`);
  assert(Array.isArray(asset.placements) && asset.placements.length > 0,
    `production page ${asset.printed_page} has no placement provenance`);

  for (const placement of asset.placements ?? []) {
    assert(typeof placement.id === "string" && placement.id.length > 0,
      `production page ${asset.printed_page} has placement without id`);
    assert(validBox(placement.workbook_box_norm),
      `placement ${placement.id} has invalid workbook_box_norm`);
    assert(placement.mapping_verified === true,
      `placement ${placement.id} is not verified against the 284-link mapping`);
    assert(
      placement.strategy === "EXACT_COLORED_COUNTERPART" ||
        placement.strategy === "COLOR_TRANSFER_REQUIRED",
      `placement ${placement.id} has invalid strategy`,
    );

    const row = mappingBySheet.get(asset.workbook_pdf_sheet);
    const allowed = new Set([...refs(row?.primary_flip_pages), ...refs(row?.supplemental_flip_pages)]);

    assert(Number.isInteger(placement.flipchart_pdf_page) &&
           placement.flipchart_pdf_page >= 1 && placement.flipchart_pdf_page <= 62,
      `placement ${placement.id} has invalid Flip Chart page`);
    assert(allowed.has(placement.flipchart_pdf_page),
      `placement ${placement.id} uses Flip Chart page outside authoritative mapping`);
    assert(typeof placement.flipchart_source_file === "string" && placement.flipchart_source_file.length > 0,
      `placement ${placement.id} missing Flip Chart source file`);
    assert(isSha(placement.flipchart_source_sha256),
      `placement ${placement.id} missing Flip Chart source SHA-256`);

    if (placement.strategy === "EXACT_COLORED_COUNTERPART") {
      assert(validBox(placement.flipchart_box_norm),
        `exact placement ${placement.id} has invalid flipchart_box_norm`);
      assert(
        GEOMETRY_KEYS.every((key) => placement.geometry_checks?.[key] === true),
        `exact placement ${placement.id} does not contain a complete PASS geometry check`,
      );
    } else {
      assert(typeof placement.verified_colorized_asset === "string" &&
             placement.verified_colorized_asset.length > 0,
        `color-transfer placement ${placement.id} lacks verified_colorized_asset`);
      assert(isSha(placement.verified_colorized_asset_sha256),
        `color-transfer placement ${placement.id} lacks verified asset SHA-256`);
      assert(placement.color_transfer_verification === "PASS",
        `color-transfer placement ${placement.id} is not verified PASS`);
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error("RECONSTRUCTION_DATA_ERROR " + error);
  throw new Error(`Reconstruction data validation failed with ${errors.length} error(s)`);
}

console.log(
  "RECONSTRUCTION_DATA_OK " +
    JSON.stringify({
      workbookPdfSheets: 98,
      printedPages: 90,
      availableSourcePages: availablePrintedPages.length,
      missingPrintedPages: [86, 87],
      mappingRecords: mapping.mappings.length,
      mappingLinks: totalLinks,
      activeFaithfulAssets: faithful.length,
      quarantinedFaithfulAssets: quarantineSrcs.size,
      verifiedProductionMasters: production.assets.length,
    }),
);
