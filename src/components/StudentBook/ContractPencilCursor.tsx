import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ERASER_CURSOR_SRC,
  ERASER_VIEWBOX,
  PENCIL_TIP_SRC,
  PENCIL_TIP_VIEWBOX,
  recordPointer,
  toolSize,
} from "@/lib/cursor-mode";
import {
  contractEase,
  contractTipAt,
  getTipFlight,
  isEraserActive,
  isManualEraserActive,
  markToScreen,
  PENCIL_CONTRACT,
  subscribeTip,
} from "@/lib/pencil-contract";

/** Natural aspect ratios of uncropped HD cursor SVGs (active tip/corner at 0,0). */
const TIP_ASPECT = PENCIL_TIP_VIEWBOX.height / PENCIL_TIP_VIEWBOX.width;
const ERASER_ASPECT = ERASER_VIEWBOX.height / ERASER_VIEWBOX.width;

/**
 * Option B (Locked Default) — the single High-Definition uncropped classic
 * wooden pencil cursor (`owner-pencil-tip.svg`, graphite point at 0,0) and
 * full-body beveled pink school eraser (`owner-eraser.svg`, rubbing corner at 0,0)
 * when a canvas eraser tool is active. It follows the real pointer, travels along
 * each mark while the kernel draws it, and hides while the autonomous wrong-mark
 * eraser rubs. Purely visual: pointer events always reach the real controls.
 */
export function ContractPencilCursor() {
  const host = useRef<HTMLDivElement>(null);
  const [manualEraser, setManualEraser] = useState(isManualEraserActive);
  const coarse =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
  const pencilWidth = toolSize("tip");
  const pencilHeight = Math.round(pencilWidth * TIP_ASPECT);
  const eraserWidth = Math.round(toolSize("eraser") * 1.45);
  const eraserHeight = Math.round(eraserWidth * ERASER_ASPECT);

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
      // Graphite point (pencil) or active rubbing corner (eraser) is at exact (0, 0).
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
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
        !!target?.closest('.native-lesson-viewer, [data-pencil-cursor-host="true"]') &&
        !target.closest(
          "input, textarea, select, [contenteditable=true], .native-lesson-viewer__navigation",
        );
      if (!getTipFlight() && (!returnFrom || performance.now() - returnFrom.at >= 300)) {
        place(pointer[0], pointer[1], !isEraserActive() && inside && (!coarse || pressed));
      }
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
    const unsubscribe = subscribeTip(() => setManualEraser(isManualEraserActive()));
    setManualEraser(isManualEraserActive());
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerover", move, true);
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
      window.removeEventListener("pointerover", move, true);
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", leave, true);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [coarse]);

  if (typeof document === "undefined") return null;
  const showingEraser = manualEraser;
  const width = showingEraser ? eraserWidth : pencilWidth;
  const height = showingEraser ? eraserHeight : pencilHeight;
  return createPortal(
    <div
      ref={host}
      className="contract-pencil-cursor"
      data-visible="false"
      data-testid="contract-pencil-cursor"
      data-pencil-pose={showingEraser ? "hd-eraser" : "hd-tip"}
      data-tool={showingEraser ? "eraser" : "pencil"}
      aria-hidden="true"
      style={{ width, height, overflow: "visible" }}
    >
      <img
        src={showingEraser ? ERASER_CURSOR_SRC : PENCIL_TIP_SRC}
        width={width}
        height={height}
        alt=""
        draggable={false}
        className={
          showingEraser
            ? "contract-pencil-cursor__img contract-pencil-cursor__img--eraser"
            : "contract-pencil-cursor__img"
        }
      />
    </div>,
    document.body,
  );
}

export const CONTRACT_CURSOR_TIMING = PENCIL_CONTRACT;
