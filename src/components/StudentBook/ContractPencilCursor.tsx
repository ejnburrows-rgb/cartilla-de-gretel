import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CONTRACT_PENCIL_CENTER_Y,
  CONTRACT_PENCIL_STRETCH,
  CONTRACT_PENCIL_TILT,
  PencilShape,
} from "@/components/cartilla/WorkbookPencilMark";
import { recordPointer } from "@/lib/cursor-mode";
import {
  contractEase,
  contractEraseAt,
  contractTipAt,
  endEraseFlight,
  endTipFlight,
  getEraseFlight,
  getTipFlight,
  isExternalEraserActive,
  isManualEraserActive,
  markToScreen,
  PENCIL_CONTRACT,
  subscribeTip,
} from "@/lib/pencil-contract";

/**
 * Uncropped SVG viewBox centered generously around the full classic wooden pencil
 * at `rotate(60)` across every 0°–180° flip angle so neither the pencil nor its
 * drop-shadow ever clips. SVG origin (0, 0) aligns 1:1 to the cursor hotspot.
 */
const VB_X = -25;
const VB_Y = -105;
const VB_W = 155;
const VB_H = 155;

/**
 * Option B (Locked Default) — ONE single physical classic wooden pencil (`PencilShape`)
 * rendered directly as crisp uncropped vector SVG at natural up-right writing angle
 * (`rotate(60)`):
 * - Hovering & drawing: graphite point sits at exact `(0, 0)` hotspot.
 * - Autonomous wrong-mark erasing: the EXACT SAME single pencil smoothly flips 180°
 *   around its midpoint onto its back pink eraser dome (attached to the silver ribbed
 *   ferrule), rubs back-and-forth for 3.5s while 12 pink crumbs scatter, and flips
 *   smoothly back 180° to its graphite tip.
 * - Manual canvas eraser tool (`DibujaHost`, `DrawBoxCanvas`, `WorkbookWritingResponse`):
 *   the same pencil flips 180° onto its back pink eraser dome at exact `(0, 0)` hotspot.
 * Purely visual: pointer events always reach the real controls.
 */
export function ContractPencilCursor() {
  const host = useRef<HTMLDivElement>(null);
  const poseRef = useRef<SVGGElement>(null);
  const flipRef = useRef<SVGGElement>(null);
  const uid = `contract-pencil-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [manualEraser, setManualEraser] = useState(isManualEraserActive);
  const [autoErasing, setAutoErasing] = useState(() => getEraseFlight() !== null);
  const coarse =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
  const reducedMotion =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const scale = coarse ? 1.45 : 2.0;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("cartilla-cursor-contract");
    let pointer: [number, number] | null = null;
    let inside = false;
    let pressed = false;
    let returnFrom: { at: number; pt: [number, number] } | null = null;
    let lastShown: [number, number] | null = null;
    let wasVisible = false;
    let activeEraseId: symbol | null = null;
    let eraseOrigin: [number, number] | null = null;
    let activeTipId: symbol | null = null;
    let tipOrigin: [number, number] | null = null;
    let currentFlipDeg = isManualEraserActive() ? 180 : 0;
    let manualFlip: { from: number; to: number; start: number } | null = null;
    let raf = 0;

    const setPose = (flipDeg: number, lift = 0) => {
      currentFlipDeg = flipDeg;
      if (poseRef.current) {
        poseRef.current.setAttribute(
          "transform",
          lift > 0.001
            ? `translate(${(lift * 5).toFixed(2)} ${(-lift * 9).toFixed(2)}) rotate(${CONTRACT_PENCIL_TILT})`
            : `rotate(${CONTRACT_PENCIL_TILT})`,
        );
      }
      if (flipRef.current) {
        flipRef.current.setAttribute(
          "transform",
          `rotate(${flipDeg.toFixed(2)} 0 ${CONTRACT_PENCIL_CENTER_Y})`,
        );
      }
    };

    const place = (x: number, y: number, visible: boolean) => {
      const el = host.current;
      if (!el) return;
      // Graphite point (0°) or back pink eraser dome (180°) sits at exact (0, 0).
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.dataset.visible = visible ? "true" : "false";
      wasVisible = visible;
      if (visible) lastShown = [x, y];
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const externalErasing = isExternalEraserActive();
      const eraseFlight = getEraseFlight();
      if (eraseFlight) {
        if (!eraseFlight.el.isConnected) {
          endEraseFlight(eraseFlight.id);
        } else {
          const ms = now - eraseFlight.start;
          const pose = contractEraseAt(eraseFlight, ms);
          const anchor = markToScreen(eraseFlight.el, eraseFlight.height, pose.markPt);
          if (activeEraseId !== eraseFlight.id) {
            activeEraseId = eraseFlight.id;
            eraseOrigin =
              wasVisible && lastShown ? lastShown : [anchor[0] + 18, anchor[1] - 14];
          }
          let target: [number, number];
          if (pose.phase === "enter") {
            const k = contractEase(ms / Math.max(1, eraseFlight.enterMs));
            const from = eraseOrigin ?? anchor;
            target = [from[0] + (anchor[0] - from[0]) * k, from[1] + (anchor[1] - from[1]) * k];
          } else if (pose.phase === "rub") {
            target = [anchor[0] + pose.scrubPx[0], anchor[1] + pose.scrubPx[1]];
          } else {
            const k = contractEase(
              (ms - (eraseFlight.enterMs + eraseFlight.rubMs)) / Math.max(1, eraseFlight.liftMs),
            );
            const dest: [number, number] =
              !coarse && pointer && inside ? pointer : [anchor[0] + 14, anchor[1] - 12];
            target = [anchor[0] + (dest[0] - anchor[0]) * k, anchor[1] + (dest[1] - anchor[1]) * k];
          }
          activeTipId = null;
          tipOrigin = null;
          manualFlip = null;
          setPose(pose.flipDeg, pose.lift);
          returnFrom = { at: now, pt: target };
          place(target[0], target[1], true);
          return;
        }
      }
      if (activeEraseId !== null) {
        activeEraseId = null;
        eraseOrigin = null;
        // Snap cleanly to graphite tip (0°) once auto-erase completes so tiny
        // remaining fractional degrees do not trigger a spurious 240ms flip hop.
        if (!isManualEraserActive()) {
          manualFlip = null;
          setPose(0, 0);
        }
      }

      const flight = getTipFlight();
      if (flight) {
        if (!flight.el.isConnected) {
          endTipFlight(flight.id);
        } else {
          manualFlip = null;
          const ms = now - flight.start;
          const first = flight.strokes[0];
          const last = flight.strokes[flight.strokes.length - 1];
          const lastEnd = last ? last.begin + last.dur : 0;
          const tip = contractTipAt(flight.strokes, ms);
          let target: [number, number];
          let lift = 0;
          if (ms < first.begin) {
            const startPt = markToScreen(flight.el, flight.height, first.points[0]);
            if (activeTipId !== flight.id) {
              activeTipId = flight.id;
              tipOrigin = wasVisible && lastShown ? lastShown : pointer ?? [startPt[0] + 22, startPt[1] - 18];
            }
            const from = tipOrigin ?? startPt;
            const k = contractEase(ms / Math.max(1, first.begin));
            target = [from[0] + (startPt[0] - from[0]) * k, from[1] + (startPt[1] - from[1]) * k];
            lift = (1 - k) * 0.45;
          } else if (tip) {
            activeTipId = flight.id;
            target = markToScreen(flight.el, flight.height, tip);
          } else {
            // Poised hold after stroke completion (400ms hold / 600ms red show before erase):
            // gently lift beside the final stroke end instead of teleporting back to stroke[0]
            // or vanishing on touch devices right before the 180° back-eraser flip.
            activeTipId = flight.id;
            const endPt = markToScreen(
              flight.el,
              flight.height,
              last.points[last.points.length - 1],
            );
            const k = contractEase((ms - lastEnd) / 180);
            target = [endPt[0] + 10 * k, endPt[1] - 10 * k];
            lift = 0.35 * k;
          }
          setPose(0, lift);
          returnFrom = { at: now, pt: target };
          place(target[0], target[1], !externalErasing);
          return;
        }
      }
      activeTipId = null;
      tipOrigin = null;

      const targetFlip = isManualEraserActive() ? 180 : 0;
      if (!manualFlip && Math.abs(currentFlipDeg - targetFlip) > 0.1) {
        manualFlip = { from: currentFlipDeg, to: targetFlip, start: now };
      } else if (manualFlip && manualFlip.to !== targetFlip) {
        manualFlip = { from: currentFlipDeg, to: targetFlip, start: now };
      }
      if (manualFlip) {
        const dur = reducedMotion ? 0 : 240;
        const k = dur <= 0 ? 1 : contractEase((now - manualFlip.start) / dur);
        const deg = manualFlip.from + (manualFlip.to - manualFlip.from) * k;
        const lift = dur <= 0 ? 0 : Math.sin(Math.PI * k) * 0.6;
        setPose(deg, lift);
        if (k >= 1) manualFlip = null;
      }

      if (returnFrom && !coarse && pointer && inside && now - returnFrom.at < 300) {
        const k = contractEase((now - returnFrom.at) / 300);
        place(
          returnFrom.pt[0] + (pointer[0] - returnFrom.pt[0]) * k,
          returnFrom.pt[1] + (pointer[1] - returnFrom.pt[1]) * k,
          !externalErasing,
        );
        return;
      }
      if (pointer) {
        place(pointer[0], pointer[1], !externalErasing && inside && (!coarse || pressed));
      } else if (host.current) {
        host.current.dataset.visible = "false";
        wasVisible = false;
      }
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
      if (
        !getTipFlight() &&
        !getEraseFlight() &&
        (!returnFrom || performance.now() - returnFrom.at >= 300)
      ) {
        place(pointer[0], pointer[1], !isExternalEraserActive() && inside && (!coarse || pressed));
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
    const syncState = () => {
      setManualEraser(isManualEraserActive());
      setAutoErasing(getEraseFlight() !== null);
    };
    const unsubscribe = subscribeTip(syncState);
    syncState();
    setPose(currentFlipDeg, 0);
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
  }, [coarse, reducedMotion]);

  if (typeof document === "undefined") return null;
  const showingEraser = manualEraser || autoErasing;
  const svgW = (VB_W * scale).toFixed(2);
  const svgH = (VB_H * scale).toFixed(2);
  const svgLeft = (VB_X * scale).toFixed(2);
  const svgTop = (VB_Y * scale).toFixed(2);

  return createPortal(
    <div
      ref={host}
      className="contract-pencil-cursor"
      data-visible="false"
      data-testid="contract-pencil-cursor"
      data-pencil-pose={showingEraser ? "hd-eraser" : "hd-tip"}
      data-tool={showingEraser ? "eraser" : "pencil"}
      aria-hidden="true"
      style={{ width: 1, height: 1, overflow: "visible" }}
    >
      <svg
        className="contract-pencil-cursor__svg"
        width={svgW}
        height={svgH}
        viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
        overflow="visible"
        aria-hidden="true"
        style={{
          left: `${svgLeft}px`,
          top: `${svgTop}px`,
          width: `${svgW}px`,
          height: `${svgH}px`,
        }}
      >
        <g
          ref={poseRef}
          className={
            showingEraser
              ? "contract-pencil-cursor__pencil workbook-pencil--eraser"
              : "contract-pencil-cursor__pencil"
          }
        >
          <g ref={flipRef} data-testid="contract-pencil-flip">
            <PencilShape
              uid={uid}
              stretch={CONTRACT_PENCIL_STRETCH}
              className={
                showingEraser
                  ? "workbook-pencil__shape workbook-pencil__eraser-hd"
                  : "workbook-pencil__shape"
              }
            />
          </g>
        </g>
      </svg>
    </div>,
    document.body,
  );
}

export const CONTRACT_CURSOR_TIMING = PENCIL_CONTRACT;
