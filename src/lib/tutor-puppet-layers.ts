/**
 * Tutor puppet layers (GRETEL-TUTOR-BUILD-SPEC §2/§17, blocker B5).
 *
 * Loads and validates `public/cartilla/images/gretel/layers/manifest.json`.
 * Until the owner approves the layer pack (docs/gretel/LAYER-PACK-SPEC.md,
 * Step C: side-by-side + recordings, Yes/No per piece), the manifest is
 * EMPTY and the puppet shows the approved master intact with whole-figure
 * motion only (breathing, settle, listening tilt — GRETEL-MOTION-CONTRACT).
 * When approved layers land later, blink/mouth/head-tilt/hair/skirt/wave/
 * point turn on with NO code change: the puppet renders whatever this
 * loader validates, driving visibility from each layer's role.
 *
 * Safety rules (LAYER-PACK-SPEC "no off-model piece is ever used"):
 * - every layer MUST carry a non-empty owner `approval` reference;
 * - sources MUST be same-origin paths inside the layers directory
 *   (.png/.webp only, no traversal);
 * - any invalid layer is dropped; a missing/corrupt manifest means
 *   master-only mode. Nothing here can ever introduce new artwork on
 *   its own — the manifest is the only gate.
 */

/** Where the puppet's layer manifest lives (served from public/). */
export const PUPPET_LAYERS_MANIFEST_URL = "/cartilla/images/gretel/layers/manifest.json";

/** Layer files must sit in this directory (same-origin, no traversal). */
export const PUPPET_LAYERS_DIR = "/cartilla/images/gretel/layers/";

/**
 * Roles the puppet understands. Pieces cut from the master (Step A) and
 * owner-approved generated pieces (Step B) map onto these:
 * - `static` — always-visible stack pieces (hair-back, torso, head-skin, …)
 * - `blink`  — eyelids (shown only during the machine's blink)
 * - `mouth`  — one entry per Rhubarb shape it covers (`shapes`)
 * - `expression` — the happy expression (shown while cheering)
 * - `arm-wave` / `arm-point` — the wave/point arm pieces
 */
export const PUPPET_LAYER_ROLES = [
  "static",
  "blink",
  "mouth",
  "expression",
  "arm-wave",
  "arm-point",
] as const;

export type PuppetLayerRole = (typeof PUPPET_LAYER_ROLES)[number];

/** Rhubarb extended shapes (§6 lip-sync): A–H plus X (rest). */
export const VISEME_SHAPES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"] as const;
export type VisemeShape = (typeof VISEME_SHAPES)[number];

export interface PuppetLayer {
  /** Unique id, e.g. "mouth-open" or "hair-back". */
  id: string;
  role: PuppetLayerRole;
  /** Same-origin path inside PUPPET_LAYERS_DIR, .png or .webp. */
  src: string;
  /** Mouth layers only: which Rhubarb shapes this piece shows. */
  shapes?: readonly VisemeShape[];
  /** Owner approval reference (LAYER-PACK-SPEC Step C) — required. */
  approval: string;
}

export interface PuppetLayerManifest {
  layers: readonly PuppetLayer[];
}

/** What the puppet should render. */
export type PuppetLayerResolution =
  | { mode: "master" }
  | { mode: "layered"; composition: "overlay" | "complete"; layers: readonly PuppetLayer[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPuppetLayerRole(value: unknown): value is PuppetLayerRole {
  return typeof value === "string" && (PUPPET_LAYER_ROLES as readonly string[]).includes(value);
}

function isVisemeShape(value: unknown): value is VisemeShape {
  return typeof value === "string" && (VISEME_SHAPES as readonly string[]).includes(value);
}

function isAllowedSrc(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith(PUPPET_LAYERS_DIR)) return false;
  if (value.includes("..") || /[%\\?#]/.test(value)) return false;
  return /\.(?:png|webp)$/.test(value);
}

/**
 * Validate the raw manifest. Returns ONLY the valid layers, in manifest
 * order (stack order); duplicates and every invalid entry are dropped.
 * A malformed manifest (not an object / `layers` not an array) yields [].
 */
export function validatePuppetLayers(input: unknown): PuppetLayer[] {
  if (!isRecord(input) || !Array.isArray(input.layers)) return [];

  const seen = new Set<string>();
  const valid: PuppetLayer[] = [];
  for (const raw of input.layers) {
    if (!isRecord(raw)) continue;
    const { id, role, src, shapes, approval } = raw;
    if (typeof id !== "string" || id.trim().length === 0) continue;
    if (seen.has(id)) continue;
    if (!isPuppetLayerRole(role)) continue;
    if (!isAllowedSrc(src)) continue;
    if (typeof approval !== "string" || approval.trim().length === 0) continue;

    let layerShapes: readonly VisemeShape[] | undefined;
    if (role === "mouth") {
      // Mouth pieces map 1:1 to Rhubarb shapes (§6): at least one known shape.
      if (!Array.isArray(shapes) || shapes.length === 0) continue;
      if (!shapes.every(isVisemeShape)) continue;
      layerShapes = shapes as VisemeShape[];
    } else if (shapes !== undefined) {
      continue;
    }

    seen.add(id);
    valid.push(
      layerShapes === undefined
        ? { id, role, src, approval }
        : { id, role, src, shapes: layerShapes, approval },
    );
  }
  return valid;
}

/** Injectable JSON fetcher so tests never touch the network. */
export type PuppetManifestFetcher = (url: string) => Promise<unknown | null>;

async function defaultFetchJson(url: string): Promise<unknown | null> {
  try {
    if (typeof fetch !== "function") return null;
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/**
 * Resolve what the puppet renders today.
 * - fetch failed / manifest missing or malformed / every layer invalid /
 *   empty `layers` → `{ mode: "master" }` (approved master intact).
 * - one or more valid layers → `{ mode: "layered", layers }`.
 */
export async function loadPuppetLayers(
  fetchJson: PuppetManifestFetcher = defaultFetchJson,
): Promise<PuppetLayerResolution> {
  let raw: unknown = null;
  try {
    raw = await fetchJson(PUPPET_LAYERS_MANIFEST_URL);
  } catch {
    // A failed fetch (offline, CORS, mid-deploy) means master mode, never an error.
    raw = null;
  }
  const layers = validatePuppetLayers(raw);
  if (layers.length === 0 || !isRecord(raw)) return { mode: "master" };
  // Activation requires approved registration on the actual source canvas.
  if (
    raw.width !== 1086 ||
    raw.height !== 1448 ||
    typeof raw.compositionApproval !== "string" ||
    !raw.compositionApproval.trim()
  )
    return { mode: "master" };
  if (raw.composition === "overlay") return { mode: "layered", composition: "overlay", layers };
  const bases = [
    "hair-back",
    "legs",
    "skirt",
    "torso",
    "neck",
    "head-skin",
    "eyes-open",
    "brows",
    "hair-front-left",
    "hair-front-right",
    "bow",
  ];
  const complete =
    bases.every((id) => layers.some((layer) => layer.id === id && layer.role === "static")) &&
    layers.some((layer) => layer.role === "mouth" && layer.shapes?.includes("X"));
  if (
    raw.composition !== "complete" ||
    !complete ||
    layers.length !== (raw.layers as unknown[]).length
  )
    return { mode: "master" };
  return { mode: "layered", composition: "complete", layers };
}
