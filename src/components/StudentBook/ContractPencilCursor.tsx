import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PENCIL_TIP_VIEWBOX, recordPointer, toolSize } from "@/lib/cursor-mode";
import { OwnerPhotoEraserSvg, OwnerPhotoPencilSvg } from "./OwnerPhotoPencilSvg";
import {
  contractEase,
  contractEraseAt,
  contractPointAlong,
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
 * Official `@image1` extreme close-up photographic sharpened wooden pencil
 * (`owner-pencil-tip.svg`, 600×497, matching `@image1` and Prototype B orientation):
 * - Point faces **up and to the left** with the very end of the dark graphite point at
 *   exact `(0, 0)` hotspot, visible wood fibers on the sharpening cone, and yellow-painted
 *   barrel extending **down and to the right** off the viewport edges with zero gap.
 * - When erasing, rotates smoothly onto the macro close-up pink eraser tip + brushed silver
 *   ferrule (`OwnerPhotoEraserSvg`) at the exact same `600×497` scale and `45°` down-right
 *   photographic yellow barrel extending off the viewport edges with zero gap.
 * - Purely visual: pointer events always reach the real controls.
 */
export function ContractPencilCursor() {
  const host = useRef<HTMLDivElement>(null);
  const tipImgRef = useRef<SVGSVGElement>(null);
  const tipShadowRef = useRef<SVGGElement>(null);
  const eraserImgRef = useRef<SVGSVGElement>(null);
  const eraserShadowRef = useRef<SVGGElement>(null);
  const [manualEraser, setManualEraser] = useState(isManualEraserActive);
  const [autoErasing, setAutoErasing] = useState(() => getEraseFlight() !== null);
  const coarse =
    typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;
  const reducedMotion =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const tipWidth = toolSize("tip");
  const tipHeight = Math.round(
    tipWidth * (PENCIL_TIP_VIEWBOX.height / PENCIL_TIP_VIEWBOX.width),
  );

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

    const setPose = (flipDeg: number, lift = 0, wristDeg = 0) => {
      currentFlipDeg = flipDeg;
      if (tipImgRef.current) {
        // Pivoting strictly around (0, 0) keeps the graphite point locked to the mark
        // coordinate with 0.00px offset when touched down (lift === 0), while lowering
        // naturally onto the page before each stroke (lift > 0).
        const liftX = lift * 6;
        const liftY = -lift * 16;
        const parts: string[] = [];
        if (lift > 0.001) parts.push(`translate3d(${liftX.toFixed(2)}px, ${liftY.toFixed(2)}px, 0)`);
        if (Math.abs(wristDeg) > 0.01) parts.push(`rotate(${wristDeg.toFixed(2)}deg)`);
        tipImgRef.current.style.transform = parts.length ? parts.join(" ") : "rotate(0deg)";
      }
      if (tipShadowRef.current) {
        const dx = 10 + lift * 22;
        const dy = 14 + lift * 28;
        tipShadowRef.current.setAttribute("transform", `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
        tipShadowRef.current.setAttribute("opacity", (0.24 - Math.min(0.1, lift * 0.1)).toFixed(3));
      }
      if (eraserImgRef.current) {
        const liftX = lift * 8;
        const liftY = -lift * 18;
        // Subtle wrist rotation during enter/lift (flipDeg approaching 180°), settling to 0° on touchdown
        const turnDelta = (180 - flipDeg) * 0.14;
        const parts: string[] = [];
        if (lift > 0.001) parts.push(`translate3d(${liftX.toFixed(2)}px, ${liftY.toFixed(2)}px, 0)`);
        const rot = wristDeg + turnDelta;
        if (Math.abs(rot) > 0.01) parts.push(`rotate(${rot.toFixed(2)}deg)`);
        eraserImgRef.current.style.transform = parts.length ? parts.join(" ") : "rotate(0deg)";
      }
      if (eraserShadowRef.current) {
        const dx = 10 + lift * 22;
        const dy = 14 + lift * 28;
        eraserShadowRef.current.setAttribute("transform", `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
        eraserShadowRef.current.setAttribute("opacity", (0.24 - Math.min(0.1, lift * 0.1)).toFixed(3));
      }
    };

    const place = (x: number, y: number, visible: boolean) => {
      const el = host.current;
      if (!el) return;
      // Very end of the graphite point (0, 0) sits at exact (x, y).
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
          setPose(pose.flipDeg, pose.lift, 0);
          returnFrom = { at: now, pt: target };
          place(target[0], target[1], true);
          return;
        }
      }
      if (activeEraseId !== null) {
        activeEraseId = null;
        eraseOrigin = null;
        if (!isManualEraserActive()) {
          manualFlip = null;
          setPose(0, 0, 0);
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
          let target: [number, number];
          let lift = 0;
          let wristDeg = 0;
          if (ms < first.begin) {
            const startPt = markToScreen(flight.el, flight.height, first.points[0]);
            if (activeTipId !== flight.id) {
              activeTipId = flight.id;
              tipOrigin =
                wasVisible && lastShown
                  ? lastShown
                  : pointer ?? [startPt[0] + 24, startPt[1] - 20];
            }
            const from = tipOrigin ?? startPt;
            const k = contractEase(ms / Math.max(1, first.begin));
            // Smoothly lower onto startPt: at k=1 (ms === first.begin), lift and wristDeg
            // settle to exact 0 so the very end of the graphite point touches startPt with 0px offset.
            target = [
              from[0] + (startPt[0] - from[0]) * k,
              from[1] + (startPt[1] - from[1]) * k,
            ];
            lift = (1 - k) * 0.45;
            wristDeg = (1 - k) * 2.6;
          } else if (ms <= lastEnd) {
            activeTipId = flight.id;
            let activeStroke = null;
            for (let i = 0; i < flight.strokes.length; i++) {
              const s = flight.strokes[i];
              if (ms >= s.begin && ms <= s.begin + s.dur) {
                activeStroke = s;
                break;
              }
            }
            if (activeStroke) {
              const p = contractEase((ms - activeStroke.begin) / Math.max(1, activeStroke.dur));
              const pt = contractPointAlong(activeStroke.points, p);
              target = markToScreen(flight.el, flight.height, pt);
              lift = 0;
              wristDeg = Math.sin(p * Math.PI * 2) * 1.35;
            } else {
              // Hand-guided hop between diagonal strokes of an X
              const tip = contractTipAt(flight.strokes, ms);
              target = markToScreen(flight.el, flight.height, tip ?? first.points[0]);
              for (let i = 1; i < flight.strokes.length; i++) {
                const prev = flight.strokes[i - 1];
                const curr = flight.strokes[i];
                const hopStart = prev.begin + prev.dur;
                if (ms > hopStart && ms < curr.begin) {
                  const hk = contractEase((ms - hopStart) / Math.max(1, curr.begin - hopStart));
                  const arc = Math.sin(Math.PI * hk);
                  lift = arc * 0.35;
                  wristDeg = arc * 2.2;
                  break;
                }
              }
            }
          } else {
            // Poised hold after stroke completion (400ms hold / 600ms red show before erase)
            activeTipId = flight.id;
            const endPt = markToScreen(
              flight.el,
              flight.height,
              last.points[last.points.length - 1],
            );
            const k = contractEase((ms - lastEnd) / 180);
            target = [endPt[0] + 10 * k, endPt[1] - 10 * k];
            lift = 0.35 * k;
            wristDeg = 1.6 * k;
          }
          setPose(0, lift, wristDeg);
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
        setPose(deg, lift, 0);
        if (k >= 1) manualFlip = null;
      } else {
        setPose(currentFlipDeg, 0, 0);
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
    setPose(currentFlipDeg, 0, 0);
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

  return createPortal(
    <div
      ref={host}
      className="contract-pencil-cursor"
      data-visible="false"
      data-testid="contract-pencil-cursor"
      data-pencil-pose={showingEraser ? "hd-eraser" : "hd-tip"}
      data-tool={showingEraser ? "eraser" : "pencil"}
      aria-hidden="true"
      style={{
        width: tipWidth,
        height: tipHeight,
        overflow: "visible",
      }}
    >
      <OwnerPhotoPencilSvg
        ref={tipImgRef}
        shadowRef={tipShadowRef}
        width={tipWidth}
        height={tipHeight}
        testId="contract-pencil-photo-tip"
        style={{
          display: showingEraser ? "none" : "block",
          width: `${tipWidth}px`,
          height: `${tipHeight}px`,
          transformOrigin: "0px 0px",
        }}
      />
      <OwnerPhotoEraserSvg
        ref={eraserImgRef}
        shadowRef={eraserShadowRef}
        width={tipWidth}
        height={tipHeight}
        testId="contract-pencil-flip"
        className="contract-pencil-cursor__img contract-pencil-cursor__svg workbook-pencil__shape workbook-pencil__eraser-hd workbook-pencil--eraser"
        style={{
          display: showingEraser ? "block" : "none",
          width: `${tipWidth}px`,
          height: `${tipHeight}px`,
          transformOrigin: "0px 0px",
        }}
      />
    </div>,
    document.body,
  );
}

export const CONTRACT_CURSOR_TIMING = PENCIL_CONTRACT;
