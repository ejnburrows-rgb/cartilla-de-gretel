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

/** Space around the graphite point for the full pencil (CSS px). */
const FINE_EXTENT = 145;
const COARSE_EXTENT = 110;

/**
 * Draft full-pencil cursor for owner review after the owner rejected cropping.
 * It uses the existing Workbook PencilShape, with the graphite point as hotspot.
 * The experimental poses turn inward near viewport edges. It follows the pointer,
 * travels along each mark while the kernel draws it, and hides while the eraser
 * works. Purely visual: pointer events always reach the real controls.
 */
export function ContractPencilCursor() {
  const host = useRef<HTMLDivElement>(null);
  const shape = useRef<SVGGElement>(null);
  const uid = `contract-tip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const coarse =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
  const extent = coarse ? COARSE_EXTENT : FINE_EXTENT;
  const size = extent * 2;
  const scale = coarse ? 1.3 : 1.7;
  // Two full-pencil poses for owner comparison; neither introduces another tool.
  const pose =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("pencil") === "up"
      ? "up"
      : "down";

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
      // Keep the point under the pointer; turn the full pencil inward near edges.
      const directionX = x > window.innerWidth - extent ? -1 : 1;
      const directionY =
        y < extent ? 1 : y > window.innerHeight - extent ? -1 : pose === "up" ? -1 : 1;
      el.style.transform = `translate3d(${(x - extent).toFixed(1)}px, ${(y - extent).toFixed(1)}px, 0)`;
      shape.current?.setAttribute(
        "transform",
        `translate(${extent} ${extent}) scale(${directionX} ${directionY}) rotate(135) scale(${scale})`,
      );
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
  // The graphite point remains the hotspot; the entire existing pencil is visible.
  return createPortal(
    <div
      ref={host}
      className="contract-pencil-cursor"
      data-visible="false"
      data-testid="contract-pencil-cursor"
      data-pencil-pose={pose}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="hidden">
        <defs>
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
        <g filter={`url(#${uid}-shadow)`}>
          <g ref={shape} transform={`translate(${extent} ${extent}) rotate(135) scale(${scale})`}>
            <PencilShape uid={uid} />
          </g>
        </g>
      </svg>
    </div>,
    document.body,
  );
}

export const CONTRACT_CURSOR_TIMING = PENCIL_CONTRACT;
