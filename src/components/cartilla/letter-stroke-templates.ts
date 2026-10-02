// letter-stroke-templates.ts
// Workbook handwriting templates are derived from the printed Workbook source
// listed in the completed handwriting audit below, not generic letter shapes.
// LETTER_TEMPLATES is also used directly by the games' DragLetterTrace; the
// Workbook uses the source-scoped getLetterTemplate lookup. Legacy game-only
// H/K/Z paths remain in the shared data but are not verified Workbook models.
// Each template is an ordered list of strokes; each stroke is an ordered list
// of checkpoint Points inside a 100 (w) x 120 (h) viewport. The order encodes
// writing direction; grading follows the checkpoints near the stroke path.
// These handwriting paths are not replacement illustrations.
//
// Printed Workbook source table (public/cartilla/art/source/workbook/page-NNN.jpg).
// Counts below describe PRINTED strokes, not inferred or newly created paths.
// "Deferred" means source readable but no source-specific implementation yet.
// U is retained only as far as its single unnumbered down arrow verifies it;
// the book does not specify the rest of U/u's stroke plan. Do not extend it.
// A's stroke-2 arrow is medium-high confidence; lowercase e/g/y need higher-
// resolution confirmation before implementation. No lowercase paths are added.
//
// Letter | Printed page | Strokes | Direction / order | Verification status
// O      | 6  | 1 | upper-right start, counterclockwise loop | verified; corrected
// o      | 6  | 1 | upper-right start, counterclockwise loop | verified; deferred (no lowercase path)
// A      | 9  | 3 | apex to lower-left; lower-right to apex; bar left to right | verified; corrected
// a      | 9  | 2 | bowl counterclockwise; right stem down | verified; deferred
// E      | 12 | 4 | down; top, middle, bottom bars left to right | verified; unchanged
// e      | 12 | 2 | bar left to right; curve counterclockwise | readable; deferred (start needs confirmation)
// I      | 15 | 3 | down; top then bottom bar left to right | verified; unchanged
// i      | 15 | 2 | down; dot | verified; deferred
// U      | 18 | 1 unnumbered arrow | left side down; rest unspecified | partially verified; unchanged
// u      | 18 | unspecified | left side down; right stem plan absent | incomplete source; freehand
// M      | 19 | 4 | left down; diagonal down-right; diagonal up-right; right down | verified; corrected
// m      | 19 | 3 | down; arch; arch | verified; deferred
// P      | 23 | 2 | down; clockwise bowl from top | verified; unchanged
// p      | 23 | 2 | stem down below baseline; clockwise bowl | verified; deferred
// S      | 27 | 1 | upper-right start, counterclockwise over top | verified; unchanged
// s      | 27 | 1 | same source-verified path as S | verified; unchanged
// T      | 31 | 2 | vertical down; crossbar left to right | verified; corrected
// t      | 31 | 2 | down; crossbar left to right | verified; deferred
// D      | 35 | 2 | down; clockwise bowl from top to bottom | verified; unchanged
// d      | 35 | 2 | bowl counterclockwise; tall stem down | verified; deferred
// L      | 39 | 2 | down; bottom bar left to right | verified; unchanged
// l      | 39 | 1 | down | verified; deferred
// N      | 43 | 3 | left down; diagonal down-right; right UP | verified; corrected (stroke 1 only)
// n      | 43 | 2 | down; arch | verified; deferred
// Ñ      | 47 | 4 | N's order; tilde left to right | verified; deferred
// ñ      | 47 | 3 | down; arch; tilde left to right | verified; deferred
// B      | 51 | 3 | down; top clockwise bowl; bottom clockwise bowl | verified; unchanged
// b      | 51 | 2 | tall stem down; clockwise bowl at midline | verified; deferred
// V      | 55 | 2 | down to point; separate stroke up-right | verified; corrected
// v      | 55 | 2 | down to point; separate stroke up-right | verified; deferred (no lowercase path)
// R      | 59 | 3 | down; clockwise bowl; leg down-right | verified; unchanged
// r      | 59 | 2 | down; arch right | verified; deferred
// rr     | 63 | 2 per r | down then arch for each r; numbering restarts | verified; deferred (no capital RR in source)
// G      | 67 | 2 | counterclockwise curve; crossbar right to left | verified; corrected to audited coordinates
// g      | 67 | 2 | bowl counterclockwise; right stem down into tail | readable; deferred (tail needs confirmation)
// F      | 71 | 3 | down; top then middle bar left to right | verified; unchanged
// f      | 71 | 2 | hook from top-right, left then down; crossbar left to right | verified; deferred
// J      | 75 | 1 | stem down, hook left; NO top bar | verified; corrected
// j      | 75 | 2 | down into left-hooked tail; dot | readable; deferred (tail needs confirmation)
// C      | 79 | 1 | upper-right start, counterclockwise | verified; unchanged
// c      | 79 | 1 | same source-verified path as C | verified; unchanged
// Y      | 83 | 3 | left arm to junction; right arm to junction; stem down | verified; corrected
// y      | 83 | 2 | short left arm down; long right arm down-left into tail | readable; deferred (tail needs confirmation)
// Z      | 87 | unknown | unknown (printed page missing) | unverified; Workbook freehand, game path retained
// z      | 87 | unknown | unknown (printed page missing) | unverified; freehand

export type Point = { x: number; y: number };

export const LETTER_TEMPLATES: Record<string, Point[][]> = {
  A: [
    [
      { x: 50, y: 20 },
      { x: 35, y: 60 },
      { x: 20, y: 100 },
    ],
    [
      { x: 80, y: 100 },
      { x: 65, y: 60 },
      { x: 50, y: 20 },
    ],
    [
      { x: 30, y: 65 },
      { x: 50, y: 65 },
      { x: 70, y: 65 },
    ],
  ],
  E: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 70, y: 20 },
    ],
    [
      { x: 30, y: 60 },
      { x: 50, y: 60 },
      { x: 65, y: 60 },
    ],
    [
      { x: 30, y: 100 },
      { x: 55, y: 100 },
      { x: 70, y: 100 },
    ],
  ],
  I: [
    [
      { x: 50, y: 20 },
      { x: 50, y: 60 },
      { x: 50, y: 100 },
    ],
    [
      { x: 35, y: 20 },
      { x: 50, y: 20 },
      { x: 65, y: 20 },
    ],
    [
      { x: 35, y: 100 },
      { x: 50, y: 100 },
      { x: 65, y: 100 },
    ],
  ],
  O: [
    [
      { x: 72, y: 27 },
      { x: 50, y: 20 },
      { x: 25, y: 25 },
      { x: 20, y: 60 },
      { x: 25, y: 95 },
      { x: 50, y: 100 },
      { x: 75, y: 95 },
      { x: 80, y: 60 },
      { x: 72, y: 27 },
    ],
  ],
  U: [
    [
      { x: 25, y: 20 },
      { x: 25, y: 70 },
      { x: 32, y: 95 },
      { x: 50, y: 100 },
      { x: 68, y: 95 },
      { x: 75, y: 70 },
      { x: 75, y: 20 },
    ],
  ],
  M: [
    [
      { x: 20, y: 20 },
      { x: 20, y: 60 },
      { x: 20, y: 100 },
    ],
    [
      { x: 20, y: 20 },
      { x: 35, y: 60 },
      { x: 50, y: 100 },
    ],
    [
      { x: 50, y: 100 },
      { x: 65, y: 60 },
      { x: 80, y: 20 },
    ],
    [
      { x: 80, y: 20 },
      { x: 80, y: 60 },
      { x: 80, y: 100 },
    ],
  ],
  P: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 65, y: 35 },
      { x: 55, y: 50 },
      { x: 30, y: 50 },
    ],
  ],
  S: [
    [
      { x: 70, y: 30 },
      { x: 50, y: 20 },
      { x: 30, y: 30 },
      { x: 30, y: 48 },
      { x: 50, y: 60 },
      { x: 70, y: 72 },
      { x: 70, y: 90 },
      { x: 50, y: 100 },
      { x: 30, y: 90 },
    ],
  ],
  L: [
    [
      { x: 35, y: 20 },
      { x: 35, y: 60 },
      { x: 35, y: 100 },
    ],
    [
      { x: 35, y: 100 },
      { x: 55, y: 100 },
      { x: 70, y: 100 },
    ],
  ],
  T: [
    [
      { x: 50, y: 20 },
      { x: 50, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 70, y: 20 },
    ],
  ],
  N: [
    [
      { x: 25, y: 20 },
      { x: 25, y: 60 },
      { x: 25, y: 100 },
    ],
    [
      { x: 25, y: 20 },
      { x: 50, y: 60 },
      { x: 75, y: 100 },
    ],
    [
      { x: 75, y: 100 },
      { x: 75, y: 60 },
      { x: 75, y: 20 },
    ],
  ],
  D: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 70, y: 40 },
      { x: 70, y: 80 },
      { x: 55, y: 100 },
      { x: 30, y: 100 },
    ],
  ],
  R: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 65, y: 35 },
      { x: 55, y: 50 },
      { x: 30, y: 50 },
    ],
    [
      { x: 30, y: 50 },
      { x: 50, y: 75 },
      { x: 70, y: 100 },
    ],
  ],
  C: [
    [
      { x: 70, y: 30 },
      { x: 50, y: 20 },
      { x: 32, y: 40 },
      { x: 32, y: 80 },
      { x: 50, y: 100 },
      { x: 70, y: 90 },
    ],
  ],
  B: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 60, y: 35 },
      { x: 50, y: 50 },
      { x: 30, y: 50 },
    ],
    [
      { x: 30, y: 50 },
      { x: 55, y: 50 },
      { x: 65, y: 70 },
      { x: 55, y: 100 },
      { x: 30, y: 100 },
    ],
  ],
  F: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 30, y: 20 },
      { x: 55, y: 20 },
      { x: 70, y: 20 },
    ],
    [
      { x: 30, y: 55 },
      { x: 50, y: 55 },
      { x: 65, y: 55 },
    ],
  ],
  G: [
    [
      { x: 70, y: 30 },
      { x: 50, y: 20 },
      { x: 30, y: 40 },
      { x: 30, y: 80 },
      { x: 50, y: 100 },
      { x: 70, y: 95 },
      { x: 72, y: 62 },
    ],
    [
      { x: 72, y: 62 },
      { x: 50, y: 62 },
    ],
  ],
  H: [
    [
      { x: 25, y: 20 },
      { x: 25, y: 60 },
      { x: 25, y: 100 },
    ],
    [
      { x: 75, y: 20 },
      { x: 75, y: 60 },
      { x: 75, y: 100 },
    ],
    [
      { x: 25, y: 60 },
      { x: 50, y: 60 },
      { x: 75, y: 60 },
    ],
  ],
  J: [
    [
      { x: 65, y: 20 },
      { x: 65, y: 60 },
      { x: 65, y: 82 },
      { x: 55, y: 98 },
      { x: 40, y: 98 },
      { x: 30, y: 85 },
      { x: 30, y: 77 },
    ],
  ],
  K: [
    [
      { x: 30, y: 20 },
      { x: 30, y: 60 },
      { x: 30, y: 100 },
    ],
    [
      { x: 65, y: 20 },
      { x: 45, y: 50 },
      { x: 30, y: 60 },
    ],
    [
      { x: 30, y: 60 },
      { x: 45, y: 70 },
      { x: 70, y: 100 },
    ],
  ],
  // Workbook paths verified against the printed source table above:
  V: [
    [
      { x: 20, y: 20 },
      { x: 35, y: 60 },
      { x: 50, y: 100 },
    ],
    [
      { x: 50, y: 100 },
      { x: 65, y: 60 },
      { x: 80, y: 20 },
    ],
  ],
  Y: [
    [
      { x: 20, y: 20 },
      { x: 35, y: 40 },
      { x: 50, y: 60 },
    ],
    [
      { x: 80, y: 20 },
      { x: 65, y: 40 },
      { x: 50, y: 60 },
    ],
    [
      { x: 50, y: 60 },
      { x: 50, y: 80 },
      { x: 50, y: 100 },
    ],
  ],
  // Legacy game path only: Workbook page 87 is missing and unverified.
  Z: [
    [
      { x: 25, y: 20 },
      { x: 50, y: 20 },
      { x: 75, y: 20 },
      { x: 50, y: 60 },
      { x: 25, y: 100 },
      { x: 50, y: 100 },
      { x: 75, y: 100 },
    ],
  ],
};

/**
 * Only these printed Workbook models have an approved guided implementation.
 * Lowercase s/c are the only audited capital-path matches retained here.
 * o/v have no source-specific lowercase path; u is incomplete; Z/z lack p87.
 * All other lowercase letters and Ñ/ñ/rr remain freehand. The source prints
 * only lowercase rr, so this lookup must not synthesize a capital RR path.
 * Games still access LETTER_TEMPLATES directly, retaining their H/K/Z data.
 */
const WORKBOOK_GUIDED_MODELS = new Set([
  "O",
  "A",
  "E",
  "I",
  "U",
  "M",
  "P",
  "S",
  "T",
  "D",
  "L",
  "N",
  "B",
  "V",
  "R",
  "G",
  "F",
  "J",
  "C",
  "Y",
  "s",
  "c",
]);

/** Workbook-only lookup: null means use the existing freehand writing area. */
export function getLetterTemplate(modelText: string | undefined | null): Point[][] | null {
  if (!modelText) return null;
  const trimmed = modelText.trim();
  if (!WORKBOOK_GUIDED_MODELS.has(trimmed)) return null;
  return LETTER_TEMPLATES[trimmed.toUpperCase()] ?? null;
}

/* ── Tap-mode shared logic ───────────────────────────────────────────────
 * A mouse cannot comfortably hold a button down and follow a curve — that is
 * a pen gesture, not a mouse gesture. So on a mouse-primary device the SAME
 * letter and the SAME stroke templates are graded by tapping the checkpoints
 * in order instead of dragging through them. Everything below is pure
 * (no React), and is shared by BOTH WorkbookLetterTrace and DragLetterTrace so
 * the two can never drift apart — the same rule that already governs the
 * templates themselves.
 */

/** One checkpoint located within the whole template, in writing order. */
export type CheckpointRef = {
  strokeIdx: number;
  pointIdx: number;
  point: Point;
  /** 1-based position across the entire letter, for the child-facing number. */
  order: number;
};

/** Every checkpoint of a template, flattened into strict writing order. */
export function flattenCheckpoints(strokes: Point[][]): CheckpointRef[] {
  const out: CheckpointRef[] = [];
  strokes.forEach((stroke, strokeIdx) => {
    stroke.forEach((point, pointIdx) => {
      out.push({ strokeIdx, pointIdx, point, order: out.length + 1 });
    });
  });
  return out;
}

/** Position within a tap-mode trace. */
export type TapPosition = { strokeIdx: number; pointIdx: number };

/** True when (strokeIdx, pointIdx) is exactly the checkpoint due next. */
export function isActiveCheckpoint(pos: TapPosition, strokeIdx: number, pointIdx: number): boolean {
  return pos.strokeIdx === strokeIdx && pos.pointIdx === pointIdx;
}

/** True when this checkpoint was already tapped (earlier in writing order). */
export function isCheckpointDone(pos: TapPosition, strokeIdx: number, pointIdx: number): boolean {
  return strokeIdx < pos.strokeIdx || (strokeIdx === pos.strokeIdx && pointIdx < pos.pointIdx);
}

export type TapAdvance =
  /** Correct tap, more checkpoints remain in this stroke. */
  | { kind: "point"; next: TapPosition }
  /** Correct tap, that stroke is now finished and another follows. */
  | { kind: "stroke"; next: TapPosition }
  /** Correct tap on the final checkpoint of the final stroke. */
  | { kind: "complete" }
  /** Not the checkpoint that was due. */
  | { kind: "wrong" };

/**
 * Pure state transition for a tap. Returns what the tap did so the caller can
 * update its own drawing and fire its own completion events — the two
 * components keep their existing, different event payloads, but share this
 * ordering logic exactly.
 */
export function advanceTap(
  strokes: Point[][],
  pos: TapPosition,
  tapped: { strokeIdx: number; pointIdx: number },
): TapAdvance {
  if (!isActiveCheckpoint(pos, tapped.strokeIdx, tapped.pointIdx)) return { kind: "wrong" };

  const stroke = strokes[pos.strokeIdx];
  if (!stroke) return { kind: "wrong" };

  const nextPointIdx = pos.pointIdx + 1;
  if (nextPointIdx < stroke.length) {
    return { kind: "point", next: { strokeIdx: pos.strokeIdx, pointIdx: nextPointIdx } };
  }

  const nextStrokeIdx = pos.strokeIdx + 1;
  if (nextStrokeIdx < strokes.length) {
    return { kind: "stroke", next: { strokeIdx: nextStrokeIdx, pointIdx: 0 } };
  }
  return { kind: "complete" };
}

/** Distance from point p to the segment ab (all in viewport units). */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * abx;
  const cy = a.y + t * aby;
  return Math.hypot(p.x - cx, p.y - cy);
}

/** Smallest distance from point p to a stroke polyline (its consecutive segments). */
export function distanceToStroke(p: Point, stroke: Point[]): number {
  if (stroke.length === 0) return Infinity;
  if (stroke.length === 1) return Math.hypot(p.x - stroke[0].x, p.y - stroke[0].y);
  let min = Infinity;
  for (let i = 0; i < stroke.length - 1; i++) {
    const d = distanceToSegment(p, stroke[i], stroke[i + 1]);
    if (d < min) min = d;
  }
  return min;
}
