/**
 * Data-driven "living workbook page" schema.
 *
 * This is a NEW, general-purpose page/object/interaction schema — separate
 * from src/lib/book-faithful.ts's PageRegion system (which stays as-is and
 * keeps driving the 24 shipped lessons). It's designed to match the shape of
 * an external content manifest (physicalPage + objects[] + percent boxes +
 * interaction + audio + motion), so a future workbook-manifest.json can be
 * loaded directly into these types without a translation layer.
 *
 * Nothing here bulk-fills real book pages. This schema only becomes "live"
 * content once real, verified records exist — until then it's proven against
 * clearly-labeled sample data only (see the dev sandbox route).
 */

/** Position/size of an object within its page canvas, all as percentages
 * (0-100) of the page's own width/height — resolution-independent, so the
 * same record renders correctly at any viewport size. */
export interface PercentBox {
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
}

/** Ambient motion treatment for a living (non-interactive) object.
 * "none" is the correct choice for inanimate objects per the project's
 * animation rules — only real characters/creatures should breathe/blink. */
export type MotionKind = "none" | "float" | "bob" | "breathe" | "blink";

export interface ObjectMotion {
  kind: MotionKind;
  /** Per-object stagger so a grid of objects never animates in lockstep. */
  delayMs?: number;
  durationMs?: number;
}

/** A real audio cue. `src: ""` is the established safe no-op convention
 * (see PR #103's wordAudio.ts) — the object is still fully usable without
 * recorded audio; playback is simply skipped until a real file lands. */
export interface AudioCue {
  src: string;
  label?: string;
}

export type InteractionKind =
  | "tap-select"
  | "tap-to-hear"
  | "drag-place"
  | "pair-match"
  | "mark-circle"
  | "none";

/**
 * Interaction config attached to an object. `data` is intentionally an
 * opaque, interaction-specific bag (role, pairId, targetId, correct, etc.)
 * rather than one giant discriminated union — each interaction component in
 * src/cartilla/interactions/* owns and validates the shape it actually needs
 * out of `data`, so adding a 6th interaction kind never has to touch this
 * shared type.
 */
export interface ObjectInteraction {
  kind: InteractionKind;
  data?: Record<string, unknown>;
}

export interface WorkbookObject {
  id: string;
  /** Real image path (derived art or a plain shape/photo) — omit for a
   * text-only or audio-only object. Never an invented drawing. */
  src?: string;
  box: PercentBox;
  /** Paint order; higher paints on top of lower. */
  zIndex?: number;
  /** Real, live web text (never baked into a background image). */
  text?: string;
  /** Accessible name, independent of visible `text` (e.g. for an image-only object). */
  alt?: string;
  motion?: ObjectMotion;
  audio?: AudioCue;
  interaction?: ObjectInteraction;
}

export type PhysicalPageStatus = "sample" | "draft" | "verified";

/**
 * One page's worth of content. A page carries at most one *page-level*
 * interaction (`interaction`) — matching how the real printed book works,
 * one exercise per page — which owns and lays out whichever of its
 * `objects` are tagged for that interaction. Objects with no interaction
 * tag are plain decorative/text content, rendered directly.
 */
export interface PhysicalPage {
  id: string;
  /** Real printed page number, or null for a non-page (sandbox/dev) record. */
  pageNumber: number | null;
  lessonNumber: number | null;
  /** Background image for the page canvas, or null → renders an honest
   * "background pending" placeholder, never invented art. */
  backgroundSrc: string | null;
  /** Verbatim printed instruction text, when known — real live text,
   * rendered as a banner above the canvas. Empty/absent is honest (not yet
   * transcribed), never filled with an invented sentence. */
  instruction?: string;
  interaction?: ObjectInteraction;
  objects: WorkbookObject[];
  status: PhysicalPageStatus;
  /** Free-text provenance note (e.g. source scan filename) — never omitted
   * for real content, always traceable back to a real source. */
  source?: string;
}

export interface WorkbookManifest {
  version: string;
  pages: PhysicalPage[];
}
