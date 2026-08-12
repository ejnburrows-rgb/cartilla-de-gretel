/**
 * scripts/validate-art-color.mjs
 *
 * (No shebang: this file is imported by art-color-completeness.test.ts, and
 * vite's inline module transform leaves a mid-file shebang in place, which is
 * a parse error. It is always invoked as `node scripts/validate-art-color.mjs`.)
 *
 * The colorization invariant this repo kept losing. Existence/size validators
 * (validate-content.mjs, art-slots-integrity.test.ts) pass on a fully-formed
 * *grayscale* webp, so uncolored book drawings (uña, uniforme, abeja, ...)
 * shipped invisibly again and again. This reads actual pixels and fails on:
 *
 *   1. COLOR       — any wired illustrationSrc that is grayscale without
 *                     verified exact-workbook provenance.
 *   2. COMPLETENESS — any consonant OR vowel vocab word that fell back to an
 *                     emoji with no illustration and no explicit "not in the
 *                     book" triage. (Vowel-lesson coverage added 2026-07 —
 *                     it was missing before and let real gaps like abeja/
 *                     escoba/iglú/ojo sit untracked in production.)
 *
 * Runs in the build chain (package.json "build" → "validate:art-color") so it
 * gates CI, and its lists/functions are imported by
 * src/content/__tests__/art-color-completeness.test.ts so the test and the
 * build check can never drift.
 *
 * Uses sharp for pixel decoding (webp-capable; the canvas dep is not, in this
 * build).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicRoot = path.join(rootDir, "public");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, rel), "utf8"));
}

/** Recursively gather every `illustrationSrc` string in a data blob. */
export function collectSrcs(obj, into = new Set()) {
  if (!obj || typeof obj !== "object") return into;
  if (Array.isArray(obj)) {
    for (const v of obj) collectSrcs(v, into);
    return into;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === "illustrationSrc" && typeof v === "string") into.add(v);
    else collectSrcs(v, into);
  }
  return into;
}

/**
 * Pull every `/cartilla/art/faithful/....webp` path out of a .ts source file by
 * regex. Used for animal-gallery.ts, which isn't JSON so collectSrcs can't walk
 * it — but its curated crops must be held to the same no-grayscale bar as any
 * other wired art (a future gallery-ONLY image that isn't referenced elsewhere
 * would otherwise escape the color check).
 */
function collectSrcsFromTs(rel, into) {
  const text = fs.readFileSync(path.join(rootDir, rel), "utf8");
  const re = /["'`](\/cartilla\/art\/faithful\/[^"'`]+\.webp)["'`]/g;
  let m;
  while ((m = re.exec(text)) !== null) into.add(m[1]);
  return into;
}

/** Every wired illustrationSrc across the live data files + the animal gallery. */
export function collectWiredSrcs() {
  const set = new Set();
  collectSrcs(readJson("src/content/consonants.json"), set);
  collectSrcs(readJson("src/content/lessons.json"), set);
  collectSrcs(readJson("src/data/page-layouts.json"), set);
  collectSrcsFromTs("src/content/animal-gallery.ts", set);
  return [...set].sort();
}

/**
 * Mean per-pixel channel spread over non-background pixels. Grayscale ⇒ R≈G≈B ⇒
 * ~0. Any real color (including the book's teal duotone pages) scores well
 * above the threshold. Calibrated against every currently-wired crop: the
 * lowest colored crop scores ~10; pure grayscale scores ~0. Threshold 6 sits in
 * that gap.
 */
export const COLOR_MIN_SPREAD = 6;

/**
 * Slugs whose exact student-workbook drawing is intentionally retained in
 * monochrome because the audited source search found no identical teacher
 * flipchart color donor. These remain source-faithful by design; adding a slug
 * here requires explicit repository provenance, never a convenience exception.
 *
 * uña was independently verified as the genuine student-book crop, and the
 * repository source audit records no identical color counterpart. The former
 * hand-colored version is therefore invalid; authentic monochrome is correct.
 */
export const DUOTONE_ALLOWLIST = new Set(["uña"]);

/**
 * Exact student-book drawings that do not have an identical counterpart in the
 * separate 62-page flip chart. This set is derived from the audited manifest,
 * so a filename alone can never bypass the color gate.
 */
export const VERIFIED_WORKBOOK_CROPS = new Set(
  readJson("public/cartilla/art/faithful/manifest.json")
    .filter((entry) => entry.provenanceStatus === "VERIFIED-EXACT-WORKBOOK-CROP-2026-08-08")
    .map((entry) => entry.src),
);

export async function meanColorSpread(rel) {
  const abs = path.join(publicRoot, rel.replace(/^\//, ""));
  const { data, info } = await sharp(abs)
    .resize(140, 140, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) continue; // skip white background
    if (ch === 4 && data[i + 3] < 20) continue; // skip transparent
    sum += Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    n++;
  }
  return n ? sum / n : 0;
}

/** Returns wired grayscale srcs lacking an audited exact-workbook exception. */
export async function findGrayscaleArt() {
  const gray = [];
  await Promise.all(
    collectWiredSrcs().map(async (rel) => {
      const slug =
        rel
          .split("/")
          .pop()
          ?.replace(/\.\w+$/, "") ?? rel;
      if (DUOTONE_ALLOWLIST.has(slug) || VERIFIED_WORKBOOK_CROPS.has(rel)) return;
      const spread = await meanColorSpread(rel);
      if (spread < COLOR_MIN_SPREAD) gray.push({ rel, spread });
    }),
  );
  return gray;
}

/**
 * Consonant AND vowel vocab words that appear (as text) in a lesson but have
 * NO colored illustration anywhere in this book edition — verified by opening
 * every real source page for the lesson, not from prior docs. They correctly
 * fall back to emoji.
 */
export const CONFIRMED_ABSENT = new Set([
  // L7 M (m-page-8 picture panel: mamá/mono/... only)
  "moto",
  "mapa",
  // L8 P
  "pino",
  "pulpo",
  // L9 S
  "sol",
  "silla",
  // L10 T (t-page-17 is a pure word-list page — no picture panel at all)
  "tapa",
  "tomate",
  "tina",
  "tulipán",
  // L11 D
  "delfín",
  "dona",
  "ducha",
  // L12 L (l-page-22 panel: maleta/lata/Luli/loma/Lala)
  "luna",
  "lobo",
  "loro",
  "lupa",
  // L13 N (n-page-25 panel: nido/nudo/mono/Napi/tenedor)
  "nariz",
  "nube",
  "nata",
  // L14 Ñ (ñ-page-28 panel: piñata/Ñuno/niñito/moño/Meñe)
  "piña",
  "muñeca",
  // L15 B (b-page-31 panel: Beba/Bubi/bate/bota/bebita)
  "barco",
  "bici",
  // L16 V (v-page-34 panel: vaso/vela/Vita/pavo/Vuli)
  "vaca",
  "vino",
  "volcán",
  // L21 J — the only crop attempt on disk (leccion-21-j/ajo.webp) is an
  // abstract plant/hair-like burst shape, not garlic; color-QA (2026-07)
  // failed it and pulled it from live use.
  "ajo",
  // Vowel A — checked all 3 real source pages (a-page-4/5/6.jpg). "abeja" is
  // this lesson's mascot ("La Abeja Cantora") but only appears as an
  // uncolored distractor icon on cross-vowel trace-line exercise pages
  // (a-page-5.jpg "Lección 3", i-page-14.jpg "Lección 5") — no colored
  // illustration of her exists in the available scans.
  "abeja",
  // Vowel U — checked all 4 real source pages (u-page-7/16/17/18.jpg).
  // "urna" does not appear anywhere in the available scans at all, not even
  // grayscale.
  "urna",
]);

/**
 * Emoji-only vocab words that are not on CONFIRMED_ABSENT, across BOTH
 * consonant lessons (src/content/consonants.json) AND vowel lessons
 * (src/content/lessons.json). The vowel-lesson half was missing entirely
 * until this pass — that blind spot is exactly how abeja/escoba/iglú/ojo
 * sat emoji-only in production with nothing catching it. Never scan just
 * one file again.
 */
export function findUntriagedGaps() {
  const untriaged = [];
  const consonants = readJson("src/content/consonants.json");
  for (const lesson of consonants) {
    for (const v of lesson.vocab ?? []) {
      if (!v.illustrationSrc && !CONFIRMED_ABSENT.has(v.word)) {
        untriaged.push(`L${lesson.lesson}:${v.word}`);
      }
    }
  }
  const vowels = readJson("src/content/lessons.json");
  for (const lesson of vowels) {
    for (const v of lesson.vocab ?? []) {
      if (!v.illustrationSrc && !CONFIRMED_ABSENT.has(v.word)) {
        untriaged.push(`V:${lesson.vowel}:${v.word}`);
      }
    }
  }
  return untriaged;
}

/** CONFIRMED_ABSENT entries that are actually wired now (stale list entries), across both consonant and vowel lessons. */
export function findStaleAbsent() {
  const wired = new Set();
  const consonants = readJson("src/content/consonants.json");
  for (const lesson of consonants) {
    for (const v of lesson.vocab ?? []) {
      if (v.illustrationSrc) wired.add(v.word);
    }
  }
  const vowels = readJson("src/content/lessons.json");
  for (const lesson of vowels) {
    for (const v of lesson.vocab ?? []) {
      if (v.illustrationSrc) wired.add(v.word);
    }
  }
  return [...CONFIRMED_ABSENT].filter((w) => wired.has(w));
}

// ── Run as a build gate when invoked directly ────────────────────────────────
async function main() {
  const errors = [];

  const gray = await findGrayscaleArt();
  for (const { rel, spread } of gray) {
    errors.push(`GRAYSCALE art wired: ${rel} (spread ${spread.toFixed(1)} < ${COLOR_MIN_SPREAD})`);
  }

  for (const gap of findUntriagedGaps()) {
    errors.push(
      `UNTRIAGED emoji-only vocab: ${gap} — crop the real book art or add to CONFIRMED_ABSENT`,
    );
  }

  for (const stale of findStaleAbsent()) {
    errors.push(`STALE CONFIRMED_ABSENT entry (it is wired now): ${stale}`);
  }

  if (errors.length) {
    console.error("✗ validate-art-color: source/color invariant violated\n");
    for (const e of errors) console.error("  - " + e);
    console.error(`\n${errors.length} problem(s).`);
    process.exit(1);
  }
  console.log(
    `✓ validate-art-color: ${collectWiredSrcs().length} wired crops are colored or exact-workbook verified; ` +
      `${CONFIRMED_ABSENT.size} emoji-only words triaged as genuinely absent.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error("validate-art-color crashed:", e);
    process.exit(1);
  });
}