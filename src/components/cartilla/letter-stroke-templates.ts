// letter-stroke-templates.ts
// Shared letter stroke-path templates + small geometry helpers, used by both
// the games' DragLetterTrace and the workbook WorkbookLetterTrace so the two
// never drift apart. Each template is an ordered list of strokes; each stroke
// is an ordered list of checkpoint Points inside a 100 (w) x 120 (h) viewport.
// The order encodes the correct writing direction; a trace is graded by
// following the checkpoints in order while staying near the stroke path.
//
// ART/CONTENT NOTE: these are letterform *paths* for handwriting practice, not
// illustrations — they don't fall under the "never redraw the art" rule. They
// are standard uppercase letter shapes.

export type Point = { x: number; y: number };

export const LETTER_TEMPLATES: Record<string, Point[][]> = {
  A: [
    [{ x: 50, y: 20 }, { x: 35, y: 60 }, { x: 20, y: 100 }],
    [{ x: 50, y: 20 }, { x: 65, y: 60 }, { x: 80, y: 100 }],
    [{ x: 30, y: 65 }, { x: 50, y: 65 }, { x: 70, y: 65 }],
  ],
  E: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 70, y: 20 }],
    [{ x: 30, y: 60 }, { x: 50, y: 60 }, { x: 65, y: 60 }],
    [{ x: 30, y: 100 }, { x: 55, y: 100 }, { x: 70, y: 100 }],
  ],
  I: [
    [{ x: 50, y: 20 }, { x: 50, y: 60 }, { x: 50, y: 100 }],
    [{ x: 35, y: 20 }, { x: 50, y: 20 }, { x: 65, y: 20 }],
    [{ x: 35, y: 100 }, { x: 50, y: 100 }, { x: 65, y: 100 }],
  ],
  O: [
    [
      { x: 50, y: 20 }, { x: 75, y: 25 }, { x: 80, y: 60 }, { x: 75, y: 95 },
      { x: 50, y: 100 }, { x: 25, y: 95 }, { x: 20, y: 60 }, { x: 25, y: 25 },
      { x: 50, y: 20 },
    ],
  ],
  U: [
    [
      { x: 25, y: 20 }, { x: 25, y: 70 }, { x: 32, y: 95 }, { x: 50, y: 100 },
      { x: 68, y: 95 }, { x: 75, y: 70 }, { x: 75, y: 20 },
    ],
  ],
  M: [
    [{ x: 20, y: 100 }, { x: 20, y: 60 }, { x: 20, y: 20 }],
    [{ x: 20, y: 20 }, { x: 35, y: 60 }, { x: 50, y: 100 }],
    [{ x: 50, y: 100 }, { x: 65, y: 60 }, { x: 80, y: 20 }],
    [{ x: 80, y: 20 }, { x: 80, y: 60 }, { x: 80, y: 100 }],
  ],
  P: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 65, y: 35 }, { x: 55, y: 50 }, { x: 30, y: 50 }],
  ],
  S: [
    [
      { x: 70, y: 30 }, { x: 50, y: 20 }, { x: 30, y: 30 }, { x: 30, y: 48 },
      { x: 50, y: 60 }, { x: 70, y: 72 }, { x: 70, y: 90 }, { x: 50, y: 100 },
      { x: 30, y: 90 },
    ],
  ],
  L: [
    [{ x: 35, y: 20 }, { x: 35, y: 60 }, { x: 35, y: 100 }],
    [{ x: 35, y: 100 }, { x: 55, y: 100 }, { x: 70, y: 100 }],
  ],
  T: [
    [{ x: 30, y: 20 }, { x: 50, y: 20 }, { x: 70, y: 20 }],
    [{ x: 50, y: 20 }, { x: 50, y: 60 }, { x: 50, y: 100 }],
  ],
  N: [
    [{ x: 25, y: 100 }, { x: 25, y: 60 }, { x: 25, y: 20 }],
    [{ x: 25, y: 20 }, { x: 50, y: 60 }, { x: 75, y: 100 }],
    [{ x: 75, y: 100 }, { x: 75, y: 60 }, { x: 75, y: 20 }],
  ],
  D: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 70, y: 40 }, { x: 70, y: 80 }, { x: 55, y: 100 }, { x: 30, y: 100 }],
  ],
  R: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 65, y: 35 }, { x: 55, y: 50 }, { x: 30, y: 50 }],
    [{ x: 30, y: 50 }, { x: 50, y: 75 }, { x: 70, y: 100 }],
  ],
  C: [
    [
      { x: 70, y: 30 }, { x: 50, y: 20 }, { x: 32, y: 40 }, { x: 32, y: 80 },
      { x: 50, y: 100 }, { x: 70, y: 90 },
    ],
  ],
  B: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 60, y: 35 }, { x: 50, y: 50 }, { x: 30, y: 50 }],
    [{ x: 30, y: 50 }, { x: 55, y: 50 }, { x: 65, y: 70 }, { x: 55, y: 100 }, { x: 30, y: 100 }],
  ],
  F: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 30, y: 20 }, { x: 55, y: 20 }, { x: 70, y: 20 }],
    [{ x: 30, y: 55 }, { x: 50, y: 55 }, { x: 65, y: 55 }],
  ],
  G: [
    [
      { x: 70, y: 30 }, { x: 50, y: 20 }, { x: 30, y: 40 }, { x: 30, y: 80 },
      { x: 50, y: 100 }, { x: 70, y: 100 }, { x: 70, y: 70 }, { x: 55, y: 70 },
    ],
  ],
  H: [
    [{ x: 25, y: 20 }, { x: 25, y: 60 }, { x: 25, y: 100 }],
    [{ x: 75, y: 20 }, { x: 75, y: 60 }, { x: 75, y: 100 }],
    [{ x: 25, y: 60 }, { x: 50, y: 60 }, { x: 75, y: 60 }],
  ],
  J: [
    [{ x: 35, y: 20 }, { x: 55, y: 20 }, { x: 75, y: 20 }],
    [{ x: 55, y: 20 }, { x: 55, y: 75 }, { x: 50, y: 95 }, { x: 35, y: 95 }, { x: 30, y: 80 }],
  ],
  K: [
    [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 30, y: 100 }],
    [{ x: 65, y: 20 }, { x: 45, y: 50 }, { x: 30, y: 60 }],
    [{ x: 30, y: 60 }, { x: 45, y: 70 }, { x: 70, y: 100 }],
  ],
  // Added for the workbook writing-line coverage (standard letterforms):
  V: [
    [{ x: 20, y: 20 }, { x: 35, y: 60 }, { x: 50, y: 100 }, { x: 65, y: 60 }, { x: 80, y: 20 }],
  ],
  Y: [
    [{ x: 20, y: 20 }, { x: 35, y: 40 }, { x: 50, y: 60 }, { x: 50, y: 80 }, { x: 50, y: 100 }],
    [{ x: 80, y: 20 }, { x: 65, y: 40 }, { x: 50, y: 60 }],
  ],
  Z: [
    [
      { x: 25, y: 20 }, { x: 50, y: 20 }, { x: 75, y: 20 }, { x: 50, y: 60 },
      { x: 25, y: 100 }, { x: 50, y: 100 }, { x: 75, y: 100 },
    ],
  ],
};

/**
 * Letters whose lowercase print-manuscript form is genuinely the same shape
 * as its uppercase (just smaller), so sharing one template is faithful, not
 * a guess: O/o, U/u, C/c, S/s, V/v, Z/z. Every other lowercase letter in this
 * workbook's alphabet (a, e, i, m, p, t, d, l, n, b, r, g, f, j, y) has a
 * shape that genuinely differs from its uppercase (a is a bowl+stem not a
 * peaked triangle, e is a loop not three bars, etc.) — inventing those
 * lowercase paths from memory without a real handwriting-curriculum
 * reference risks teaching a child an incorrect letterform, so they are
 * intentionally NOT templated yet and fall back to the static line.
 */
const CASE_SHAPE_MATCHES_UPPER = new Set(["O", "U", "C", "S", "V", "Z"]);

/**
 * Returns the trace template for a printed model letter, or null when there is
 * no faithful template yet. Digraphs/diacritics with no unambiguous
 * single-glyph stroke path (RR, Ñ) intentionally return null, as does any
 * lowercase letter whose shape isn't a same-topology match for its uppercase
 * (see CASE_SHAPE_MATCHES_UPPER) — both fall back to the static writing line
 * rather than trace a guessed shape.
 */
export function getLetterTemplate(modelText: string | undefined | null): Point[][] | null {
  if (!modelText) return null;
  const trimmed = modelText.trim();
  const isLower = trimmed === trimmed.toLowerCase() && trimmed !== trimmed.toUpperCase();
  const key = trimmed.toUpperCase();
  if (isLower && !CASE_SHAPE_MATCHES_UPPER.has(key)) return null;
  return LETTER_TEMPLATES[key] ?? null;
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
