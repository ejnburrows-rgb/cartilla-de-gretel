#!/usr/bin/env node
/**
 * scripts/build-workbook-manifest.mjs
 *
 * Converts Grok's offline census files into the canonical
 * src/content/workbook/workbook-manifest.json (schema documented in
 * src/content/workbook/manifest-schema.ts). Designed so the moment the
 * real files land, one command regenerates the manifest with zero rework:
 *
 *   node scripts/build-workbook-manifest.mjs \
 *     --master=cartilla_92_page_master_map.csv \
 *     --content=cartilla_page_content_extract.csv \
 *     --interactions=cartilla_interaction_content.json \
 *     --crop=cartilla_crop_manifest.csv \
 *     --audio=cartilla_audio_script_manifest.csv
 *
 * (or: pnpm build:manifest -- --master=... --content=... etc.)
 *
 * Every input is OPTIONAL and independently tolerant of being missing —
 * run with zero args and it still produces a valid (empty-pages) manifest,
 * proving the pipeline degrades gracefully rather than crashing while
 * waiting for real files.
 *
 * NEVER invents content: a page with no instruction data gets
 * instruction: "" (not a guessed sentence); an object with no percent box
 * data is skipped with a warning (not placed at a made-up position);
 * status is always computed from what data actually exists, never
 * hand-waved to "complete".
 *
 * Expected columns (case/format-insensitive — aliases below), one row per
 * page unless noted:
 *
 *  --master   (cartilla_92_page_master_map.csv), one row per PAGE:
 *      physicalPage | physical_page | page   (required)
 *      digitalPage  | digital_page
 *      lesson       | lesson_number | lessonId
 *
 *  --content  (cartilla_page_content_extract.csv), one row per PAGE:
 *      physicalPage | physical_page | page   (required)
 *      instruction  | instructions | text
 *
 *  --interactions (cartilla_interaction_content.json): either a JSON array
 *      of { physicalPage, mechanic, answers[], targets[] } objects, or a
 *      JSON object keyed by physicalPage number/string with the same shape.
 *
 *  --crop     (cartilla_crop_manifest.csv), one row per OBJECT:
 *      physicalPage | physical_page | page   (required)
 *      objectId     | object_id | id          (required)
 *      type         | object_type
 *      asset        | asset_path | crop_path
 *      x_pct | x_percent | x       (0-100; required for the object to be placed)
 *      y_pct | y_percent | y       (0-100; required)
 *      width_pct | width_percent | width | w_pct   (0-100; required)
 *      height_pct | height_percent | height | h_pct (0-100; optional)
 *      z | z_index
 *      word
 *      motion
 *      interactive  ("true"/"1"/"yes" → true)
 *      (x_px/y_px/width_px/height_px pixel columns are read but only used
 *      for a future pixel→percent conversion once a per-page canvas size is
 *      available; without one, percent columns are the source of truth and
 *      pixel-only rows are skipped with a warning rather than guessing a
 *      scale factor.)
 *
 *  --audio    (cartilla_audio_script_manifest.csv), one row per audio cue:
 *      physicalPage | physical_page | page   (required)
 *      audioId      | audio_id | id           (required)
 *      objectId     | object_id                (optional — attaches to one object's audioId instead of the page-level audio[] list)
 *
 * Output: src/content/workbook/workbook-manifest.json (override with --out=path)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(rootDir, "src/content/workbook/workbook-manifest.json");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const m = /^--([a-zA-Z]+)=(.*)$/.exec(raw);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const outPath = args.out ? path.resolve(args.out) : DEFAULT_OUT;

const skipped = [];
const warnings = [];
function skip(input, reason) {
  skipped.push(`SKIPPED ${input}: ${reason}`);
}
function warn(where, msg) {
  warnings.push(`${where}: ${msg}`);
}

// ---------------------------------------------------------------------------
// Minimal dependency-free CSV parser (handles quoted fields, embedded commas
// and escaped quotes — the common real-world CSV shape). Returns an array
// of row objects keyed by header.
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });
}

/** Finds the first present column among a list of case-insensitive aliases. */
function pick(row, aliases) {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const found = keys.find(
      (k) => k.toLowerCase().replace(/[\s_-]/g, "") === alias.toLowerCase().replace(/[\s_-]/g, ""),
    );
    if (found !== undefined && row[found] !== "") return row[found];
  }
  return undefined;
}

function toNumber(v) {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(v) {
  if (v === undefined) return undefined;
  return ["true", "1", "yes", "y"].includes(String(v).trim().toLowerCase());
}

function readCsvFile(inputPath, label) {
  if (!inputPath) {
    skip(label, "no path given");
    return [];
  }
  const full = path.resolve(inputPath);
  if (!fs.existsSync(full)) {
    skip(label, `file not found at ${full}`);
    return [];
  }
  try {
    return parseCsv(fs.readFileSync(full, "utf8"));
  } catch (e) {
    skip(label, `failed to parse: ${e.message}`);
    return [];
  }
}

function readJsonFile(inputPath, label) {
  if (!inputPath) {
    skip(label, "no path given");
    return null;
  }
  const full = path.resolve(inputPath);
  if (!fs.existsSync(full)) {
    skip(label, `file not found at ${full}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    skip(label, `failed to parse: ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Page accumulator
// ---------------------------------------------------------------------------

/** @typedef {{ physicalPage: number, digitalPage?: number, lesson?: number, instruction: string, background: string|null, objects: any[], interaction?: any, audio: string[], source: string[] }} PageAcc */

/** @type {Map<number, PageAcc>} */
const pages = new Map();

function getOrCreatePage(physicalPage) {
  if (!pages.has(physicalPage)) {
    pages.set(physicalPage, {
      physicalPage,
      instruction: "",
      background: null,
      objects: [],
      audio: [],
      source: [],
    });
  }
  return pages.get(physicalPage);
}

// ---------------------------------------------------------------------------
// 1) master map — physicalPage/digitalPage/lesson
// ---------------------------------------------------------------------------

function loadMasterMap(inputPath) {
  const rows = readCsvFile(inputPath, "master map");
  if (rows.length === 0) return;
  let used = 0;
  rows.forEach((row, i) => {
    const physicalPage = toNumber(pick(row, ["physicalPage", "physical_page", "page"]));
    if (physicalPage === undefined) {
      warn("master map", `row ${i + 2}: no recognizable physicalPage column, skipped`);
      return;
    }
    const page = getOrCreatePage(physicalPage);
    const digitalPage = toNumber(pick(row, ["digitalPage", "digital_page"]));
    const lesson = toNumber(pick(row, ["lesson", "lesson_number", "lessonId"]));
    if (digitalPage !== undefined) page.digitalPage = digitalPage;
    if (lesson !== undefined) page.lesson = lesson;
    page.source.push(path.basename(inputPath));
    used++;
  });
  console.log(`  master map: ${used}/${rows.length} rows applied`);
}

// ---------------------------------------------------------------------------
// 2) content extract — instruction text
// ---------------------------------------------------------------------------

function loadContentExtract(inputPath) {
  const rows = readCsvFile(inputPath, "content extract");
  if (rows.length === 0) return;
  let used = 0;
  rows.forEach((row, i) => {
    const physicalPage = toNumber(pick(row, ["physicalPage", "physical_page", "page"]));
    if (physicalPage === undefined) {
      warn("content extract", `row ${i + 2}: no recognizable physicalPage column, skipped`);
      return;
    }
    const page = getOrCreatePage(physicalPage);
    const instruction = pick(row, ["instruction", "instructions", "text"]);
    if (instruction !== undefined) {
      page.instruction = instruction;
      page.source.push(path.basename(inputPath));
      used++;
    }
  });
  console.log(`  content extract: ${used}/${rows.length} rows applied`);
}

// ---------------------------------------------------------------------------
// 3) interaction content — mechanic/answers/targets per page
// ---------------------------------------------------------------------------

function loadInteractions(inputPath) {
  const data = readJsonFile(inputPath, "interaction content");
  if (!data) return;
  const entries = Array.isArray(data)
    ? data.map((entry) => [entry.physicalPage, entry])
    : Object.entries(data).map(([k, v]) => [Number(k), v]);
  let used = 0;
  for (const [physicalPageRaw, entry] of entries) {
    const physicalPage = toNumber(physicalPageRaw);
    if (physicalPage === undefined || !entry || typeof entry !== "object") {
      warn(
        "interaction content",
        `entry with unrecognizable physicalPage skipped: ${JSON.stringify(physicalPageRaw)}`,
      );
      continue;
    }
    const page = getOrCreatePage(physicalPage);
    if (!entry.mechanic) {
      warn("interaction content", `physicalPage ${physicalPage}: no mechanic given, skipped`);
      continue;
    }
    page.interaction = {
      mechanic: entry.mechanic,
      ...(Array.isArray(entry.answers) && entry.answers.length > 0
        ? { answers: entry.answers }
        : {}),
      ...(Array.isArray(entry.targets) && entry.targets.length > 0
        ? { targets: entry.targets }
        : {}),
    };
    page.source.push(path.basename(inputPath));
    used++;
  }
  console.log(`  interaction content: ${used}/${entries.length} entries applied`);
}

// ---------------------------------------------------------------------------
// 4) crop manifest — objects with percent (preferred) or pixel boxes
// ---------------------------------------------------------------------------

function loadCropManifest(inputPath) {
  const rows = readCsvFile(inputPath, "crop manifest");
  if (rows.length === 0) return;
  let used = 0;
  rows.forEach((row, i) => {
    const physicalPage = toNumber(pick(row, ["physicalPage", "physical_page", "page"]));
    const objectId = pick(row, ["objectId", "object_id", "id"]);
    if (physicalPage === undefined || !objectId) {
      warn("crop manifest", `row ${i + 2}: missing physicalPage or objectId, skipped`);
      return;
    }
    const x = toNumber(pick(row, ["x_pct", "x_percent", "x"]));
    const y = toNumber(pick(row, ["y_pct", "y_percent", "y"]));
    const width = toNumber(pick(row, ["width_pct", "width_percent", "width", "w_pct"]));
    const height = toNumber(pick(row, ["height_pct", "height_percent", "height", "h_pct"]));
    if (x === undefined || y === undefined || width === undefined) {
      // Real pixel-only rows land here until a per-page canvas size lets us
      // convert — rather than guess a scale factor, we skip the object and
      // say exactly why, so it's easy to re-run once percent data exists.
      const hasPixel = pick(row, ["x_px", "x_pixels"]) !== undefined;
      warn(
        "crop manifest",
        `physicalPage ${physicalPage} object "${objectId}": no percent box (x/y/width) present${hasPixel ? " — pixel columns found but skipped, no canvas-size reference to convert them" : ""}, skipped`,
      );
      return;
    }
    const page = getOrCreatePage(physicalPage);
    page.objects.push({
      id: objectId,
      type: pick(row, ["type", "object_type"]) ?? "unknown",
      ...(pick(row, ["asset", "asset_path", "crop_path"])
        ? { asset: pick(row, ["asset", "asset_path", "crop_path"]) }
        : {}),
      x,
      y,
      width,
      ...(height !== undefined ? { height } : {}),
      ...(toNumber(pick(row, ["z", "z_index"])) !== undefined
        ? { z: toNumber(pick(row, ["z", "z_index"])) }
        : {}),
      ...(pick(row, ["word"]) ? { word: pick(row, ["word"]) } : {}),
      ...(pick(row, ["motion"]) ? { motion: pick(row, ["motion"]) } : {}),
      ...(toBool(pick(row, ["interactive"])) !== undefined
        ? { interactive: toBool(pick(row, ["interactive"])) }
        : {}),
    });
    page.source.push(path.basename(inputPath));
    used++;
  });
  console.log(`  crop manifest: ${used}/${rows.length} rows applied`);
}

// ---------------------------------------------------------------------------
// 5) audio script manifest — audioIds, page-level or per-object
// ---------------------------------------------------------------------------

function loadAudioManifest(inputPath) {
  const rows = readCsvFile(inputPath, "audio script manifest");
  if (rows.length === 0) return;
  let used = 0;
  rows.forEach((row, i) => {
    const physicalPage = toNumber(pick(row, ["physicalPage", "physical_page", "page"]));
    const audioId = pick(row, ["audioId", "audio_id", "id"]);
    if (physicalPage === undefined || !audioId) {
      warn("audio script manifest", `row ${i + 2}: missing physicalPage or audioId, skipped`);
      return;
    }
    const page = getOrCreatePage(physicalPage);
    const objectId = pick(row, ["objectId", "object_id"]);
    if (objectId) {
      const object = page.objects.find((o) => o.id === objectId);
      if (object) object.audioId = audioId;
      else
        warn(
          "audio script manifest",
          `physicalPage ${physicalPage}: objectId "${objectId}" not found among this page's objects yet (load --crop before --audio, or attach at page level)`,
        );
    } else {
      page.audio.push(audioId);
    }
    page.source.push(path.basename(inputPath));
    used++;
  });
  console.log(`  audio script manifest: ${used}/${rows.length} rows applied`);
}

// ---------------------------------------------------------------------------
// Status computation — always derived from what data actually exists,
// never hand-waved. "complete" is never auto-assigned: that's a human call.
// ---------------------------------------------------------------------------

function computeStatus(page) {
  const hasObjects = page.objects.length > 0;
  const hasInstruction = page.instruction.trim().length > 0;
  const hasInteraction = Boolean(page.interaction);
  const hasRealAssets = page.objects.some((o) => o.asset);

  if (hasInstruction && hasObjects && hasInteraction) return "implementation-ready";
  if (hasObjects && hasRealAssets) return "colorization-ready";
  if (hasObjects) return "cropping-ready";
  return "mapped";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("Building workbook manifest...");
  loadMasterMap(args.master);
  loadContentExtract(args.content);
  loadInteractions(args.interactions);
  loadCropManifest(args.crop);
  loadAudioManifest(args.audio);

  const outputPages = Array.from(pages.values())
    .sort((a, b) => a.physicalPage - b.physicalPage)
    .map((page) => ({
      physicalPage: page.physicalPage,
      ...(page.digitalPage !== undefined ? { digitalPage: page.digitalPage } : {}),
      lesson: page.lesson ?? null,
      instruction: page.instruction,
      background: page.background,
      objects: page.objects,
      ...(page.interaction ? { interaction: page.interaction } : {}),
      ...(page.audio.length > 0 ? { audio: page.audio } : {}),
      status: computeStatus(page),
      source: Array.from(new Set(page.source)).join(", ") || undefined,
    }));

  const manifest = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    pages: outputPages,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log(`\nWrote ${outputPages.length} page(s) to ${path.relative(rootDir, outPath)}`);
  const statusCounts = outputPages.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Status breakdown:", statusCounts);

  if (skipped.length > 0) {
    console.log(`\n${skipped.length} input(s) skipped:`);
    for (const s of skipped) console.log(`  ${s}`);
  }
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ${w}`);
  }

  console.log(
    `\nNext: pnpm validate:manifest${outPath !== DEFAULT_OUT ? ` -- ${path.relative(rootDir, outPath)}` : ""}`,
  );
}

main();
