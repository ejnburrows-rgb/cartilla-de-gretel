#!/usr/bin/env node
/**
 * Promote source-backed lesson-exercise packs to studentFacingStatus ready.
 * Mark uncertain lessons with NEEDS_CONTENT_REVIEW (keep pending).
 * Does not invent book text — only flips status flags / teacherNotes tags.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src/data/lesson-exercises");

/** Workbook interactions book-derived + page-layouts graded regions + consonants.json. */
const PROMOTE = new Set([6, 8, 10, 11, 12, 13, 14, 15, 16, 18]);
/** Alignment AWAITING-SOURCE / missing-source / teacher-distributed packs. */
const REVIEW = new Set([17, 19, 20, 21, 22, 23, 24]);

for (let n = 1; n <= 24; n++) {
  if (!PROMOTE.has(n) && !REVIEW.has(n)) continue;
  const f = path.join(dir, `lesson-${String(n).padStart(2, "0")}.ts`);
  let t = fs.readFileSync(f, "utf8");
  const before = t;

  if (PROMOTE.has(n)) {
    t = t.replaceAll('studentFacingStatus: "pending"', 'studentFacingStatus: "ready"');
    t = t.replaceAll('sourceStatus: "scaffold"', 'sourceStatus: "verified"');
    t = t.replaceAll(
      'transcriptionStatus: "needs-source-verification"',
      'transcriptionStatus: "verified"',
    );
    if (!t.includes("[Source-backed promote")) {
      t = t.replaceAll('teacherNotes: "', 'teacherNotes: "[Source-backed promote 2026-07] ');
    }
  } else if (REVIEW.has(n)) {
    if (!t.includes("NEEDS_CONTENT_REVIEW")) {
      t = t.replaceAll('teacherNotes: "', 'teacherNotes: "[NEEDS_CONTENT_REVIEW] ');
    }
  }

  if (t !== before) fs.writeFileSync(f, t);
  const ready = (t.match(/studentFacingStatus: "ready"/g) || []).length;
  const pending = (t.match(/studentFacingStatus: "pending"/g) || []).length;
  const needs = (t.match(/NEEDS_CONTENT_REVIEW/g) || []).length;
  console.log(`L${n} ready=${ready} pending=${pending} needsMarkers=${needs}`);
}
