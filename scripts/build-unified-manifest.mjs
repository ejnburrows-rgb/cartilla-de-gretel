#!/usr/bin/env node
/**
 * build-unified-manifest.mjs
 *
 * Merges three data sources into one unified art manifest:
 *  1. Workbook HD page scans (public/cartilla/art/hd/workbook/)
 *  2. Flipchart HD page scans (public/cartilla/art/hd/flipchart/)
 *  3. Individual illustration crops (public/cartilla/art/illustrations/)
 *     — matched to the gemini-code content manifest entries
 *
 * Output: public/cartilla/art/manifest.json
 *
 * Usage:
 *   node scripts/build-unified-manifest.mjs [--content-manifest path/to/gemini-code.json]
 */

import fs from "node:fs";
import path from "node:path";

// ────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────
const PROJECT_ROOT = process.cwd();
const MANIFEST_OUT = path.join(PROJECT_ROOT, "public/cartilla/art/manifest.json");
const WORKBOOK_HD_DIR = path.join(PROJECT_ROOT, "public/cartilla/art/hd/workbook");
const FLIPCHART_HD_DIR = path.join(PROJECT_ROOT, "public/cartilla/art/hd/flipchart");
const ILLUSTRATIONS_DIR = path.join(PROJECT_ROOT, "public/cartilla/art/illustrations");
const CONTENT_MANIFEST_DEFAULT = path.join(PROJECT_ROOT, "src/data/content-manifest.json");

// Lesson-to-page mapping for the workbook (same as existing manifest)
// Each lesson = 1 workbook HD scan. The lesson's "main page" in the HD scans.
const WORKBOOK_LESSON_PAGES = {};
for (let i = 1; i <= 24; i++) {
  WORKBOOK_LESSON_PAGES[i] = i + 1; // lesson 1 → page-002, lesson 2 → page-003, etc.
}

// Flipchart lesson-to-page mapping (from page-inventory.json)
const FLIPCHART_LESSON_PAGES = {
  1: [1, 2, 3, 4, 5, 6],
  2: [2],
  3: [3],
  4: [4],
  5: [5],
  6: [6],
  7: [7, 8, 9],
  8: [10, 11, 12],
  9: [13, 14, 15],
  10: [16, 17, 18],
  11: [19, 20, 21],
  12: [22, 23, 24],
  13: [25, 26, 27],
  14: [28, 29, 30],
  15: [31, 32, 33],
  16: [34, 35, 36],
  17: [37, 38, 39],
  18: [40, 41, 42],
  19: [43, 44, 45],
  20: [46, 47, 48],
  21: [49, 50, 51],
  22: [52, 53, 54],
  23: [55, 56, 57],
  24: [58, 59, 60],
};

// ────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────
function padPage(n, digits = 3) {
  return String(n).padStart(digits, "0");
}

function workbookPagePath(pageNum) {
  return `/cartilla/art/hd/workbook/page-${padPage(pageNum)}.jpg`;
}

function flipchartPagePath(pageNum) {
  return `/cartilla/art/hd/flipchart/page-${padPage(pageNum)}.jpg`;
}

/** Scan the illustrations directory and build a filename->web-path map */
function scanIllustrations() {
  const map = new Map();
  if (!fs.existsSync(ILLUSTRATIONS_DIR)) return map;
  for (const f of fs.readdirSync(ILLUSTRATIONS_DIR)) {
    if (/\.(jpe?g|png|webp)$/i.test(f)) {
      map.set(f, `/cartilla/art/illustrations/${f}`);
    }
  }
  return map;
}

/** Scan workbook HD pages */
function scanWorkbookPages() {
  const pages = [];
  if (!fs.existsSync(WORKBOOK_HD_DIR)) return pages;
  for (const f of fs.readdirSync(WORKBOOK_HD_DIR).sort()) {
    const m = f.match(/page-(\d+)\.(jpg|png|webp)/i);
    if (m) pages.push({ pageNum: parseInt(m[1], 10), file: f });
  }
  return pages;
}

/** Scan flipchart HD pages */
function scanFlipchartPages() {
  const pages = [];
  if (!fs.existsSync(FLIPCHART_HD_DIR)) return pages;
  for (const f of fs.readdirSync(FLIPCHART_HD_DIR).sort()) {
    const m = f.match(/page-(\d+)\.(jpg|png|webp)/i);
    if (m) pages.push({ pageNum: parseInt(m[1], 10), file: f });
  }
  return pages;
}

// ────────────────────────────────────────────────────────
// Match illustration files to content manifest entries
// ────────────────────────────────────────────────────────

/**
 * Given the content manifest (gemini-code JSON) and the illustrations map,
 * resolve null paths to actual illustration file paths where the manifest
 * already has a filename reference.
 */
function resolveIllustrationPaths(contentManifest, illustrationsMap) {
  if (!contentManifest?.pages) return contentManifest;

  let resolved = 0;
  let total = 0;
  let alreadySet = 0;

  for (const page of contentManifest.pages) {
    // Check all the different places assets can appear
    const assetContainers = [];

    // Top-level assets array
    if (page.assets) assetContainers.push(page.assets);
    if (page.auxiliary_assets) assetContainers.push(page.auxiliary_assets);

    // Vocabulary cards
    if (page.vocabulary_cards) assetContainers.push(page.vocabulary_cards);

    // Grid items
    if (page.grid_items) assetContainers.push(page.grid_items);

    // Target options
    if (page.target_options) assetContainers.push(page.target_options);

    // Matching pairs
    if (page.matching_pairs) assetContainers.push(page.matching_pairs);

    // Exercise rows (nested)
    if (page.exercise_rows) {
      for (const row of page.exercise_rows) {
        if (row.items) assetContainers.push(row.items);
      }
    }

    for (const container of assetContainers) {
      for (const asset of container) {
        const pathKey = asset.path !== undefined ? "path" : "image_path";
        const currentPath = asset[pathKey];

        if (currentPath === undefined && asset.image_path === undefined) continue;

        total++;

        if (currentPath && currentPath !== null) {
          // Already has a path — resolve it if it's a Flow filename
          const filename = currentPath;
          if (illustrationsMap.has(filename)) {
            asset[pathKey] = illustrationsMap.get(filename);
            alreadySet++;
          } else {
            // Check with .jpg and .jpeg variants
            const jpegVariant = filename.replace(/\.jpg$/, ".jpeg");
            const jpgVariant = filename.replace(/\.jpeg$/, ".jpg");
            if (illustrationsMap.has(jpegVariant)) {
              asset[pathKey] = illustrationsMap.get(jpegVariant);
              alreadySet++;
            } else if (illustrationsMap.has(jpgVariant)) {
              asset[pathKey] = illustrationsMap.get(jpgVariant);
              alreadySet++;
            } else {
              alreadySet++;
            }
          }
        }
        // null paths stay null — they need manual matching
      }
    }
  }

  console.log(
    `[manifest] Illustration paths: ${alreadySet} resolved, ${total - alreadySet} still null out of ${total} total`,
  );
  return contentManifest;
}

// ────────────────────────────────────────────────────────
// Build the unified manifest
// ────────────────────────────────────────────────────────
function buildManifest(contentManifest) {
  const illustrationsMap = scanIllustrations();
  const workbookPages = scanWorkbookPages();
  const flipchartPages = scanFlipchartPages();

  console.log(`[manifest] Found ${illustrationsMap.size} illustration files`);
  console.log(`[manifest] Found ${workbookPages.length} workbook HD pages`);
  console.log(`[manifest] Found ${flipchartPages.length} flipchart HD pages`);

  // Resolve illustration paths in the content manifest
  const resolvedContent = contentManifest
    ? resolveIllustrationPaths(JSON.parse(JSON.stringify(contentManifest)), illustrationsMap)
    : null;

  // Build workbook lessons section (backward compatible with existing useBookArt)
  const workbookLessons = {};
  for (let lesson = 1; lesson <= 24; lesson++) {
    const pageNum = WORKBOOK_LESSON_PAGES[lesson];
    const exists = workbookPages.some((p) => p.pageNum === pageNum);
    if (exists) {
      workbookLessons[lesson] = {
        pageThumb: workbookPagePath(pageNum),
        pages: [workbookPagePath(pageNum)],
      };
    }
  }

  // Build flipchart section
  const flipchartLessons = {};
  for (const [lesson, pageNums] of Object.entries(FLIPCHART_LESSON_PAGES)) {
    const paths = pageNums
      .filter((pn) => flipchartPages.some((fp) => fp.pageNum === pn))
      .map(flipchartPagePath);

    if (paths.length > 0) {
      flipchartLessons[lesson] = {
        pageThumb: paths[0],
        pages: paths,
      };
    }
  }

  // Build unified manifest
  const manifest = {
    builtAt: new Date().toISOString(),
    version: "2.0.0",
    cover: workbookPagePath(1),

    // ── Backward-compatible: existing useBookArt reads this ──
    lessons: workbookLessons,

    // ── New: flipchart data ──
    flipchart: {
      totalPages: flipchartPages.length,
      lessons: flipchartLessons,
    },

    // ── New: per-page content with illustration paths ──
    // (the resolved gemini-code manifest pages)
    ...(resolvedContent?.pages
      ? {
          content: {
            metadata: resolvedContent.book_metadata || {},
            pages: resolvedContent.pages,
          },
        }
      : {}),

    // ── Illustration inventory ──
    illustrations: {
      totalFiles: illustrationsMap.size,
      basePath: "/cartilla/art/illustrations",
      files: Array.from(illustrationsMap.keys()).sort(),
    },
  };

  return manifest;
}

// ────────────────────────────────────────────────────────
// Also rebuild teacher-flipchart.json with lesson mappings
// ────────────────────────────────────────────────────────
function rebuildTeacherFlipchartJson() {
  const outPath = path.join(PROJECT_ROOT, "src/data/teacher-flipchart.json");
  const flipchartPages = scanFlipchartPages();

  // Build a reverse map: page number → lesson number
  const pageToLesson = {};
  for (const [lesson, pages] of Object.entries(FLIPCHART_LESSON_PAGES)) {
    for (const p of pages) {
      pageToLesson[p] = parseInt(lesson, 10);
    }
  }

  const pages = flipchartPages.map((fp) => ({
    flipchartPage: fp.pageNum,
    lesson: pageToLesson[fp.pageNum] || null,
    path: `cartilla/art/hd/flipchart/page-${padPage(fp.pageNum)}.jpg`,
    type: "flipchart",
    status: "original source connected",
    remasterStatus: "original only",
  }));

  const data = { pages };
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(
    `[manifest] Rebuilt teacher-flipchart.json with ${pages.length} pages and lesson mappings`,
  );
}

// ────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────
function main() {
  // Find content manifest
  const args = process.argv.slice(2);
  let contentManifestPath = CONTENT_MANIFEST_DEFAULT;
  const cmIdx = args.indexOf("--content-manifest");
  if (cmIdx !== -1 && args[cmIdx + 1]) {
    contentManifestPath = path.resolve(args[cmIdx + 1]);
  }

  let contentManifest = null;
  if (fs.existsSync(contentManifestPath)) {
    try {
      contentManifest = JSON.parse(fs.readFileSync(contentManifestPath, "utf8"));
      console.log(`[manifest] Loaded content manifest from ${contentManifestPath}`);
    } catch (e) {
      console.warn(`[manifest] Failed to parse content manifest: ${e.message}`);
    }
  } else {
    console.log(
      `[manifest] No content manifest found at ${contentManifestPath}, building without it`,
    );
  }

  // Build unified manifest
  const manifest = buildManifest(contentManifest);

  // Write manifest
  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));
  console.log(
    `[manifest] Wrote unified manifest to ${MANIFEST_OUT}`,
    `(${Object.keys(manifest.lessons).length} workbook lessons,`,
    `${Object.keys(manifest.flipchart.lessons).length} flipchart lessons,`,
    `${manifest.illustrations.totalFiles} illustrations)`,
  );

  // Rebuild teacher-flipchart.json with lesson mappings
  rebuildTeacherFlipchartJson();

  console.log("[manifest] Done!");
}

main();
