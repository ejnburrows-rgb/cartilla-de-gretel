import type { PageGridCell, PageRegion } from "@/lib/book-faithful";

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
 * Canonical mappings known to be mismatched, explicitly marked
 * PROVENANCE-UNKNOWN, recovered without source proof, absent from the current
 * provenance manifest, or otherwise not yet positively source-proven. Never
 * let them reach the student workbook until the exact drawing and source palette
 * have been verified. Assets with named source pages plus a PASS verdict from
 * the repository's full-resolution source-comparison QA are allowed even when
 * old manifest crop metadata is malformed; those bad metadata numbers alone do
 * not override the actual source comparison.
 */
const BLOCKED_CANONICAL_FALLBACKS: Readonly<Record<string, ReadonlySet<string>>> = {
  traje: new Set([
    "/cartilla/art/faithful/vocal-u/uniforme.webp",
    "/cartilla/art/faithful/leccion-1/traje.webp",
  ]),
  iglesia: new Set(["/cartilla/art/faithful/vocal-i/iglesia.webp"]),
  ola: new Set([
    "/cartilla/art/faithful/leccion-1/ola.webp",
    "/cartilla/art/faithful/vocal-o/ola.webp",
  ]),
  ardilla: new Set(["/cartilla/art/faithful/vocal-a/ardilla.webp"]),
  escuela: new Set(["/cartilla/art/faithful/vocal-e/escuela.webp"]),
  igual: new Set(["/cartilla/art/faithful/vocal-i/igual.webp"]),
  iguana: new Set(["/cartilla/art/faithful/vocal-i/iguana.webp"]),
  invierno: new Set(["/cartilla/art/faithful/vocal-i/invierno.webp"]),
  anillo: new Set(["/cartilla/art/faithful/vocal-a/anillo.webp"]),
  manzana: new Set(["/cartilla/art/faithful/leccion-1/manzana.webp"]),
  libro: new Set(["/cartilla/art/faithful/leccion-1/libro.webp"]),
  pera: new Set(["/cartilla/art/faithful/leccion-1/pera.webp"]),
  taza: new Set(["/cartilla/art/faithful/leccion-1/taza.webp"]),
  dulce: new Set(["/cartilla/art/faithful/leccion-1/dulce.webp"]),
  uniforme: new Set(["/cartilla/art/faithful/vocal-u/uniforme.webp"]),
  una: new Set(["/cartilla/art/faithful/vocal-u/uña.webp"]),
  ojos: new Set(["/cartilla/art/faithful/leccion-1/ojos.webp"]),
  casa: new Set(["/cartilla/art/faithful/leccion-19-c/casa.webp"]),
  carro: new Set(["/cartilla/art/faithful/leccion-18-rr/carro.webp"]),
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

function isBlockedStudentArtPath(path: string): boolean {
  return BLOCKED_STUDENT_ART_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getSafeFallback(word?: string | null, fallback?: string): string | undefined {
  if (!fallback) return undefined;
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

function resolveCell(cell: PageGridCell): PageGridCell {
  return {
    ...cell,
    illustrationSrc: resolveEmergentArt(cell.caption, cell.illustrationSrc),
  };
}

function resolveRegion(region: PageRegion): PageRegion {
  return {
    ...region,
    illustrationSrc: resolveEmergentArt(
      region.caption ?? region.illustrationWord,
      region.illustrationSrc,
    ),
    cells: region.cells?.map(resolveCell),
    matchRows: region.matchRows?.map((row) =>
      row.map((entry) => ({
        ...entry,
        illustrationSrc: resolveEmergentArt(entry.word, entry.illustrationSrc),
      })),
    ),
    fillItems: region.fillItems?.map((item) => ({
      ...item,
      illustrationSrc: resolveEmergentArt(item.wordBox, item.illustrationSrc),
    })),
    vowelRows: region.vowelRows?.map((row) => ({
      ...row,
      cells: row.cells.map(resolveCell),
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
