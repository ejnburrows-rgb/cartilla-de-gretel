import type { PageGridCell, PageRegion } from "@/lib/book-faithful";
import faithfulManifest from "../../public/cartilla/art/faithful/manifest.json";
import qaResults from "../../public/cartilla/art/faithful/qa-results.json";

/**
 * Emergent artwork integration layer.
 *
 * Candidate donor PNGs live under /public/cartilla/art/emergent. They are NOT
 * automatically trusted for student display. A candidate becomes active only
 * after the exact drawing and intended palette have been checked against the
 * authentic student workbook plus a verified teacher/source color donor.
 */
const EMERGENT_ART_CANDIDATES_BY_WORD: Readonly<Record<string, string>> = {
  // O
  olla: "/cartilla/art/emergent/o_0.png",
  oto: "/cartilla/art/emergent/o_1.png",
  oveja: "/cartilla/art/emergent/o_2.png",
  oso: "/cartilla/art/emergent/o_3.png",
  oreja: "/cartilla/art/emergent/o_4.png",
  ocho: "/cartilla/art/emergent/o_5.png",

  // A
  abanico: "/cartilla/art/emergent/a_0.png",
  anillo: "/cartilla/art/emergent/a_1.png",
  arana: "/cartilla/art/emergent/a_2.png",
  aro: "/cartilla/art/emergent/a_3.png",
  ana: "/cartilla/art/emergent/a_4.png",

  // E
  elefante: "/cartilla/art/emergent/e_0.png",
  espejo: "/cartilla/art/emergent/e_1.png",
  ema: "/cartilla/art/emergent/e_2.png",
  estrella: "/cartilla/art/emergent/e_3.png",
  erizo: "/cartilla/art/emergent/e_4.png",
  escalera: "/cartilla/art/emergent/e_5.png",

  // I
  iman: "/cartilla/art/emergent/i_0.png",
  iglu: "/cartilla/art/emergent/i_1.png",
  insecto: "/cartilla/art/emergent/i_2.png",
  isla: "/cartilla/art/emergent/i_3.png",
  irma: "/cartilla/art/emergent/i_4.png",

  // U
  uno: "/cartilla/art/emergent/u_0.png",
  uva: "/cartilla/art/emergent/u_1.png",
  uvas: "/cartilla/art/emergent/u_1.png",
  urraca: "/cartilla/art/emergent/u_2.png",
  unicornio: "/cartilla/art/emergent/u_3.png",
  uniforme: "/cartilla/art/emergent/u_4.png",
  ulises: "/cartilla/art/emergent/u_5.png",

  // M
  mama: "/cartilla/art/emergent/m_0.png",
  amo: "/cartilla/art/emergent/m_1.png",
  mima: "/cartilla/art/emergent/m_2.png",
  meme: "/cartilla/art/emergent/m_3.png",
  mumi: "/cartilla/art/emergent/m_4.png",

  // P
  papa: "/cartilla/art/emergent/p_0.png",
  pie: "/cartilla/art/emergent/p_1.png",
  puma: "/cartilla/art/emergent/p_2.png",
  pomo: "/cartilla/art/emergent/p_3.png",

  // S
  sesi: "/cartilla/art/emergent/s_0.png",
  sopa: "/cartilla/art/emergent/s_1.png",
  sapo: "/cartilla/art/emergent/s_2.png",
  pisa: "/cartilla/art/emergent/s_3.png",
  susi: "/cartilla/art/emergent/s_4.png",

  // T
  tomate: "/cartilla/art/emergent/t_0.png",
  tapa: "/cartilla/art/emergent/t_1.png",
  topo: "/cartilla/art/emergent/t_2.png",
  tipi: "/cartilla/art/emergent/t_3.png",
  tuto: "/cartilla/art/emergent/t_4.png",
};

/**
 * Source-backed approval gate. Keep this empty until a candidate has been
 * visually proven against the authentic drawing and an authoritative color
 * reference. This prevents attractive-but-invented color from leaking into the
 * student workbook merely because a filename/word happens to match.
 */
const VERIFIED_EMERGENT_WORDS: ReadonlySet<string> = new Set<string>();

/**
 * Full-resolution artwork QA is the repository's source-comparison record.
 * Every crop already marked FAIL there is unsafe for student display, regardless
 * of which lesson/page mapping happens to reference it. Derive this set directly
 * from the QA file so new FAIL verdicts automatically become runtime blocks.
 */
type ArtQaResult = { file: string; verdict: string };
type ArtQaData = { results: ArtQaResult[] };
const QA_FAILED_FAITHFUL_PATHS: ReadonlySet<string> = new Set(
  ((qaResults as ArtQaData).results ?? [])
    .filter((result) => result.verdict === "FAIL")
    .map((result) => result.file.replace(/^public/, "")),
);

type FaithfulManifestEntry = { src?: string; provenanceStatus?: string | null };
const PROVENANCE_UNKNOWN_FAITHFUL_PATHS: ReadonlySet<string> = new Set(
  (faithfulManifest as FaithfulManifestEntry[])
    .filter((entry) => entry.provenanceStatus === "PROVENANCE-UNKNOWN")
    .map((entry) => entry.src)
    .filter((src): src is string => typeof src === "string" && src.startsWith("/cartilla/art/")),
);

/**
 * Exact same-word faithful replacements for known bad crop paths. Each target
 * is independently marked PASS by the repository's full-resolution source
 * comparison. This restores authentic visible art instead of leaving a blank,
 * while still refusing generated/recolored substitutes.
 *
 * The legacy `traje.webp` file was a recolored derivative. The printed student
 * drawing is the same `uniforme` illustration already located in the authentic
 * teacher flipchart, so every runtime `traje` fallback is redirected to that
 * actual teacher-color crop instead of displaying a recolored copy.
 */
const SOURCE_BACKED_REPLACEMENTS: Readonly<Record<string, string>> = {
  "/cartilla/art/faithful/leccion-1/ola.webp": "/cartilla/art/faithful/vocal-o/ola.webp",
  "/cartilla/art/faithful/vocal-o/ojos.webp": "/cartilla/art/faithful/leccion-1/ojos.webp",
  "/cartilla/art/faithful/leccion-2/ojos.webp": "/cartilla/art/faithful/leccion-1/ojos.webp",
  "/cartilla/art/faithful/leccion-3/ojos.webp": "/cartilla/art/faithful/leccion-1/ojos.webp",
  "/cartilla/art/faithful/leccion-1/traje.webp": "/cartilla/art/faithful/vocal-u/uniforme.webp",
  "/cartilla/art/faithful/leccion-3/ardilla.webp": "/cartilla/art/faithful/vocal-a/ardilla.webp",
  "/cartilla/art/faithful/leccion-4/erizo.webp": "/cartilla/art/faithful/vocal-e/erizo.webp",
  "/cartilla/art/faithful/leccion-5/igual.webp": "/cartilla/art/faithful/vocal-i/igual.webp",
  "/cartilla/art/faithful/leccion-5/iguana.webp": "/cartilla/art/faithful/vocal-i/iguana.webp",
  "/cartilla/art/faithful/leccion-8-p/pez.webp": "/cartilla/art/faithful/leccion-1/pez.webp",
  "/cartilla/art/faithful/leccion-18-c/carro.webp": "/cartilla/art/faithful/leccion-1/carro.webp",
  "/cartilla/art/faithful/leccion-18-rr/carro.webp": "/cartilla/art/faithful/leccion-1/carro.webp",
};

/**
 * Canonical mappings known to be mismatched, explicitly marked
 * PROVENANCE-UNKNOWN, recovered without source proof, or otherwise not yet
 * positively source-proven. Never let them reach the student workbook until
 * the exact drawing and source palette have been verified.
 *
 * Faithful crops with a PASS verdict in the repository's full-resolution
 * source-comparison QA are allowed even if legacy manifest crop metadata is
 * incomplete or malformed, but an explicit PROVENANCE-UNKNOWN manifest verdict
 * now overrides that legacy PASS and blocks the asset until source proof exists.
 * A known-bad alternate path remains blocked even when a different crop for the
 * same word has passed source comparison.
 *
 * iglesia and ojos were independently verified at full resolution in repository
 * history; traje/uniforme uses the identical teacher flipchart uniforme donor;
 * uña intentionally uses the authentic grayscale-only student source. Those
 * source-backed paths therefore must remain visible rather than being suppressed.
 */
const BLOCKED_CANONICAL_FALLBACKS: Readonly<Record<string, ReadonlySet<string>>> = {
  ola: new Set(["/cartilla/art/faithful/leccion-1/ola.webp"]),
  carro: new Set(["/cartilla/art/faithful/leccion-18-rr/carro.webp"]),
};

/**
 * Exact word/path mismatches that must never render as if they were authentic.
 * Keep accents here: `moño` and `mono` intentionally normalize to the same
 * search key elsewhere, but they depict different things. The Ñ exercise was
 * pointing `moño` at the verified `mono` (monkey) crop; until an exact source
 * `moño` drawing is proven, the honest student rendering is an art-pending slot.
 */
const BLOCKED_EXACT_WORD_PATH_PAIRS: ReadonlySet<string> = new Set([
  "moño|/cartilla/art/faithful/leccion-7-m/mono.webp",
]);

/**
 * Source-transcribed vowel pages had several stale answer flags that contradicted
 * their own printed instruction and pictured word. Keep the correction here at
 * the final runtime gate so students cannot be mis-graded while the canonical
 * layout file retains the original source transcription for audit comparison.
 * No drawing, crop, color, caption, or page order is changed by this map.
 */
const VERIFIED_CELL_CORRECTNESS_BY_REGION: Readonly<Record<string, Readonly<Record<string, boolean>>>> = {
  "p4-grid": {
    ola: true,
    "iglú": false,
    oso: true,
    "maíz": false,
    arco: false,
    oveja: true,
    alas: false,
    oreja: true,
    olla: true,
    uvas: false,
    ocho: true,
    uno: false,
    "araña": false,
    traje: false,
    ojos: true,
  },
  "p8-match": {
    oso: false,
    "iglú": false,
    alas: true,
    abeja: true,
    aguja: true,
    "maíz": false,
    pez: false,
    aro: true,
  },
  "p10-grid": {
    elefante: true,
    "iglú": false,
    "maíz": false,
    indio: false,
    escalera: true,
    erizo: true,
    abeja: false,
    aguja: false,
    escoba: true,
    unicornio: false,
    estrella: true,
    "águila": false,
    escuela: true,
    traje: false,
    espejo: true,
    uno: false,
  },
  "p16-grid": {
    unicornio: true,
    oveja: false,
    pez: false,
    arco: false,
    uvas: true,
    estrella: false,
    traje: false,
    elefante: false,
    "árbol": false,
    uno: true,
    oso: false,
    "águila": false,
    abeja: false,
    insecto: false,
  },
};

/**
 * The M syllable page also carried one stale grading flag: `miel` was marked as
 * a `me` answer. Keep this at the same final runtime gate as the vowel fixes so
 * the source-transcribed page cannot mis-grade the student while artwork and
 * printed order remain unchanged.
 */
const VERIFIED_SYLLABLE_CORRECTNESS_BY_REGION: Readonly<
  Record<string, Readonly<Record<string, boolean>>>
> = {
  "p20-me": {
    miel: false,
  },
};

/**
 * Entire asset families that are never acceptable as an automatic student
 * fallback. These are generated/remastered lanes, not authenticated source art.
 * Keeping this check centralized prevents a later page mapping from bypassing
 * the source rules simply by pointing at one of these folders.
 */
const BLOCKED_STUDENT_ART_PREFIXES = [
  "/cartilla/art/emergent/",
  "/cartilla/art/hd/workbook/",
  "/cartilla/art/color/workbook/",
  "/cartilla/art/remastered/",
] as const;

function normalizeWord(value?: string | null): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function exactWordPathKey(word?: string | null, path?: string): string {
  return `${(word ?? "").trim().toLocaleLowerCase("es")}|${path ?? ""}`;
}

function isBlockedStudentArtPath(path: string): boolean {
  return (
    BLOCKED_STUDENT_ART_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    QA_FAILED_FAITHFUL_PATHS.has(path) ||
    PROVENANCE_UNKNOWN_FAITHFUL_PATHS.has(path)
  );
}

function getSafeFallback(word?: string | null, fallback?: string): string | undefined {
  if (!fallback) return undefined;
  if (BLOCKED_EXACT_WORD_PATH_PAIRS.has(exactWordPathKey(word, fallback))) return undefined;
  const replacement = SOURCE_BACKED_REPLACEMENTS[fallback];
  if (replacement && !isBlockedStudentArtPath(replacement)) return replacement;
  if (isBlockedStudentArtPath(fallback)) return undefined;
  const key = normalizeWord(word);
  if (BLOCKED_CANONICAL_FALLBACKS[key]?.has(fallback)) return undefined;
  return fallback;
}

export function getEmergentArtPath(word?: string | null): string | undefined {
  const key = normalizeWord(word);
  if (!key || !VERIFIED_EMERGENT_WORDS.has(key)) return undefined;
  return EMERGENT_ART_CANDIDATES_BY_WORD[key];
}

export function resolveEmergentArt(
  word?: string | null,
  fallback?: string,
): string | undefined {
  return getEmergentArtPath(word) ?? getSafeFallback(word, fallback);
}

function resolveCell(cell: PageGridCell, correctness?: Readonly<Record<string, boolean>>): PageGridCell {
  const sourceCorrect = cell.caption ? correctness?.[cell.caption] : undefined;
  return {
    ...cell,
    ...(sourceCorrect === undefined ? {} : { correct: sourceCorrect }),
    illustrationSrc: resolveEmergentArt(cell.caption, cell.illustrationSrc),
  };
}

function resolveRegion(region: PageRegion): PageRegion {
  const verifiedCorrectness = VERIFIED_CELL_CORRECTNESS_BY_REGION[region.id];
  const verifiedSyllableCorrectness = VERIFIED_SYLLABLE_CORRECTNESS_BY_REGION[region.id];
  return {
    ...region,
    illustrationSrc: resolveEmergentArt(
      region.caption ?? region.illustrationWord,
      region.illustrationSrc,
    ),
    cells: region.cells?.map((cell) => resolveCell(cell, verifiedCorrectness)),
    matchRows: region.matchRows?.map((row) =>
      row.map((entry) => ({
        ...entry,
        ...(verifiedSyllableCorrectness?.[entry.word] === undefined
          ? {}
          : { correct: verifiedSyllableCorrectness[entry.word] }),
        illustrationSrc: resolveEmergentArt(entry.word, entry.illustrationSrc),
      })),
    ),
    fillItems: region.fillItems?.map((item) => ({
      ...item,
      illustrationSrc: resolveEmergentArt(item.wordBox, item.illustrationSrc),
    })),
    vowelRows: region.vowelRows?.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => resolveCell(cell)),
    })),
    vowelPairs: region.vowelPairs?.map((pair) => ({
      ...pair,
      illustrationSrc: resolveEmergentArt(pair.caption, pair.illustrationSrc),
    })),
  };
}

/**
 * Apply only source-verified donor color without mutating canonical page-layout
 * data. Until a candidate is verified, canonical authentic artwork wins.
 */
export function applyEmergentArtToRegions(regions: PageRegion[]): PageRegion[] {
  return regions.map(resolveRegion);
}
