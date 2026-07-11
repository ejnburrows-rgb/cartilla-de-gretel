#!/usr/bin/env node
/**
 * build-workbook-manifest.mjs
 *
 * Compiles every available workbook page (1..90) into a unified workbook manifest
 * JSON file (`src/data/workbook-manifest.json` and `public/cartilla/workbook-manifest.json`).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const INTERACTIONS_PATH = path.join(PROJECT_ROOT, "src/data/workbook-interactions.json");
const CONTENT_MANIFEST_PATH = path.join(PROJECT_ROOT, "src/data/content-manifest.json");
const OUT_SRC_PATH = path.join(PROJECT_ROOT, "src/data/workbook-manifest.json");
const OUT_PUBLIC_PATH = path.join(PROJECT_ROOT, "public/cartilla/workbook-manifest.json");

function pad3(n) {
  return String(n).padStart(3, "0");
}

function getLessonForPage(pageNum) {
  if (pageNum <= 3) return 1;
  if (pageNum <= 6) return 2;
  if (pageNum <= 9) return 3;
  if (pageNum <= 12) return 4;
  if (pageNum <= 15) return 5;
  if (pageNum <= 18) return 6;
  return Math.min(24, Math.floor((pageNum - 19) / 4) + 7);
}

function mapKindToType(kind) {
  switch (kind) {
    case "listen-and-tap":
    case "read-aloud":
      return "TapToHear";
    case "drag-word-to-image":
    case "drag-syllable-to-slot":
    case "drag-build-word":
      return "DragPlace";
    case "match-word-image":
      return "PairMatch";
    case "trace-or-copy":
      return "MarkCircle";
    default:
      return "TapSelect";
  }
}

function main() {
  console.log("[workbook-manifest] Building unified workbook manifest...");

  let rawInteractions = [];
  if (fs.existsSync(INTERACTIONS_PATH)) {
    const data = JSON.parse(fs.readFileSync(INTERACTIONS_PATH, "utf8"));
    rawInteractions = data.interactions || [];
  }

  let contentManifestPages = [];
  if (fs.existsSync(CONTENT_MANIFEST_PATH)) {
    const cm = JSON.parse(fs.readFileSync(CONTENT_MANIFEST_PATH, "utf8"));
    contentManifestPages = cm.pages || [];
  }

  const pages = [];
  for (let pageNum = 1; pageNum <= 90; pageNum++) {
    const lessonNum = getLessonForPage(pageNum);
    const cmPage = contentManifestPages.find((p) => p.page_number === pageNum);
    const pageInteractions = rawInteractions.filter((i) => i.pageNumber === pageNum);

    const title =
      cmPage?.content?.title ||
      pageInteractions[0]?.title ||
      `Página ${pageNum} (Lección ${lessonNum})`;
    const instruction =
      cmPage?.instructions ||
      pageInteractions[0]?.prompt ||
      "Toca las figuras y completa la actividad.";

    // Background asset
    const backgroundAsset = `/cartilla/art/hd/workbook/page-${pad3(pageNum)}.jpg`;

    // Extract positioned illustration assets
    const illustrations = [];
    if (cmPage?.assets) {
      for (const [idx, asset] of cmPage.assets.entries()) {
        illustrations.push({
          id: asset.id || `ill_${pageNum}_${idx}`,
          label: asset.description || asset.id || `Ilustración ${idx + 1}`,
          src: asset.path ? `/cartilla/art/illustrations/${asset.path}` : backgroundAsset,
          xPercent: 15 + (idx % 3) * 30,
          yPercent: 30 + Math.floor(idx / 3) * 25,
          widthPercent: 20,
          heightPercent: 20,
        });
      }
    }

    // Build interactions
    const interactions = [];
    for (const raw of pageInteractions) {
      const type = mapKindToType(raw.kind);
      if (raw.targets && raw.targets.length > 0) {
        for (const t of raw.targets) {
          interactions.push({
            id: t.id || `${raw.id}_target_${interactions.length}`,
            type,
            prompt: raw.prompt || instruction,
            label: t.label || raw.title,
            targetId: t.id,
            xPercent: t.xPercent ?? 50,
            yPercent: t.yPercent ?? 50,
            widthPercent: t.widthPercent ?? 15,
            heightPercent: t.heightPercent ?? 15,
            correctAnswer: raw.correctAnswer || t.label,
            audioText: t.label || raw.title,
          });
        }
      } else if (raw.items && raw.items.length > 0) {
        for (const [idx, item] of raw.items.entries()) {
          interactions.push({
            id: item.id || `${raw.id}_item_${idx}`,
            type,
            prompt: raw.prompt || instruction,
            label: item.label,
            xPercent: 20 + (idx % 3) * 25,
            yPercent: 40 + Math.floor(idx / 3) * 20,
            widthPercent: 18,
            heightPercent: 18,
            correctAnswer: raw.correctAnswer || item.label,
            audioText: item.label,
          });
        }
      } else {
        interactions.push({
          id: raw.id,
          type,
          prompt: raw.prompt || instruction,
          label: raw.title,
          xPercent: 50,
          yPercent: 50,
          widthPercent: 20,
          heightPercent: 20,
          correctAnswer: raw.correctAnswer || raw.title,
          audioText: raw.title,
        });
      }
    }

    // If no interactions were defined on this page, create default interactive item
    if (interactions.length === 0) {
      interactions.push({
        id: `p${pageNum}_default_interaction`,
        type: "TapSelect",
        prompt: instruction,
        label: `Página ${pageNum}`,
        xPercent: 50,
        yPercent: 45,
        widthPercent: 20,
        heightPercent: 20,
        audioText: `Página ${pageNum}`,
      });
    }

    pages.push({
      pageNumber: pageNum,
      lessonNumber: lessonNum,
      pageType: cmPage?.ui_component_type || "OfficialWorkbookPage",
      title,
      instruction,
      backgroundAsset,
      illustrations,
      interactions,
    });
  }

  const manifest = {
    version: "1.0.0",
    builtAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
  };

  fs.mkdirSync(path.dirname(OUT_SRC_PATH), { recursive: true });
  fs.writeFileSync(OUT_SRC_PATH, JSON.stringify(manifest, null, 2));

  fs.mkdirSync(path.dirname(OUT_PUBLIC_PATH), { recursive: true });
  fs.writeFileSync(OUT_PUBLIC_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `[workbook-manifest] Successfully built manifest with ${pages.length} pages -> ${OUT_SRC_PATH}`
  );
}

main();
