import { useEffect, useRef, type RefObject } from "react";
import { curlEase, curlGeometry, fmt, frontClipPath, type Pt } from "@/lib/page-curl-geometry";

/**
 * Realistic paper curl for the lesson page turn (owner direction 2026-10-14:
 * "right to left, slow motion, realistic paper curl").
 *
 * The turning sheet lifts at its bottom-right corner, rolls over a soft
 * cylinder and travels from right to left, showing the blank back of the
 * paper, while the next page is revealed underneath with a moving shadow.
 * Going back plays the same curl in reverse (the previous page rolls back
 * in from the left).
 *
 * Drawing: the turning leaf is clipped to the flat part still lying on the
 * table (CSS clip-path), and one SVG layer above it paints the curled paper,
 * the back of the sheet and the shadows. All geometry is recomputed every
 * animation frame from a single progress value (0 = flat, 1 = turned away).
 */

type CurlPhase = "idle" | "zoom" | "curling" | "settling" | "dragging";

const PAPER_BACK = ["#efe5d3", "#f7f0e3", "#fffaf2", "#e6dac5", "#cbbb9f"];

export function PageCurl({
  phase,
  direction,
  leafRef,
  dragProgressRef,
  turnMs,
  liftMs,
}: {
  phase: CurlPhase;
  direction: "next" | "prev" | null;
  leafRef: RefObject<HTMLDivElement | null>;
  dragProgressRef: RefObject<number>;
  /** Duration of the main curl. */
  turnMs: number;
  /** Corner lift before the curl (the "zoom" phase). */
  liftMs: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef(0);
  const animRef = useRef<{ from: number; start: number; dur: number } | null>(null);

  const active = phase === "zoom" || phase === "curling" || phase === "dragging";

  // Start the timed part of the turn when the phase changes.
  useEffect(() => {
    const now = performance.now();
    if (phase === "zoom") {
      progressRef.current = 0;
      animRef.current = { from: 0, start: now, dur: liftMs + turnMs };
    } else if (phase === "curling" && !animRef.current) {
      // Released after a corner drag: finish from where the finger left it.
      const from = progressRef.current;
      animRef.current = { from, start: now, dur: Math.max(120, turnMs * (1 - from)) };
    } else if (phase === "dragging") {
      animRef.current = null;
    } else if (phase === "idle" || phase === "settling") {
      animRef.current = null;
      progressRef.current = 0;
    }
  }, [phase, liftMs, turnMs]);

  useEffect(() => {
    const leaf = leafRef.current;
    if (!active || !leaf) {
      if (leaf) leaf.style.removeProperty("clip-path");
      return;
    }
    if (typeof window.requestAnimationFrame !== "function") return;
    let frame = 0;
    const draw = () => {
      const svg = svgRef.current;
      const w = leaf.offsetWidth;
      const h = leaf.offsetHeight;
      let p = progressRef.current;
      const anim = animRef.current;
      if (anim) {
        const t = (performance.now() - anim.start) / anim.dur;
        p = anim.from + (1 - anim.from) * curlEase(t);
      } else if (phase === "dragging") {
        // Follow the finger with a little weight, like real paper.
        p += ((dragProgressRef.current ?? 0) - p) * 0.35;
      }
      progressRef.current = p;
      // Going back plays the same curl in reverse: the previous page
      // rolls back in from the left and lies down flat.
      const shown = direction === "prev" ? 1 - p : p;
      if (svg && w > 0 && h > 0) {
        const g = curlGeometry(w, h, shown);
        leaf.style.clipPath = frontClipPath(g.front);
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svg.setAttribute("width", String(w));
        svg.setAttribute("height", String(h));
        const set = (sel: string, pts: string) =>
          svg.querySelector(sel)?.setAttribute("points", pts);
        set(".native-page-curl__back", g.back.length > 2 ? fmt(g.back) : "");
        set(".native-page-curl__roll", g.roll.length > 2 ? fmt(g.roll) : "");
        set(".native-page-curl__shadow", g.shadow.length > 2 ? fmt(g.shadow) : "");
        // Shading bands run parallel to the fold line.
        const along = (d: number): Pt => [
          g.origin[0] + g.normal[0] * d,
          g.origin[1] + g.normal[1] * d,
        ];
        const band = (sel: string, a: number, b: number) => {
          const el = svg.querySelector(sel);
          if (!el) return;
          const [x1, y1] = along(a);
          const [x2, y2] = along(b);
          el.setAttribute("x1", x1.toFixed(1));
          el.setAttribute("y1", y1.toFixed(1));
          el.setAttribute("x2", x2.toFixed(1));
          el.setAttribute("y2", y2.toFixed(1));
        };
        band("linearGradient[data-band='back']", -w * 1.1, g.radius);
        band("linearGradient[data-band='roll']", 0, g.radius);
        band("linearGradient[data-band='shadow']", 0, g.radius * 2.4);
        const backStops = svg.querySelectorAll("linearGradient[data-band='back'] stop");
        const span = w * 1.1 + g.radius;
        const offsets = [
          0,
          (w * 1.1) / span,
          (w * 1.1 + g.radius * 0.45) / span,
          (w * 1.1 + g.radius * 0.85) / span,
          1,
        ];
        backStops.forEach((stop, i) => stop.setAttribute("offset", offsets[i].toFixed(4)));
        svg.style.opacity = String(g.opacity);
      }
      frame = window.requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.cancelAnimationFrame(frame);
      leaf.style.removeProperty("clip-path");
    };
  }, [active, phase, direction, leafRef, dragProgressRef]);

  if (!active) return null;
  return (
    <svg ref={svgRef} className="native-page-curl" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient data-band="back" id="native-page-curl-back" gradientUnits="userSpaceOnUse">
          {PAPER_BACK.map((c, i) => (
            <stop key={c} offset={i / (PAPER_BACK.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient data-band="roll" id="native-page-curl-roll" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbf7ef" />
          <stop offset="0.6" stopColor="#efe6d6" />
          <stop offset="1" stopColor="#cfc1a8" />
        </linearGradient>
        <linearGradient
          data-band="shadow"
          id="native-page-curl-shadow"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2b1d0e" stopOpacity="0.34" />
          <stop offset="0.42" stopColor="#2b1d0e" stopOpacity="0.26" />
          <stop offset="1" stopColor="#2b1d0e" stopOpacity="0" />
        </linearGradient>
        <filter id="native-page-curl-lift" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-6" dy="5" stdDeviation="7" floodColor="#2b1d0e" floodOpacity="0.28" />
        </filter>
      </defs>
      <polygon className="native-page-curl__shadow" fill="url(#native-page-curl-shadow)" />
      <g filter="url(#native-page-curl-lift)">
        <polygon className="native-page-curl__roll" fill="url(#native-page-curl-roll)" />
        <polygon className="native-page-curl__back" fill="url(#native-page-curl-back)" />
      </g>
    </svg>
  );
}
