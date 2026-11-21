#!/usr/bin/env node
/**
 * Generates public/review/workbook-artwork-audit.json covering all 90 Workbook
 * pages (1–90, preserving 86–87 as SOURCE_BLOCKED) and every workbook image
 * asset (wired in page-layouts.json, flagged in ARTWORK-ISSUES.csv, or
 * present in faithful-art-manifest.json / public/cartilla/art/faithful/).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const layouts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/page-layouts.json"), "utf8"));
const faithfulManifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/faithful-art-manifest.json"), "utf8"));
const lessonsJson = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/lessons.json"), "utf8"));

// Parse docs/review-2026-11-16/ARTWORK-ISSUES.csv
const csvRaw = fs.readFileSync(path.join(ROOT, "docs/review-2026-11-16/ARTWORK-ISSUES.csv"), "utf8").trim().split(/\r?\n/);
const flaggedByKey = new Map();
const flaggedByPage = new Map();
for (const line of csvRaw.slice(1)) {
  const m = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),(\d+),"?([^"]*)"?,([^,]+)$/);
  if (!m) continue;
  const [, issueId, category, servedPath, word, pageStr, detail, status] = m;
  const page = Number(pageStr);
  const entry = { issueId, category, servedPath, word, page, detail, status };
  flaggedByKey.set(`${page}:${word.toLowerCase()}`, entry);
  flaggedByKey.set(`${page}:${path.basename(servedPath, path.extname(servedPath)).toLowerCase()}`, entry);
  if (!flaggedByPage.has(page)) flaggedByPage.set(page, []);
  flaggedByPage.get(page).push(entry);
}

// Map page -> lesson number from lessons.json
const pageToLesson = new Map();
for (const l of lessonsJson.lessons || lessonsJson) {
  const n = l.lessonNumber ?? l.n;
  for (const p of l.pages || l.workbookPages || []) {
    pageToLesson.set(Number(p), { n, title: l.title || `Lección ${n}` });
  }
}

function publicExists(webPath) {
  if (!webPath) return false;
  return fs.existsSync(path.join(ROOT, "public", webPath.replace(/^\//, "")));
}

function pageScanPath(pageNum) {
  if (pageNum === 86 || pageNum === 87) return null;
  const p = `/cartilla/art/source/workbook/page-${String(pageNum).padStart(3, "0")}.jpg`;
  return publicExists(p) ? p : null;
}

const items = [];
const seenPageWord = new Set();
let countReady = 0;
let countFlagged = 0;
let countMissing = 0;
let countNotIntegrated = 0;
let countSourceBlocked = 0;
let countTextOnly = 0;

for (let pageNum = 1; pageNum <= 90; pageNum++) {
  const lessonInfo = pageToLesson.get(pageNum) || { n: null, title: "" };
  const scan = pageScanPath(pageNum);

  if (pageNum === 86 || pageNum === 87) {
    countSourceBlocked++;
    items.push({
      id: `WB-${String(pageNum).padStart(3, "0")}-BLOCKED`,
      page: pageNum,
      lesson: lessonInfo.n,
      lessonTitle: lessonInfo.title,
      word: "Páginas 86–87",
      pageImage: null,
      servedPath: null,
      box: null,
      status: "SOURCE_BLOCKED",
      problem: "Pages 86–87 are permanently absent from the authoritative physical book scan (85 → 88).",
    });
    continue;
  }

  const pageData = layouts.pages[String(pageNum)];
  const pageAssets = [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node.illustrationSrc === "string") {
      pageAssets.push({
        word: node.caption || node.word || node.label || path.basename(node.illustrationSrc, path.extname(node.illustrationSrc)),
        servedPath: node.illustrationSrc,
        box:
          typeof node.x === "number" && typeof node.y === "number" && typeof node.width === "number" && typeof node.height === "number"
            ? { x: node.x, y: node.y, width: node.width, height: node.height }
            : null,
      });
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") walk(v);
    }
  };
  if (pageData) walk(pageData);

  // Add any flagged assets on this page that aren't wired in page-layouts.json
  const pageFlags = flaggedByPage.get(pageNum) || [];

  let idx = 0;
  for (const asset of pageAssets) {
    idx++;
    const key = `${pageNum}:${asset.word.toLowerCase()}`;
    seenPageWord.add(key);
    const slugKey = `${pageNum}:${path.basename(asset.servedPath, path.extname(asset.servedPath)).toLowerCase()}`;
    const flag = flaggedByKey.get(key) || flaggedByKey.get(slugKey);
    const exists = publicExists(asset.servedPath);

    let status = "READY";
    let problem = "Configured image exists on disk; ready for owner visual approval.";
    if (!exists) {
      status = "MISSING";
      problem = `Configured file missing on disk: ${asset.servedPath}`;
      countMissing++;
    } else if (flag) {
      status = "FLAGGED";
      problem = `${flag.issueId} (${flag.category}): ${flag.detail}`;
      countFlagged++;
    } else {
      countReady++;
    }

    items.push({
      id: `WB-${String(pageNum).padStart(3, "0")}-${String(idx).padStart(2, "0")}`,
      page: pageNum,
      lesson: lessonInfo.n,
      lessonTitle: lessonInfo.title,
      word: asset.word,
      pageImage: scan,
      servedPath: asset.servedPath,
      candidatePath: flag && publicExists(flag.servedPath) && flag.servedPath !== asset.servedPath ? flag.servedPath : null,
      box: asset.box,
      status,
      problem,
    });
  }

  // Include any flagged assets for this page not already listed from page-layouts.json
  for (const flag of pageFlags) {
    const key = `${pageNum}:${flag.word.toLowerCase()}`;
    if (seenPageWord.has(key)) continue;
    seenPageWord.add(key);
    idx++;
    const exists = publicExists(flag.servedPath);
    if (exists) countFlagged++;
    else countMissing++;
    items.push({
      id: `WB-${String(pageNum).padStart(3, "0")}-${String(idx).padStart(2, "0")}`,
      page: pageNum,
      lesson: lessonInfo.n,
      lessonTitle: lessonInfo.title,
      word: flag.word,
      pageImage: scan,
      servedPath: exists ? flag.servedPath : null,
      box: null,
      status: exists ? "FLAGGED" : "MISSING",
      problem: `${flag.issueId} (${flag.category}): ${flag.detail} — Not yet wired in page-layouts.json.`,
    });
  }

  // Check faithful-art-manifest items for this page not already listed
  for (const fm of faithfulManifest) {
    if (fm.pageNumber !== pageNum) continue;
    const key = `${pageNum}:${fm.word.toLowerCase()}`;
    if (seenPageWord.has(key)) continue;
    seenPageWord.add(key);
    idx++;
    const exists = publicExists(fm.src);
    if (exists) countNotIntegrated++;
    else countMissing++;
    items.push({
      id: `WB-${String(pageNum).padStart(3, "0")}-${String(idx).padStart(2, "0")}`,
      page: pageNum,
      lesson: lessonInfo.n,
      lessonTitle: lessonInfo.title,
      word: fm.word,
      pageImage: scan,
      servedPath: exists ? fm.src : null,
      box: null,
      status: exists ? "NOT_INTEGRATED" : "MISSING",
      problem: exists
        ? `Faithful crop exists (${fm.src}) but is not yet wired into page-layouts.json.`
        : `Missing file: ${fm.src}`,
    });
  }

  // If page has 0 picture assets (e.g. trace/read/fill-blank pages), include a page-level entry so all 90 pages are represented
  if (idx === 0) {
    countTextOnly++;
    const regionTypes = (pageData?.regions || []).map((r) => r.regionType).filter((t) => !["footer", "page-number", "title", "instruction"].includes(t));
    items.push({
      id: `WB-${String(pageNum).padStart(3, "0")}-PAGE`,
      page: pageNum,
      lesson: lessonInfo.n,
      lessonTitle: lessonInfo.title,
      word: `Página ${pageNum} (${regionTypes.join(", ") || "ejercicios"})`,
      pageImage: scan,
      servedPath: null,
      box: null,
      status: "TEXT_ONLY",
      problem: "Tracing, reading, or fill-in-the-blank page (no individual picture cutouts configured). Upload an asset here if a drawing is missing.",
    });
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  summary: {
    "Total Workbook Pages": "90 (88 scanned + 2 SOURCE_BLOCKED pp. 86–87)",
    "Total Audit Rows": String(items.length),
    "Ready (on disk, wired)": String(countReady),
    "Flagged (27 crop/edge issues)": String(countFlagged),
    "Not Integrated (on disk, unwired)": String(countNotIntegrated),
    "Missing Files": String(countMissing),
    "Text / Tracing Pages": String(countTextOnly),
    "Source Blocked (pp. 86–87)": String(countSourceBlocked),
  },
  items,
};

const outPath = path.join(ROOT, "public/review/workbook-artwork-audit.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log("Wrote", outPath, out.summary);
