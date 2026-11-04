/** One viewport tool shared by hovering, drawing and erasing. No activity owns a sprite. */
export type PencilPoint = { x: number; y: number };
type PointerState = PencilPoint & { visible: boolean; eraser: boolean };
let state: PointerState = { x: 0, y: 0, visible: false, eraser: false };
let hover = state;
let owner: symbol | null = null;
const listeners = new Set<() => void>();
const publish = (next: PointerState) => { state = next; listeners.forEach(fn => fn()); };
export const subscribeWorkbookPointer = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getWorkbookPointer = () => state;
export function hoverWorkbookPointer(x: number, y: number, visible: boolean) {
  hover = { x, y, visible, eraser: false };
  if (!owner) publish(hover);
}
export const graphiteWidth = (pixelsPerMs: number) => Math.max(3.3, Math.min(6.4, 6.4 - pixelsPerMs * 2.2));
/** Match the SVG ink's 0.45 0.05 0.55 0.95 cubic easing at the same time. */
export function pencilProgress(time: number) {
  const cubic = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; if (cubic(mid, 0.45, 0.55) < time) lo = mid; else hi = mid; }
  return cubic((lo + hi) / 2, 0.05, 0.95);
}
/** Keep the SAME screen-sized tool on the ink path; caller retains semantic timing. */
export function animateWorkbookPointer(pointAt: (progress: number) => PencilPoint | null, duration: number, eraser = false) {
  const me = Symbol('cursor-motion'); owner = me;
  const origin = state;
  const approachMs = eraser ? 0 : 200;
  let frame = 0;
  const start = performance.now();
  const tick = (now: number) => {
    if (owner !== me) return;
    const elapsed = now - start;
    const progress = Math.max(0, Math.min(1, (elapsed - approachMs) / (duration - approachMs)));
    const point = pointAt(progress);
    if (point) {
      const approach = Math.min(1, elapsed / Math.max(1, approachMs));
      publish({ x: origin.x + (point.x - origin.x) * approach, y: origin.y + (point.y - origin.y) * approach, visible: true, eraser });
    }
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    if (owner === me) {
      // Return the same tool to the real pointer without a replacement/jump.
      const from = state; const back = Symbol('cursor-return'); owner = back;
      const since = performance.now();
      const returnToHover = (now: number) => {
        if (owner !== back) return;
        const t = Math.min(1, (now - since) / 150);
        publish({ x: from.x + (hover.x - from.x) * t, y: from.y + (hover.y - from.y) * t, visible: from.visible || hover.visible, eraser: false });
        if (t < 1) requestAnimationFrame(returnToHover);
        else { owner = null; publish(hover); }
      };
      requestAnimationFrame(returnToHover);
    }
  };
}
/** Native SVG geometry includes current close-up transforms and letterboxing. */
export function screenPointOnPath(path: SVGPathElement | undefined, progress: number): PencilPoint | null {
  if (!path?.getTotalLength || !path.getScreenCTM) return null;
  const matrix = path.getScreenCTM();
  if (!matrix) return null;
  const point = path.getPointAtLength(path.getTotalLength() * Math.max(0, Math.min(1, progress)));
  return { x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f };
}
