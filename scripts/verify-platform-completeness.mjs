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
const nativeFlipchartAssets = readJson("src/data/flipchart-native-assets.json");
const optimizedFlipchartAssets = readJson("src/data/optimized-flipchart-exclusive.json");
const gretelClips = readJson("src/data/gretel-approved-clips.json");
for (const [scene, clip] of Object.entries(gretelClips)) {
  for (const [kind, src] of Object.entries(clip)) {
    assert(typeof src === "string" && src.startsWith("/cartilla/") && !src.includes(".."), `invalid Gretel ${kind} path for ${scene}`);
    if (typeof src === "string") assert(exists(`public${src}`), `missing registered Gretel ${kind} for ${scene}: ${src}`);
  }
  assert(Boolean(clip.mp4 && clip.poster), `Gretel ${scene} requires a produced clip and approved poster`);
}
const nativeCompletePages = (conversion.pages ?? []).filter((page) => page.status === "NATIVE_COMPLETE").length;
const blockedPages = (conversion.pages ?? []).filter((page) => page.status === "SOURCE_BLOCKED").map((page) => page.physicalPage);

const workbookPages = conversion.pages ?? [];
assert(workbookPages.length === 90, `expected 90 workbook pages, found ${workbookPages.length}`);
assert(
  workbookPages.every((page) =>
    [86, 87].includes(page.physicalPage) ? page.status === "SOURCE_BLOCKED" : page.status === "NATIVE_COMPLETE",
  ),
  "workbook pages must be NATIVE_COMPLETE except the source-blocked pages 86–87",
);
assert(Object.keys(layouts.pages ?? {}).length === 90, "page-layouts must contain exactly 90 instructional pages");

const verifiedSourceGap = new Set([86, 87]);
for (let page = 1; page <= 90; page += 1) {
  assert(Boolean(layouts.pages?.[String(page)]), `missing native layout for workbook page ${page}`);
  const sourcePath = `public/cartilla/art/source/workbook/page-${pad(page)}.jpg`;
  if (verifiedSourceGap.has(page)) {
    assert(!exists(sourcePath), `page ${page} must remain an explicit source-scan gap, not a substitute image`);
  } else {
    assert(exists(sourcePath), `missing repository workbook source page ${page}`);
  }
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

for (const [page, assets] of Object.entries(nativeFlipchartAssets)) {
  assert(Number(page) >= 3 && Number(page) <= 62, `invalid native Flip Chart crop page ${page}`);
  assert(Array.isArray(assets) && assets.length > 0, `native Flip Chart crop page ${page} is empty`);
  for (const asset of assets) {
    assert(
      typeof asset.src === "string" && asset.src.startsWith("/cartilla/art/faithful/flipchart-native/"),
      `invalid native Flip Chart crop destination on page ${page}`,
    );
    assert(
      exists("public/" + asset.src.replace(/^\//, "")),
      `missing generated native Flip Chart crop ${asset.src}; run pnpm prepare:art`,
    );
  }
}

// The 32 generated "exclusive" Flip Chart images were deleted per
// ASSET_FIDELITY_POLICY.md (not book art). The manifest must stay empty.
assert(
  Array.isArray(optimizedFlipchartAssets) && optimizedFlipchartAssets.length === 0,
  "optimized Flip Chart exclusive manifest must stay empty (fabricated images were removed)",
);
for (const asset of optimizedFlipchartAssets) {
  assert(
    asset.status === "FINAL_OPTIMIZED",
    `optimized Flip Chart page ${asset.flipchartPage} is not FINAL_OPTIMIZED`,
  );
  assert(
    typeof asset.src === "string" &&
      asset.src.startsWith("/cartilla/art/optimized/flipchart-exclusive/"),
    `invalid optimized Flip Chart path on page ${asset.flipchartPage}`,
  );
  assert(
    exists("public/" + asset.src.replace(/^\//, "")),
    `missing optimized Flip Chart asset ${asset.src}`,
  );
}

const gretelRigSource = fs.readFileSync(
  path.join(srcDir, "components", "gretel", "GretelLayerRig.tsx"),
  "utf8",
);
const gretelMachineSource = fs.readFileSync(
  path.join(srcDir, "components", "gretel", "gretelMachine.ts"),
  "utf8",
);
for (const part of ["head", "eyes", "pupils", "eyelids", "mouth", "torso", "left-arm", "right-arm"]) {
  assert(
    gretelRigSource.includes(`data-rig-part="${part}"`),
    `Gretel SVG rig is missing independent part ${part}`,
  );
}
assert(gretelRigSource.includes('data-gretel-rig="svg"'), "Gretel must use the vector rig");
assert(!gretelRigSource.includes("<img"), "Gretel rig must not fall back to raster pose swapping");
for (const state of ["listening", "teaching", "help", "gentle-error", "cheering"]) {
  assert(gretelMachineSource.includes(`"${state}"`), `Gretel state machine is missing ${state}`);
}

const livingRegistrySource = fs.readFileSync(
  path.join(srcDir, "lib", "living-actor-registry.ts"),
  "utf8",
);
for (const part of ["wings", "tail", "ears", "trunk"]) {
  assert(
    livingRegistrySource.includes(`name: "${part}"`),
    `living-art registry is missing independent ${part} motion`,
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
assert(nativeModelSource.includes("optimized-flipchart-exclusive"), "native Flip Chart model must load final optimized exclusive art");

const lessonSource = fs.readFileSync(path.join(srcDir, "routes", "cartilla", "-leccion-view.tsx"), "utf8");
assert(lessonSource.includes("<NativeLessonViewer"), "student lessons must use NativeLessonViewer");
assert(!lessonSource.includes("<CurlPageViewer"), "legacy scan/book viewer must not be active in lesson route");

if (process.exitCode) process.exit(process.exitCode);

console.log("[platform-certification] PASS: structural checks only; product completion remains PARTIAL");
console.log(JSON.stringify({
  completionStatus: "PARTIAL",
  workbookNative: `${nativeCompletePages}/${workbookPages.length}`,
  workbookSourceBlocked: blockedPages,
  workbookSourceAssets: "88 canonical source pages + verified scan gap at 86–87",
  flipchartNativeRegistry: "62/62",
  flipchartCanonicalMasters: "62/62",
  flipchartSurface: "62/62 native boards; pages 1-2 native frontmatter; pages 3-62 separate faithful learning objects",
  flipchartOptimizedExclusive: `${optimizedFlipchartAssets.length} assets wired; deleted experiments remain excluded`,
  gretelRig: "vector-part rig present; character fidelity is not certified by this structural check",
  livingArt: "semantic registry with independent wings/tails/ears/trunk and reduced-motion policy",
  cinematics: "31 scripted scenes; scripts do not prove that approved motion clips exist",
  gretelClips: `${Object.keys(gretelClips).length}/31 approved clips registered; missing clips use the static fallback`,
}, null, 2));
