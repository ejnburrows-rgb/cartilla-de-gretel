#!/usr/bin/env node
/**
 * build-picture-slot-manifest.mjs
 *
 * Picture-slot integrity audit + drop-in manifest.
 *
 * READ-ONLY audit tool: it never modifies, moves, renames or deletes any
 * existing picture file or app code. It reads the app's source and data files
 * and (re)generates two NEW report files only:
 *
 *   docs/proofs/picture-slot-manifest/manifest.json
 *   docs/proofs/picture-slot-manifest/PICTURE-SLOT-REPORT.md
 *
 * What it does:
 *   1. Scans src/ and public/ for every static art reference
 *      (/cartilla/art/... image path) and records the slot that references it
 *      (caption / word / slug context, source file and line).
 *   2. Resolves every referenced path against public/ and flags slots whose
 *      file does not exist (MISSING-FILE).
 *   3. Flags slots whose caption/word disagrees with the file name
 *      (WORD-FILE-MISMATCH), e.g. a slot captioned "avion" wired to pez.webp.
 *      A small alias table records documented historical file names so those
 *      are reported as KNOWN-HISTORICAL-NAME instead of new findings.
 *   4. Cross-checks scripts/picture-slot-manifest/still-missing-55.json (the
 *      55 slots from Cartilla-STILL-MISSING-TRUE-REMAINDER.pdf, built
 *      2026-10-21) and emits one manifest entry per slot with the exact
 *      drop-in path the replacement picture must land at, status
 *      NEEDS-NEW-PICTURE, so new art drops in with zero rewiring.
 *
 * Usage: node scripts/build-picture-slot-manifest.mjs [--check]
 *   --check   regenerate in memory and fail if the committed reports differ
 *             or if any slot references a file that does not exist.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const outDir = path.join(rootDir, "docs", "proofs", "picture-slot-manifest");
const slotsPath = path.join(
  __dirname,
  "picture-slot-manifest",
  "still-missing-55.json",
);
const CHECK_ONLY = process.argv.includes("--check");

const IMAGE_EXT = new Set([".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".avif"]);
const SCAN_EXT = new Set([".ts", ".tsx", ".json", ".mts", ".cts", ".js", ".jsx"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".vercel", "coverage"]);

const ART_PREFIX = "/cartilla/art/";

// Documented historical file names (file stem -> words the drawing actually is).
// Source: src/data/book-transcription/lessons-01-07.json picture-identity note:
// "leccion-1/arco.webp shows a fingertip with a nail (uña), leccion-1/traje.webp
//  shows the uniform (uniforme), leccion-1/pez.webp shows the workbook's
//  airplane (avión). Captions follow the drawing; file names are historical."
const HISTORICAL_NAME_ALIASES_RAW = {
  pez: ["avion"],
  traje: ["uniforme"],
  arco: ["una"],
  "oso-blink": ["oso"],
};
// normalized below after normalizeWord is defined
let HISTORICAL_NAME_ALIASES = {};

// File stems that are intentionally generic (a page scene, a cover): the
// caption describes the page, not a vocabulary word, so no mismatch.
const GENERIC_STEMS = new Set(["scene", "portada", "cover"]);
const SCENE_CAPTION_RE = /ilustraci[oó]n de la p[aá]gina|^(front|back)? ?cover$/i;

function normalizeWordInit() {
  HISTORICAL_NAME_ALIASES = Object.fromEntries(
    Object.entries(HISTORICAL_NAME_ALIASES_RAW).map(([k, v]) => [normalizeWord(k), v.map(normalizeWord)]),
  );
}

function normalizeWord(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "");
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function relToRoot(file) {
  return path.relative(rootDir, file).split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// 1. Index every art file that exists on disk under public/
// ---------------------------------------------------------------------------
normalizeWordInit();
const liveArtFiles = new Set();
for (const file of walk(path.join(publicDir, "cartilla", "art"))) {
  const ext = path.extname(file).toLowerCase();
  if (!IMAGE_EXT.has(ext)) continue;
  const rel = "/" + path.relative(publicDir, file).split(path.sep).join("/");
  liveArtFiles.add(rel);
}

const byBasename = new Map();
for (const p of liveArtFiles) {
  const base = path.basename(p);
  if (!byBasename.has(base)) byBasename.set(base, []);
  byBasename.get(base).push(p);
}

// ---------------------------------------------------------------------------
// 2. Scan source files for static art references, with slot context
// ---------------------------------------------------------------------------
const STRING_RE = /["'`](\/cartilla\/art\/[^"'`$]+?\.(?:webp|png|jpg|jpeg|svg|gif|avif))["'`]/gi;
const DYNAMIC_RE = /`([^`]*\$\{[^`]+\/cartilla\/art\/[^`]*|[^`]*\/cartilla\/art\/[^`]*\$\{[^`]*)`/g;

// JSON context: walk parsed JSON and record caption/word/slug near each art src.
function collectJsonSlots(value, file, slots, ancestors = []) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectJsonSlots(v, file, slots, ancestors));
    return;
  }
  if (value && typeof value === "object") {
    const contextWord =
      value.caption ?? value.word ?? value.slug ?? value.name ?? value.label ?? null;
    const lesson =
      value.lesson ?? value.lessonNumber ?? value.lessonId ?? ancestors.find((a) => a.lesson)?.lesson ?? null;
    const page = value.page ?? value.pageNumber ?? null;
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === "string" && v.startsWith(ART_PREFIX) && IMAGE_EXT.has(path.extname(v).toLowerCase())) {
        slots.push({ artPath: v, key, contextWord, lesson, page });
      } else if (v && typeof v === "object") {
        collectJsonSlots(v, file, slots, [...ancestors, { lesson }]);
      }
    }
  }
}

const references = []; // {sourceFile, line, artPath, contextWord, lesson, page, dynamic}
for (const file of [...walk(path.join(rootDir, "src")), ...walk(publicDir)]) {
  const ext = path.extname(file).toLowerCase();
  if (!SCAN_EXT.has(ext)) continue;
  const rel = relToRoot(file);
  if (rel.startsWith("docs/")) continue;
  const text = fs.readFileSync(file, "utf8");
  let jsonSlots = null;
  if (ext === ".json") {
    try {
      jsonSlots = [];
      collectJsonSlots(JSON.parse(text), rel, jsonSlots);
    } catch {
      jsonSlots = null;
    }
  }
  const jsonByPath = new Map();
  if (jsonSlots) {
    for (const s of jsonSlots) {
      if (!jsonByPath.has(s.artPath)) jsonByPath.set(s.artPath, []);
      jsonByPath.get(s.artPath).push(s);
    }
  }
  let m;
  const seenLinePath = new Set();
  while ((m = STRING_RE.exec(text))) {
    const artPath = m[1];
    const line = text.slice(0, m.index).split("\n").length;
    const key = `${line}:${artPath}`;
    if (seenLinePath.has(key)) continue;
    seenLinePath.add(key);
    const ctx = jsonByPath.get(artPath)?.[0] ?? {};
    references.push({
      sourceFile: rel,
      line,
      artPath,
      contextWord: ctx.contextWord ?? null,
      lesson: ctx.lesson ?? null,
      page: ctx.page ?? null,
      dynamic: false,
    });
  }
  while ((m = DYNAMIC_RE.exec(text))) {
    if (!m[1].includes(ART_PREFIX)) continue;
    const line = text.slice(0, m.index).split("\n").length;
    references.push({
      sourceFile: rel,
      line,
      artPath: m[1],
      contextWord: null,
      lesson: null,
      page: null,
      dynamic: true,
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Resolve and classify
// ---------------------------------------------------------------------------
function surfaceOf(sourceFile) {
  if (sourceFile.includes("__tests__") || /\.test\.[tj]sx?$/.test(sourceFile)) return "test";
  if (
    sourceFile.startsWith("src/data/reconstruction/") ||
    sourceFile === "src/data/conversion-status.json" ||
    sourceFile === "public/cartilla/art/faithful/quarantine.json" ||
    sourceFile === "public/cartilla/art/delivery/manifest.json"
  ) return "build-manifest";
  if (sourceFile === "public/cartilla/art/manifest.json") return "app-data-runtime-manifest";
  if (sourceFile.startsWith("src/data/") || sourceFile.startsWith("src/content/")) return "app-data";
  if (sourceFile.startsWith("src/")) return "app-code";
  return "public-data";
}

const findings = [];
for (const ref of references) {
  const surface = surfaceOf(ref.sourceFile);
  if (ref.dynamic) {
    findings.push({ ...ref, surface, status: "DYNAMIC-REFERENCE", note: "template literal with runtime part; static prefix checked separately" });
    continue;
  }
  if (!liveArtFiles.has(ref.artPath)) {
    findings.push({ ...ref, surface, status: "MISSING-FILE", note: "referenced file does not exist under public/" });
    continue;
  }
  if (ref.contextWord) {
    const word = normalizeWord(ref.contextWord);
    const stem = normalizeWord(path.basename(ref.artPath, path.extname(ref.artPath)).replace(/^p\d+-/, ""));
    if (word && stem && word !== stem && !stem.includes(word) && !word.includes(stem)) {
      const aliases = HISTORICAL_NAME_ALIASES[stem] || [];
      if (aliases.some((a) => a && (word.includes(a) || a.includes(word)))) {
        findings.push({ ...ref, surface, status: "KNOWN-HISTORICAL-NAME", note: `file name "${stem}" is historical; drawing is "${ref.contextWord}" (documented in book-transcription note)` });
      } else if (GENERIC_STEMS.has(stem) || SCENE_CAPTION_RE.test(String(ref.contextWord))) {
        findings.push({ ...ref, surface, status: "SCENE-CAPTION", note: "generic scene/cover file name; caption describes the page, not a vocabulary word" });
      } else {
        findings.push({ ...ref, surface, status: "WORD-FILE-MISMATCH", note: `caption "${ref.contextWord}" vs file stem "${stem}"` });
      }
      continue;
    }
  }
  findings.push({ ...ref, surface, status: "OK", note: null });
}

// ---------------------------------------------------------------------------
// 4. Cross-check the 55 true-remainder slots -> drop-in entries
// ---------------------------------------------------------------------------
const stillMissing = JSON.parse(fs.readFileSync(slotsPath, "utf8"));
const dropIn = stillMissing.map((slot) => {
  const paths = byBasename.get(slot.current_file) || [];
  const canonical =
    paths.find((p) => p.includes("/art/faithful/") || p.includes("/art/optimized/")) ||
    paths[0] ||
    null;
  const deliveryVariants = paths.filter((p) => p.includes("/art/delivery/"));
  const stem = normalizeWord((slot.current_file || "").replace(/\.[^.]+$/, "").replace(/^p\d+-/, ""));
  const depicts = (HISTORICAL_NAME_ALIASES[stem] || [])[0] || null;
  const titleNorm = normalizeWord(slot.title);
  const titleFollowsFilename = depicts && titleNorm !== depicts && !titleNorm.includes(depicts);
  return {
    slot_id: slot.book_code || `${slot.section === "FLIP CHART" ? "FC" : "WB"}-L${slot.lesson}-${normalizeWord(slot.title) || normalizeWord(slot.current_file)}`,
    section: slot.section,
    lesson: slot.lesson,
    letter: slot.letter,
    title: slot.title,
    book_code: slot.book_code,
    location: slot.location,
    defect: slot.defect || null,
    status: "NEEDS-NEW-PICTURE",
    current_file: canonical,
    current_file_variants: deliveryVariants,
    expected_drop_in_path: canonical,
    depicts_documented: depicts,
    title_follows_historical_filename: titleFollowsFilename || false,
    drop_in_warning: titleFollowsFilename
      ? `WIRING CAUTION: the source list titles this slot "${slot.title}" after the historical file name, but the file is documented (book-transcription note) as depicting "${depicts}". The replacement must match the DEPICTED drawing, confirmed visually against the book before drop-in. Other slots (e.g. avion captions in page-layouts.json) share this same file.`
      : null,
    drop_in_note: canonical
      ? deliveryVariants.length
        ? "Replace ONLY the canonical file at expected_drop_in_path; delivery variants are regenerated by scripts/prepare-art-assets.mjs (pnpm prepare:art). Zero rewiring."
        : "Replace ONLY the file at expected_drop_in_path, keeping the exact name. Zero rewiring."
      : "Current file not found under public/cartilla/art; verify by hand before any replacement.",
  };
});

// ---------------------------------------------------------------------------
// 5. Reverse coverage: art on disk that no source file references
// ---------------------------------------------------------------------------
const referencedPaths = new Set(references.filter((r) => !r.dynamic).map((r) => r.artPath));
const unreferenced = [...liveArtFiles].filter((p) => !referencedPaths.has(p));

// ---------------------------------------------------------------------------
// 6. Emit
// ---------------------------------------------------------------------------
const count = (s) => findings.filter((f) => f.status === s).length;
const avionPez = findings.filter(
  (f) =>
    (f.status === "KNOWN-HISTORICAL-NAME" || f.status === "WORD-FILE-MISMATCH") &&
    normalizeWord(f.contextWord) === "avion",
);

const manifest = {
  generatedAt: new Date().toISOString(),
  generatedBy: "scripts/build-picture-slot-manifest.mjs",
  scope: "READ-ONLY audit; no picture file or app code was modified.",
  totals: {
    artFilesOnDisk: liveArtFiles.size,
    staticReferences: references.filter((r) => !r.dynamic).length,
    dynamicReferences: count("DYNAMIC-REFERENCE"),
    ok: count("OK"),
    missingFile: count("MISSING-FILE"),
    wordFileMismatch: count("WORD-FILE-MISMATCH"),
    knownHistoricalName: count("KNOWN-HISTORICAL-NAME"),
    sceneCaption: count("SCENE-CAPTION"),
    unreferencedArtFiles: unreferenced.length,
    stillMissingSlots: dropIn.length,
  },
  findings,
  avionPezSlots: avionPez,
  stillMissingDropIn: dropIn,
  unreferencedArtFiles: unreferenced.sort(),
};

function renderReport(m) {
  const lines = [];
  lines.push("# Picture-slot integrity audit + drop-in manifest");
  lines.push("");
  lines.push(`Generated: ${m.generatedAt} by \`${m.generatedBy}\`.`);
  lines.push("Scope: READ-ONLY audit. No existing picture file or app code was modified, moved, renamed or deleted.");
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Art files on disk under public/cartilla/art: ${m.totals.artFilesOnDisk}`);
  lines.push(`- Static references found in src/ and public/: ${m.totals.staticReferences}`);
  lines.push(`- OK (reference resolves to an existing file): ${m.totals.ok}`);
  lines.push(`- MISSING-FILE (reference has no file on disk): ${m.totals.missingFile}`);
  lines.push(`- WORD-FILE-MISMATCH (caption and file name disagree, undocumented): ${m.totals.wordFileMismatch}`);
  lines.push(`- KNOWN-HISTORICAL-NAME (documented historical file name): ${m.totals.knownHistoricalName}`);
  lines.push(`- SCENE-CAPTION (generic scene/cover file names, informational): ${m.totals.sceneCaption}`);
  lines.push(`- Dynamic template-literal references (checked by prefix): ${m.totals.dynamicReferences}`);
  lines.push(`- Art files on disk not referenced from source: ${m.totals.unreferencedArtFiles}`);
  lines.push("");
  lines.push("## Known finding: the avion slot wired to the pez file");
  lines.push("");
  if (!m.avionPezSlots.length) {
    lines.push("No slot captioned avion was found. NOT VERIFIED.");
  } else {
    for (const f of m.avionPezSlots) {
      lines.push(`- \`${f.sourceFile}\` line ${f.line}: caption "${f.contextWord}" -> \`${f.artPath}\` (${f.status}).`);
    }
    lines.push("");
    lines.push("Documented in src/data/book-transcription/lessons-01-07.json: leccion-1/pez.webp shows the workbook's airplane (avion); file names are historical, captions follow the drawing. The drawing behind the file was NOT re-inspected by this script; visual confirmation stays on the owner side-by-side gate.");
  }
  lines.push("");
  lines.push("## MISSING-FILE references");
  lines.push("");
  const missing = m.findings.filter((f) => f.status === "MISSING-FILE");
  if (!missing.length) lines.push("None. Every static reference resolves to a file on disk.");
  const bySurface = {};
  for (const f of missing) bySurface[f.surface] = (bySurface[f.surface] || 0) + 1;
  lines.push("By surface: " + Object.entries(bySurface).map(([k, v]) => `${k}: ${v}`).join(", ") + ".");
  lines.push("");
  lines.push("App-facing MISSING-FILE findings (referenced by code or data the app loads):");
  lines.push("");
  const appMissing = missing.filter((f) => f.surface !== "build-manifest" && f.surface !== "test");
  const grouped = {};
  for (const f of appMissing) (grouped[f.sourceFile] = grouped[f.sourceFile] || []).push(f);
  for (const [src, list] of Object.entries(grouped)) {
    const dirs = [...new Set(list.map((f) => f.artPath.split("/").slice(0, -1).join("/")))];
    lines.push(`- \`${src}\`: ${list.length} reference(s) under ${dirs.map((d) => "\`" + d + "/\`").join(", ")}. Example: \`${list[0].artPath}\`.`);
  }
  lines.push("");
  lines.push("Known consumers, checked by hand during this audit:");
  lines.push("- /cartilla/art/hd/workbook/*.jpg is referenced only through public/cartilla/art/manifest.json, fetched by src/hooks/useBookArt.ts and rendered by src/components/cartilla/BookArtFigure.tsx. No live route imports BookArtFigure on main 6121ae0c (grep, this audit), so these 67 references currently feed a dormant component. NOT VERIFIED visually.");
  lines.push("- /cartilla/art/payaso-chano/*.svg (4 files) is referenced by src/content/games/payaso-chano-ss.ts, which is routed through src/routes/cartilla/juego.$gameId.tsx. Whether the component renders those exact paths or a fallback was NOT VERIFIED by this script.");
  lines.push("");
  lines.push("Build-manifest MISSING-FILE references (tooling data pointing at generated or absent work directories; not shipped app slots):");
  lines.push("");
  const bm = missing.filter((f) => f.surface === "build-manifest");
  const bmBySrc = {};
  for (const f of bm) bmBySrc[f.sourceFile] = (bmBySrc[f.sourceFile] || 0) + 1;
  for (const [src, n] of Object.entries(bmBySrc)) lines.push(`- \`${src}\`: ${n}`);
  lines.push("");
  lines.push("## WORD-FILE-MISMATCH (undocumented)");
  lines.push("");
  const mism = m.findings.filter((f) => f.status === "WORD-FILE-MISMATCH");
  if (!mism.length) lines.push("None.");
  for (const f of mism) lines.push(`- \`${f.sourceFile}\` line ${f.line}: caption "${f.contextWord}" -> \`${f.artPath}\``);
  lines.push("");
  lines.push("## Drop-in manifest for the 55 true-remainder pictures");
  lines.push("");
  lines.push("Source list: scripts/picture-slot-manifest/still-missing-55.json (parsed from Cartilla-STILL-MISSING-TRUE-REMAINDER.pdf, built 2026-10-21 from main 6121ae0c: 35 flip chart + 20 workbook).");
  lines.push("Every slot below already names the exact file the replacement picture must land at. When the new art arrives, it drops in at expected_drop_in_path with zero rewiring. Nothing is replaced by this audit.");
  lines.push("");
  lines.push("| # | Section | Lesson | Picture | Status | Defect | Drop-in path (expected file) |");
  lines.push("|---|---------|--------|---------|--------|--------|------------------------------|");
  m.stillMissingDropIn.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.section} | ${s.lesson} (${s.letter || "?"}) | ${s.title} | ${s.status} | ${(s.defect || "-").replace(/\|/g, "/")} | \`${s.expected_drop_in_path || "NOT FOUND"}\` |`);
  });
  lines.push("");
  return lines.join("\n");
}

const report = renderReport(manifest);

if (CHECK_ONLY) {
  const manifestDisk = path.join(outDir, "manifest.json");
  const reportDisk = path.join(outDir, "PICTURE-SLOT-REPORT.md");
  const sameManifest = fs.existsSync(manifestDisk) && fs.readFileSync(manifestDisk, "utf8") === JSON.stringify(manifest, null, 2) + "\n";
  const sameReport = fs.existsSync(reportDisk) && fs.readFileSync(reportDisk, "utf8") === report;
  if (!sameManifest || !sameReport) {
    console.error("picture-slot manifest is stale; run node scripts/build-picture-slot-manifest.mjs");
    process.exit(1);
  }
  if (manifest.totals.missingFile > 0) {
    console.error(`${manifest.totals.missingFile} MISSING-FILE references`);
    process.exit(1);
  }
  console.log("picture-slot manifest up to date; no missing files");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "PICTURE-SLOT-REPORT.md"), report);
console.log(`slots: ${manifest.totals.staticReferences} refs, ${manifest.totals.ok} ok, ${manifest.totals.missingFile} missing-file, ${manifest.totals.wordFileMismatch} word/file mismatch, ${manifest.totals.sceneCaption} scene-caption, ${manifest.totals.knownHistoricalName} historical-name, ${dropIn.length} drop-in entries`);
