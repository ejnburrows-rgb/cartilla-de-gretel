// layout.ts — Chano scene geometry, in pixels of the owner-supplied scene art (1086 × 1448).
// Every overlay is placed in these art pixels and the whole scene is scaled as one unit.
export const SCENE_W = 1086;
export const SCENE_H = 1448;
export const ART = "/cartilla/art/chano-scene";

/** Chano layers cut from the scene art (top-left corner and size of each sprite). */
export const CHANO = {
  body: { x: 197, y: 191, w: 458, h: 627 },
  armLeft: { x: 69, y: 467, w: 192, h: 221, pivotX: 181, pivotY: 173 },
  armRight: { x: 574, y: 516, w: 175, h: 206, pivotX: 38, pivotY: 124 },
  /** Breathing grows from the point where Chano meets the chalkboard frame. */
  breatheOrigin: { x: 426, y: 818 },
} as const;

/** The four beach balls painted along the bottom of the scene (centre + radius). */
export const BALLS = [
  { syllable: "ma", cx: 177, cy: 1312, r: 90 },
  { syllable: "mi", cx: 430, cy: 1330, r: 88 },
  { syllable: "mu", cx: 673, cy: 1330, r: 89 },
  { syllable: "me", cx: 921, cy: 1332, r: 86 },
] as const;

/** Clean chalkboard writing area (left of the small clown on the shelf). */
export const BOARD = { x: 114, y: 851, w: 764, h: 343 };
export const SLOTS = [
  { x: 342, y: 980, w: 157, h: 145 },
  { x: 527, y: 980, w: 157, h: 145 },
] as const;

/** Illustrated Instrucciones panel and its painted speaker button. */
export const PANEL = { x: 712, y: 168, w: 352, h: 712 };
export const SPEAKER = { cx: 1006, cy: 236, r: 42 };

/** Juggling Geometry derived from hand positions */
export const JUGGLE_GEO = {
  // Coordinates chosen relative to arm bounds/pivots to align with the clown's illustrated hands.
  // Left arm bounds: x: 69, y: 467, w: 192, h: 221
  // Right arm bounds: x: 574, y: 516, w: 175, h: 206
  catchLeft: { x: 180, y: 640 },
  throwLeft: { x: 230, y: 620 },
  catchRight: { x: 630, y: 670 },
  throwRight: { x: 580, y: 650 },
  // Apex between 38-45% of card height (1448 * 0.4 ≈ 580). Let's use 500.
  apexY: 500
} as const;
