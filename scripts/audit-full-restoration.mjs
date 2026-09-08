#!/usr/bin/env node
/**
 * Full-book restoration completion gate.
 *
 * This does not reward filenames or file existence alone. It checks the live
 * page-layout data that FaithfulPageRenderer actually consumes and fails when
 * a visible illustration slot is still blank, a wired crop failed the manual
 * source/color QA, a wired crop is grayscale without an audited exact-workbook
 * exception, or the canonical page census is incomplete.
 *
 * The authentic-source rule is the one recorded in
 * docs/AUTHENTIC-FLIPCHART-ART-AUDIT.md:
 *   1. exact student-book drawing/layout wins;
 *   2. identical teacher-flipchart drawing may supply the authentic color;
 *   3. otherwise retain the exact student-book drawing;
 *   4. never generate/redraw/recolor/substitute.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findGrayscaleArt, VERIFIED_WORKBOOK_CROPS } from "./validate-art-color.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const layouts = readJson("src/data/page-layouts.json").pages ?? {};
const inventory = readJson("src/data/page-inventory.json").workbook?.lessons ?? [];
const qa = readJson("public/cartilla/art/faithful/qa-results.json");
const manifest = readJson("public/cartilla/art/faithful/manifest.json");
const ledgerText = fs.readFileSync(path.join(root, "docs/FULL-COLOR-RESTORATION-LEDGER.md"), "utf8");

const LEDGER_STATUSES = new Set([
  "source-faithful color complete",
  "authentic monochrome intentionally retained",
  "needs correction",
]);

function readLedgerStatusCounts() {
  const counts = {
    "source-faithful color complete": 0,
    "authentic monochrome intentionally retained": 0,
    "needs correction": 0,
  };
  let total = 0;
  for (const line of ledgerText.split(/\r?\n/)) {
    const match = line.match(/^\|\s*\d+\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|$/);
    if (!match) continue;
    const status = match[1].trim();
    if (!LEDGER_STATUSES.has(status)) continue;
    counts[status]++;
    total++;
  }
  return { counts, total };
}

const qaBySrc = new Map(
  (qa.results ?? []).map((r) => ["/" + String(r.file ?? "").replace(/^public\//, ""), r]),
);
const manifestBySrc = new Map((manifest ?? []).filter((e) => e?.src).map((e) => [e.src, e]));

const exactWorkbook = VERIFIED_WORKBOOK_CROPS;
const documentedSourceProven = new Set([
  "/cartilla/art/faithful/leccion-1/ojos.webp",
  "/cartilla/art/faithful/vocal-i/iglesia.webp",
  "/cartilla/art/faithful/vocal-u/uniforme.webp",
  "/cartilla/art/faithful/leccion-1/traje.webp",
  "/cartilla/art/faithful/vocal-u/una.webp",
  "/cartilla/art/faithful/vocal-u/uña.webp",
]);

function publicExists(src) {
  return typeof src === "string" && fs.existsSync(path.join(root, "public", src.replace(/^\//, "")));
}

function collectVisibleSlots(pageNumber, regions) {
  const slots = [];
  const add = (where, caption, src, required = true) =>
    slots.push({ pageNumber, where, caption: caption ?? "", src, required });

  for (const region of regions ?? []) {
    switch (region.regionType) {
      case "illustration-slot":
      case "paint-box":
        add(
          region.id,
          region.caption ?? region.illustrationWord ?? region.text,
          region.illustrationSrc,
          true,
        );
        break;
      case "picture-grid":
      case "vowel-line-match":
        for (const [i, cell] of (region.cells ?? []).entries()) {
          add(`${region.id}.cells[${i}]`, cell.caption, cell.illustrationSrc, true);
        }
        break;
      case "vowel-pick-one":
        for (const [ri, row] of (region.vowelRows ?? []).entries()) {
          for (const [ci, cell] of (row.cells ?? []).entries()) {
            add(`${region.id}.vowelRows[${ri}].cells[${ci}]`, cell.caption, cell.illustrationSrc, true);
          }
        }
        break;
      case "vowel-match-all":
        for (const [i, cell] of (region.vowelPairs ?? []).entries()) {
          add(`${region.id}.vowelPairs[${i}]`, cell.caption, cell.illustrationSrc, true);
        }
        break;
      case "syllable-match":
        for (const [ri, row] of (region.matchRows ?? []).entries()) {
          for (const [ci, cell] of row.entries()) {
            if (cell.illustrationSrc) {
              add(`${region.id}.matchRows[${ri}][${ci}]`, cell.word, cell.illustrationSrc, false);
            }
          }
        }
        break;
      case "fill-in-blank":
        for (const [i, item] of (region.fillItems ?? []).entries()) {
          if (item.illustrationSrc) {
            add(`${region.id}.fillItems[${i}]`, item.wordBox, item.illustrationSrc, false);
          }
        }
        break;
    }
  }
  return slots;
}

async function main() {
  const issues = [];
  const pages = Object.entries(layouts)
    .map(([n, page]) => ({
      pageNumber: Number(n),
      regions: Array.isArray(page) ? page : (page?.regions ?? []),
    }))
    .sort((a, b) => a.pageNumber - b.pageNumber);

  if (!pages.length) issues.push({ type: "PAGE-CENSUS", detail: "no page layouts found" });
  const maxPage = pages.at(-1)?.pageNumber ?? 0;
  for (let n = 1; n <= maxPage; n++) {
    if (!Object.hasOwn(layouts, String(n))) {
      issues.push({ type: "PAGE-CENSUS", page: n, detail: "missing canonical page layout" });
    }
  }

  let inventoryCount = 0;
  for (const lesson of inventory) {
    for (const rel of lesson.pages ?? []) {
      inventoryCount++;
      const src = `/cartilla/images/source/${rel}`;
      if (!publicExists(src)) {
        issues.push({ type: "MISSING-SOURCE-PAGE", lesson: lesson.lessonId, src });
      }
    }
  }

  const ledger = readLedgerStatusCounts();
  if (ledger.total !== inventoryCount) {
    issues.push({
      type: "LEDGER-CENSUS",
      detail: `ledger has ${ledger.total} workbook rows but inventory has ${inventoryCount}`,
    });
  }

  const slots = pages.flatMap((p) => collectVisibleSlots(p.pageNumber, p.regions));
  const grayscale = new Map((await findGrayscaleArt()).map((x) => [x.rel, x.spread]));
  const pageIssues = new Map();
  const notePageIssue = (page, issue) => {
    if (!pageIssues.has(page)) pageIssues.set(page, []);
    pageIssues.get(page).push(issue);
    issues.push(issue);
  };

  for (const slot of slots) {
    if (!slot.src) {
      if (slot.required) {
        notePageIssue(slot.pageNumber, {
          type: "BLANK-VISIBLE-ART",
          page: slot.pageNumber,
          where: slot.where,
          caption: slot.caption,
        });
      }
      continue;
    }
    if (/\/cartilla\/art\/(?:color\/generated|color\/workbook|generated|remastered)\//.test(slot.src)) {
      notePageIssue(slot.pageNumber, {
        type: "BANNED-ART-FAMILY",
        page: slot.pageNumber,
        where: slot.where,
        src: slot.src,
      });
      continue;
    }
    if (!publicExists(slot.src)) {
      notePageIssue(slot.pageNumber, {
        type: "MISSING-ART-FILE",
        page: slot.pageNumber,
        where: slot.where,
        src: slot.src,
      });
      continue;
    }

    const q = qaBySrc.get(slot.src);
    const m = manifestBySrc.get(slot.src);
    const sourceProven =
      q?.verdict === "PASS" || exactWorkbook.has(slot.src) || documentedSourceProven.has(slot.src);
    if (!sourceProven) {
      notePageIssue(slot.pageNumber, {
        type: q?.verdict === "FAIL" ? "QA-FAILED-ART" : "UNPROVEN-ART",
        page: slot.pageNumber,
        where: slot.where,
        src: slot.src,
        manifestSource: m?.source ?? m?.sourcePage ?? null,
      });
    }
    if (grayscale.has(slot.src) && !exactWorkbook.has(slot.src) && !documentedSourceProven.has(slot.src)) {
      notePageIssue(slot.pageNumber, {
        type: "UNAPPROVED-GRAYSCALE-ART",
        page: slot.pageNumber,
        where: slot.where,
        src: slot.src,
        spread: Number(grayscale.get(slot.src).toFixed(2)),
      });
    }
  }

  const unresolvedPages = [...pageIssues.keys()].sort((a, b) => a - b);
  const sourceSafePages = pages.map((p) => p.pageNumber).filter((n) => !pageIssues.has(n));
  const ledgerNeedsCorrection = ledger.counts["needs correction"];
  const ledgerColorComplete = ledger.counts["source-faithful color complete"];
  const ledgerMonochromeComplete = ledger.counts["authentic monochrome intentionally retained"];
  const restorationComplete = issues.length === 0 && ledgerNeedsCorrection === 0;

  const report = {
    canonicalLayoutPages: pages.length,
    canonicalMaxPage: maxPage,
    inventorySourcePages: inventoryCount,
    inventoryLedgerPages: ledger.total,
    visibleIllustrationSlots: slots.filter((s) => s.required).length,
    rendererSourceSafePages: sourceSafePages.length,
    rendererUnresolvedPages: unresolvedPages.length,
    rendererUnresolvedPageNumbers: unresolvedPages,
    ledgerColorComplete,
    ledgerMonochromeComplete,
    ledgerNeedsCorrection,
    restorationComplete,
    safetyIssues: issues.length,
  };

  console.log("FULL_RESTORATION_REPORT " + JSON.stringify(report));
  if (issues.length) {
    console.error("FULL_RESTORATION_ISSUES_BEGIN");
    for (const issue of issues) console.error(JSON.stringify(issue));
    console.error("FULL_RESTORATION_ISSUES_END");
    process.exit(1);
  }

  if (restorationComplete) {
    console.log(`✓ full restoration gate: ${ledger.total}/${ledger.total} workbook pages source-verified; 0 unresolved`);
  } else {
    console.log(
      `↪ restoration safety gate passes, but completion remains open: ${ledgerNeedsCorrection}/${ledger.total} workbook pages still need correction/source verification`,
    );
  }
}

main().catch((error) => {
  console.error("full restoration audit crashed:", error);
  process.exit(1);
});
