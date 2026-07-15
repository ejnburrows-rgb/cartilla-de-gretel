#!/usr/bin/env node
/**
 * Honest activity inventory for all 24 lessons.
 * Sources:
 *  - Production lesson routes via lesson catalog page ranges
 *  - src/data/lesson-exercises/* (activity carousel / exercise packs)
 *  - workbook-manifest.json interaction kinds (living engine)
 *  - Faithful page layout interaction markers when present
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "generated", "release-integration-qa");
fs.mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "src/content/workbook/workbook-manifest.json"), "utf8"),
);

// Lesson page ranges from catalog constants (mirrored for script independence)
const LESSON_PAGES = {
  1: "1-3",
  2: "4-6",
  3: "7-9",
  4: "10-12",
  5: "13-15",
  6: "16-18",
  7: "19-22",
  8: "23-26",
  9: "27-30",
  10: "31-34",
  11: "35-38",
  12: "39-42",
  13: "43-46",
  14: "47-50",
  15: "51-54",
  16: "55-58",
  17: "59-62",
  18: "63-66",
  19: "67-70",
  20: "71-74",
  21: "75-78",
  22: "79-82",
  23: "83-86",
  24: "87-90",
};

function parseRange(r) {
  const [a, b] = String(r).split("-").map(Number);
  const start = a || 1;
  const end = b || start;
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

function inventoryLessonExerciseFile(n) {
  const file = path.join(
    root,
    "src/data/lesson-exercises",
    `lesson-${String(n).padStart(2, "0")}.ts`,
  );
  if (!fs.existsSync(file)) {
    return {
      exists: false,
      workingTypes: [],
      placeholderCount: 0,
      disabledCount: 0,
      exerciseCount: 0,
    };
  }
  const text = fs.readFileSync(file, "utf8");
  const kinds = [...text.matchAll(/\bkind:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const statuses = [...text.matchAll(/studentFacingStatus:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  const placeholderCount = (text.match(/Pr[oó]ximamente|coming.?soon/gi) || []).length;
  const notReady = statuses.filter((s) => s !== "ready").length;
  const disabledCount = (text.match(/disabled:\s*true/g) || []).length + notReady;
  return {
    exists: true,
    workingTypes: [...new Set(kinds)],
    placeholderCount,
    disabledCount,
    exerciseCount: kinds.length,
    readyCount: statuses.filter((s) => s === "ready").length,
    statusBreakdown: statuses.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}),
  };
}

const inventory = [];
let incompleteLessons = [];

for (let n = 1; n <= 24; n++) {
  const pageRange = LESSON_PAGES[n];
  const pages = parseRange(pageRange);
  const manifestPages = (manifest.pages || []).filter((p) => {
    const lesson = p.lesson ?? p.lessonNumber;
    return Number(lesson) === n;
  });
  const interactionKinds = {};
  for (const p of manifestPages) {
    const k = p.interaction?.kind ?? "none";
    interactionKinds[k] = (interactionKinds[k] || 0) + 1;
  }
  const liveInteractions = Object.entries(interactionKinds)
    .filter(([k]) => k !== "none")
    .reduce((s, [, c]) => s + c, 0);

  const exercises = inventoryLessonExerciseFile(n);
  const missingContent = !exercises.exists && liveInteractions === 0;
  const incomplete =
    missingContent ||
    exercises.placeholderCount > 0 ||
    exercises.disabledCount > 0 ||
    exercises.exerciseCount === 0;

  if (incomplete) incompleteLessons.push(n);

  inventory.push({
    lesson: n,
    pageRange,
    pages,
    manifestPageCount: manifestPages.length,
    livingInteractionKinds: interactionKinds,
    livingWorkingInteractions: liveInteractions,
    productionExerciseFile: exercises.exists,
    productionWorkingTypes: exercises.workingTypes,
    productionExerciseCount: exercises.exerciseCount,
    placeholderCount: exercises.placeholderCount,
    disabledInteractionCount: exercises.disabledCount,
    missingContentState: missingContent,
    progressSavePath: "recordEvent via student-session + FaithfulPageRenderer exercises",
    incomplete,
  });
}

const terminal =
  incompleteLessons.length === 0
    ? "ACTIVITIES_COMPLETE"
    : incompleteLessons.length === 24
      ? "ACTIVITIES_BLOCKED"
      : "ACTIVITIES_PARTIAL";

const report = {
  generatedAt: new Date().toISOString(),
  terminal,
  incompleteLessons,
  workbookManifestPages: manifest.pages?.length ?? 0,
  lessons: inventory,
  notes: [
    "Living workbook manifest pages currently declare interaction.kind=none for all 90 pages.",
    "Production student interactions live in FaithfulPageRenderer + InteractivePageExercises + lesson-exercises packs.",
    "A lesson is incomplete if its exercise pack is missing, empty, disabled, or labeled Próximamente.",
  ],
};

const jsonPath = path.join(outDir, "activities-inventory.json");
const mdPath = path.join(outDir, "activities-inventory.md");
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const lines = [
  "# Activities inventory (executed)",
  "",
  `Terminal: **${terminal}**`,
  `Incomplete lessons: ${incompleteLessons.join(", ") || "none"}`,
  `Workbook manifest pages: ${report.workbookManifestPages}`,
  "",
  "| Lesson | Pages | Prod exercises | Types | Placeholders | Living ix | Incomplete |",
  "|---:|---|---:|---|---:|---:|:---:|",
];
for (const row of inventory) {
  lines.push(
    `| ${row.lesson} | ${row.pageRange} | ${row.productionExerciseCount} | ${row.productionWorkingTypes.join(", ") || "—"} | ${row.placeholderCount} | ${row.livingWorkingInteractions} | ${row.incomplete ? "yes" : "no"} |`,
  );
}
fs.writeFileSync(mdPath, lines.join("\n") + "\n");

console.log(JSON.stringify({ terminal, incompleteLessons, jsonPath, mdPath }, null, 2));
process.exit(0);
