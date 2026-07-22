/**
 * art-blend — STEP 1 "instant safety net" for scanned illustrations.
 *
 * Any faithful book crop that is still an opaque WHITE-PAPER BOX gets
 * `mix-blend-mode: multiply` (via `data-art-opaque="true"` + art-blend.css),
 * so the white rectangle visually drops out on light/coloured backgrounds
 * immediately — even before the offline cleanup pipeline has run.
 *
 * GUARD: multiply is applied ONLY to images whose four corners are opaque AND
 * near-white (an actual paper box). Images that already have a transparent
 * background (the pipeline output) — or full-bleed coloured art — are left
 * untouched, so nothing that is already clean gets darkened.
 *
 * One delegated `load` listener covers every art <img> on every surface
 * (activity grids, workbook pages, flipchart) with no per-call-site changes.
 */

const ART_RE = /\/cartilla\/art\/faithful\//;
const WHITE_MIN = 236;
const WHITE_SAT = 18;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function corner(
  img: HTMLImageElement,
  sx: number,
  sy: number,
): [number, number, number, number] | null {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = 3;
    canvas.height = 3;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return null;
  try {
    ctx.clearRect(0, 0, 3, 3);
    ctx.drawImage(img, sx, sy, 3, 3, 0, 0, 3, 3);
    const d = ctx.getImageData(1, 1, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  } catch {
    return null; // tainted canvas etc. — fail safe (no blend)
  }
}

function isWhiteBox(img: HTMLImageElement): boolean {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return false;
  const pts: Array<[number, number]> = [
    [1, 1],
    [w - 4, 1],
    [1, h - 4],
    [w - 4, h - 4],
  ];
  for (const [x, y] of pts) {
    const px = corner(img, Math.max(0, x), Math.max(0, y));
    if (!px) return false;
    const [r, g, b, a] = px;
    if (a < 250) return false; // any transparency at a corner -> already clean
    const mn = Math.min(r, g, b);
    const mx = Math.max(r, g, b);
    if (!(mn >= WHITE_MIN && mx - mn <= WHITE_SAT)) return false; // coloured corner -> full-bleed art
  }
  return true;
}

function evaluate(img: HTMLImageElement) {
  const src = img.currentSrc || img.src || "";
  if (!ART_RE.test(src)) return;
  img.dataset.artOpaque = isWhiteBox(img) ? "true" : "false";
}

let started = false;

export function initArtScanBlend(): void {
  if (started || typeof document === "undefined") return;
  started = true;

  // Delegated: fires for every <img> that finishes loading, now and later.
  document.addEventListener(
    "load",
    (e) => {
      const t = e.target;
      if (t instanceof HTMLImageElement) evaluate(t);
    },
    true,
  );

  // Catch images already decoded from cache before the listener attached.
  const sweep = () => {
    document.querySelectorAll("img").forEach((img) => {
      if (img instanceof HTMLImageElement && img.complete && img.naturalWidth) evaluate(img);
    });
  };
  sweep();
  // Re-sweep shortly after navigations paint new art in.
  window.addEventListener("popstate", () => setTimeout(sweep, 300));
}
