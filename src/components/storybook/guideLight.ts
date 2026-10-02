/**
 * Gretel's guide light: when the existing hint/demonstration logic resolves a
 * real target (task:point), a small warm light travels from Gretel's hands to
 * that target and the target glows twice. Reduced motion: no flight, the
 * target keeps its static highlight from GretelActivity.
 */
export function flyGuideLight(from: DOMRect, target: HTMLElement, reduced: boolean): void {
  if (typeof document === "undefined") return;
  const to = target.getBoundingClientRect();
  if (!to.width || !to.height) return;
  target.setAttribute("data-sb-guided", "true");
  window.setTimeout(() => target.removeAttribute("data-sb-guided"), reduced ? 2600 : 2400);
  if (reduced || typeof document.body.animate !== "function") return;

  const orb = document.createElement("span");
  orb.className = "sb-guide-light";
  orb.setAttribute("aria-hidden", "true");
  document.body.appendChild(orb);
  const sx = from.left + from.width * 0.5;
  const sy = from.top + from.height * 0.5;
  const ex = to.left + to.width / 2;
  const ey = to.top + to.height / 2;
  const lift = Math.min(160, Math.max(60, Math.abs(ex - sx) * 0.35));
  const mx = (sx + ex) / 2;
  const my = Math.min(sy, ey) - lift;
  const at = (x: number, y: number, s: number, o: number) => ({
    transform: `translate(${x - 14}px, ${y - 14}px) scale(${s})`,
    opacity: o,
  });
  const animation = orb.animate(
    [
      at(sx, sy, 0.4, 0),
      at(sx, sy - 12, 1, 1),
      at(mx, my, 1.1, 1),
      at(ex, ey, 1.25, 0.95),
      at(ex, ey, 2.4, 0),
    ],
    { duration: 1050, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" },
  );
  animation.onfinish = () => orb.remove();
  window.setTimeout(() => orb.remove(), 1600);
}
