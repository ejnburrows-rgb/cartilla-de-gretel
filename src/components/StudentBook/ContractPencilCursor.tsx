import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { PencilShape } from "@/components/cartilla/WorkbookPencilMark";
import { recordPointer } from "@/lib/cursor-mode";
import {
  contractEase,
  contractTipAt,
  getTipFlight,
  isEraserActive,
  markToScreen,
  PENCIL_CONTRACT,
  subscribeTip,
} from "@/lib/pencil-contract";

/** Size of the close-up window around the graphite point (CSS px). */
const FINE_SIZE = 168;
const COARSE_SIZE = 128;
/** The graphite point sits this far inside the window so the tip is never clipped. */
const PAD = 6;
/** Space around the graphite point for optional whole-pencil pose experiments (CSS px). */
const FINE_EXTENT = 145;
const COARSE_EXTENT = 110;

/**
 * Option B (Locked Default) — the single Large Realistic Wooden Pencil-Tip cursor
 * (November 1 contract). It is the existing Workbook PencilShape, shown close up
 * with its graphite point as the hotspot, pointing up-left. It follows the real
 * pointer, travels along each mark while the kernel draws it, and hides while the
 * eraser works. Purely visual: pointer events always reach the real controls.
 */
export function ContractPencilCursor() {
  const host = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGGElement>(null);
  const uid = `contract-tip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const coarse =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
  const requestedPose =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("pencil")
      : null;
  const pose = requestedPose === "up" || requestedPose === "down" ? requestedPose : null;
  const extent = coarse ? COARSE_EXTENT : FINE_EXTENT;
  const size = pose ? extent * 2 : coarse ? COARSE_SIZE : FINE_SIZE;
  const scale = pose ? (coarse ? 1.3 : 1.7) : coarse ? 2.6 : 3.4;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("cartilla-cursor-contract");
    let pointer: [number, number] | null = null;
    let inside = false;
    let pressed = false;
    let returnFrom: { at: number; pt: [number, number] } | null = null;
    let lastShown: [number, number] | null = null;
    let raf = 0;

    const place = (x: number, y: number, visible: boolean) => {
      const el = host.current;
      if (!el) return;
      if (pose) {
        const directionX = x > window.innerWidth - extent ? -1 : 1;
        const directionY =
          y < extent ? 1 : y > window.innerHeight - extent ? -1 : pose === "up" ? -1 : 1;
        el.style.transform = `translate3d(${(x - extent).toFixed(1)}px, ${(y - extent).toFixed(1)}px, 0)`;
        shape.current?.setAttribute(
          "transform",
          `translate(${extent} ${extent}) scale(${directionX} ${directionY}) rotate(135) scale(${scale})`,
        );
      } else {
        el.style.transform = `translate3d(${(x - PAD).toFixed(1)}px, ${(y - PAD).toFixed(1)}px, 0)`;
      }
      el.dataset.visible = visible ? "true" : "false";
      if (visible) lastShown = [x, y];
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const erasing = isEraserActive();
      const flight = getTipFlight();
      if (flight && flight.el.isConnected) {
        const ms = now - flight.start;
        const first = flight.strokes[0];
        const tip = contractTipAt(flight.strokes, ms);
        let target: [number, number];
        if (tip) target = markToScreen(flight.el, flight.height, tip);
        else {
          const startPt = markToScreen(flight.el, flight.height, first.points[0]);
          const from = lastShown ?? pointer ?? startPt;
          const k = contractEase(ms / Math.max(1, first.begin));
          target = [from[0] + (startPt[0] - from[0]) * k, from[1] + (startPt[1] - from[1]) * k];
        }
        returnFrom = { at: now, pt: target };
        place(target[0], target[1], !erasing);
        return;
      }
      if (returnFrom && pointer && now - returnFrom.at < 300) {
        const k = contractEase((now - returnFrom.at) / 300);
        place(
          returnFrom.pt[0] + (pointer[0] - returnFrom.pt[0]) * k,
          returnFrom.pt[1] + (pointer[1] - returnFrom.pt[1]) * k,
          !erasing,
        );
        return;
      }
      if (pointer) place(pointer[0], pointer[1], !erasing && inside && (!coarse || pressed));
      else if (host.current) host.current.dataset.visible = "false";
    };

    const move = (event: PointerEvent) => {
      recordPointer(event.clientX, event.clientY);
      pointer = [event.clientX, event.clientY];
      const target = event.target instanceof Element ? event.target : null;
      inside =
        !!target?.closest(".native-lesson-viewer") &&
        !target.closest(
          "input, textarea, select, [contenteditable=true], .native-lesson-viewer__nav",
        );
    };
    const down = (event: PointerEvent) => {
      pressed = true;
      move(event);
    };
    const up = () => {
      pressed = false;
    };
    const leave = () => {
      inside = false;
      pressed = false;
    };
    const unsubscribe = subscribeTip(() => undefined);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", leave, true);
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
      root.classList.remove("cartilla-cursor-contract");
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", leave, true);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [coarse, extent, scale, pose]);

  if (typeof document === "undefined") return null;
  // Tip at (PAD, PAD); body runs down-right (rotate 135° turns the shape's -y body axis).
  return createPortal(
    <div
      ref={host}
      className="contract-pencil-cursor"
      data-visible="false"
      data-testid="contract-pencil-cursor"
      data-pencil-pose={pose ?? "tip"}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="hidden">
        <defs>
          {!pose && (
            <>
              <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.55" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={size} height={size}>
                <rect width={size} height={size} fill={`url(#${uid}-fade)`} />
              </mask>
            </>
          )}
          <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="180%" height="180%">
            <feDropShadow
              dx="2.5"
              dy="3.5"
              stdDeviation="2.5"
              floodColor="#3b2a14"
              floodOpacity="0.28"
            />
          </filter>
        </defs>
        <g mask={pose ? undefined : `url(#${uid}-mask)`} filter={`url(#${uid}-shadow)`}>
          <g
            ref={shape}
            transform={`translate(${pose ? extent : PAD} ${pose ? extent : PAD}) rotate(135) scale(${scale})`}
          >
            <PencilShape uid={uid} />
          </g>
        </g>
      </svg>
    </div>,
    document.body,
  );
}

export const CONTRACT_CURSOR_TIMING = PENCIL_CONTRACT;
