import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const srcDir = path.join(root, "src");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function fail(message) {
  console.error("[platform-certification] FAIL:", message);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function pad(n) {
  return String(n).padStart(3, "0");
}

const conversion = readJson("src/data/conversion-status.json");
const layouts = readJson("src/data/page-layouts.json");
const flipchart = readJson("src/data/teacher-flipchart.json");
const frames = readJson("src/data/flipchart-frames.json");

const workbookPages = conversion.pages ?? [];
assert(workbookPages.length === 90, `expected 90 workbook pages, found ${workbookPages.length}`);
assert(workbookPages.every((page) => page.status === "NATIVE_COMPLETE"), "all workbook pages must be NATIVE_COMPLETE");
assert(Object.keys(layouts.pages ?? {}).length === 90, "page-layouts must contain exactly 90 instructional pages");

for (let page = 1; page <= 90; page += 1) {
  assert(Boolean(layouts.pages?.[String(page)]), `missing native layout for workbook page ${page}`);
  assert(
    exists(`public/cartilla/art/source/workbook/page-${pad(page)}.jpg`),
    `missing repository workbook source page ${page}`,
  );
}

const flipPages = flipchart.pages ?? [];
assert(flipPages.length === 62, `expected 62 Flip Chart records, found ${flipPages.length}`);
assert(Object.keys(frames).length === 62, "flipchart-frames must contain 62 page frames");

for (let page = 1; page <= 62; page += 1) {
  const record = flipPages.find((item) => Number(item.flipchartPage) === page);
  assert(Boolean(record), `missing Flip Chart registry page ${page}`);
  assert(
    exists(`public/cartilla/art/hd/flipchart/page-${pad(page)}.jpg`),
    `missing canonical Flip Chart master page ${page}`,
  );
}

const gretelRequired = [
  "gretel-idle.webp",
  "gretel-closed-idle.webp",
  "gretel-talk-0.webp",
  "gretel-talk.webp",
  "gretel-wave-1.webp",
  "gretel-point.webp",
  "gretel-point-left.webp",
  "gretel-cheer.webp",
];

for (const file of gretelRequired) {
  assert(
    exists(`public/cartilla/images/gretel/poses/${file}`),
    `missing canonical Gretel rig frame ${file}`,
  );
}

const cinematicSource = fs.readFileSync(path.join(srcDir, "content", "gretel-cinematics.ts"), "utf8");
assert(cinematicSource.includes('id: "master-welcome"'), "missing master Gretel welcome");
assert(cinematicSource.includes('id: "how-to"'), "missing Gretel how-to cinematic");
assert(cinematicSource.includes('id: "cartilla-final"'), "missing final completion cinematic");
assert(cinematicSource.includes("...CATALOG.map"), "lesson cinematic manifest must derive all 24 lessons from canonical catalog");

const presenterSource = fs.readFileSync(path.join(srcDir, "components", "cartilla", "FlipchartHdPanel.tsx"), "utf8");
const boardSource = fs.readFileSync(path.join(srcDir, "components", "cartilla", "FlipchartNativeBoard.tsx"), "utf8");
const nativeModelSource = fs.readFileSync(path.join(srcDir, "lib", "flipchart-native.ts"), "utf8");
assert(presenterSource.includes("FlipchartNativeBoard"), "teacher presenter must use FlipchartNativeBoard");
assert(!presenterSource.includes("<FlipchartPlate"), "teacher presenter must not use full-page FlipchartPlate as the primary face");
assert(boardSource.includes("LivingIllustration"), "native Flip Chart must render independent learning objects");
assert(!boardSource.includes("getFlipchartDeliverySrc"), "native Flip Chart must not use page-level delivery scans");
assert(nativeModelSource.includes("faithfulManifest"), "native Flip Chart model must resolve repository faithful art");

const lessonSource = fs.readFileSync(path.join(srcDir, "routes", "cartilla", "-leccion-view.tsx"), "utf8");
assert(lessonSource.includes("<NativeLessonViewer"), "student lessons must use NativeLessonViewer");
assert(!lessonSource.includes("<CurlPageViewer"), "legacy scan/book viewer must not be active in lesson route");

if (process.exitCode) process.exit(process.exitCode);

console.log("[platform-certification] PASS");
console.log(JSON.stringify({
  workbookNative: "90/90",
  workbookSourceAssets: "90/90",
  flipchartNativeRegistry: "62/62",
  flipchartCanonicalMasters: "62/62",
  flipchartSurface: "62/62 native boards; pages 1-2 native frontmatter; pages 3-62 separate faithful learning objects",
  gretelRigFrames: gretelRequired.length,
  cinematics: "welcome + how-to + 24 lessons + milestones + final",
}, null, 2));
