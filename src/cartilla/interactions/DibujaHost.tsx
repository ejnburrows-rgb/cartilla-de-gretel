/**
 * DibujaHost — honest "Dibuja" dual mode:
 * - Touch / coarse pointer default: freehand draw canvas
 * - Fine pointer (mouse) default: pick-the-correct-picture
 * - Toggle always available both ways
 */
import { useCanvasContinuity } from "@/lib/use-canvas-continuity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Eraser, Pencil, Images, RotateCcw } from "lucide-react";
import {
  BOOK_DRAW_SWATCHES,
  clearCanvasSnapshot,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
} from "@/lib/activity-canvas-store";
import { defaultDibujaMode, type InputModeDefault } from "@/lib/pointer-policy";
import { useActivityEvents, useActivityState } from "@/lib/activity-events";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import "@/styles/activity-mechanics.css";

export type DibujaPickOption = {
  id: string;
  caption: string;
  illustrationSrc?: string;
  correct: boolean;
};

export interface DibujaHostProps {
  pageKey: string;
  /** Hint from the printed page (e.g. "Haz un dibujo que represente..."). */
  hint?: string;
  lessonId?: string;
  /** 3–4 lesson-relevant pick options (in-repo art only). */
  pickOptions?: DibujaPickOption[];
  /** Force initial mode (tests). When omitted, uses pointer policy. */
  initialMode?: InputModeDefault;
  onComplete?: () => void;
  className?: string;
  verb?: "Dibuja" | "Escribe";
}

const MIN_STROKE_POINTS = 12;

export function DibujaHost({
  pageKey,
  hint,
  lessonId,
  pickOptions = [],
  initialMode,
  onComplete,
  className,
  verb = "Dibuja",
}: DibujaHostProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const [mode, setMode] = useActivityState<InputModeDefault>("drawingMode", initialMode ?? defaultDibujaMode());
  const reducedMotion = useReducedMotion();

  // ── Draw mode state ──────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const pointsRef = useRef(0);
  const undoStackRef = useRef<ImageData[]>([]);
  const [color, setColor] = useActivityState<string>("drawColor", BOOK_DRAW_SWATCHES[0]);
  const [erasing, setErasing] = useActivityState("drawErasing", false);
  const [strokePoints, setStrokePoints] = useActivityState("drawPoints", 0);
  useCanvasContinuity(canvasRef, drawingRef, `dibuja:${pageKey}`, () => setStrokePoints(pointsRef.current));
  const [drawDone, setDrawDone] = useActivityState("drawDone", false);
  const hasStroke = strokePoints >= 3;
  const canFinishDraw = strokePoints >= MIN_STROKE_POINTS;

  // ── Pick mode state ──────────────────────────────────────────────
  const [pickedId, setPickedId] = useActivityState<string>("pickedId", "");
  const [pickGrade, setPickGrade] = useState<"correct" | "wrong" | null>(null);
  const [pickDone, setPickDone] = useActivityState("pickDone", false);
  const wrongTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(wrongTimer.current), []);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const usablePicks = useMemo(() => {
    const withArt = pickOptions.filter((o) => o.illustrationSrc || o.caption);
    if (withArt.length >= 2) return withArt.slice(0, 4);
    return withArt;
  }, [pickOptions]);

  useEffect(() => { if (drawDone || pickDone) gretelEvent("activity:complete", { restored: true }); }, [drawDone, pickDone, gretelEvent]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = { width: parent.clientWidth, height: parent.clientHeight };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width === width && canvas.height === height) return;
    const prev = document.createElement("canvas");
    prev.width = canvas.width;
    prev.height = canvas.height;
    prev.getContext("2d")?.drawImage(canvas, 0, 0);
    canvas.width = width;
    canvas.height = height;
    // Keep the bitmap sharp at the current rendered size, but leave CSS sizing
    // responsive so a desktop measurement never freezes the canvas wider than
    // its container on mobile.
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    if (prev.width && prev.height) ctx.drawImage(prev, 0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (mode !== "draw") return;
    resize();
    window.addEventListener("resize", resize);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    if (canvasRef.current?.parentElement) observer?.observe(canvasRef.current.parentElement);
    return () => { observer?.disconnect(); window.removeEventListener("resize", resize); };
  }, [mode, resize]);

  useEffect(() => {
    if (mode !== "draw") return;
    const snap = loadCanvasSnapshot(`dibuja:${pageKey}`);
    if (!snap?.dataUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = new Image();
    let disposed = false;
    img.onload = () => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      pointsRef.current = strokePoints;
    };
    img.src = snap.dataUrl;
    return () => { disposed = true; img.onload = null; };
  }, [pageKey, mode]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pushUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    try {
      undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (undoStackRef.current.length > 12) undoStackRef.current.shift();
    } catch {
      /* ignore */
    }
  };

  const persistDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      saveCanvasSnapshot(`dibuja:${pageKey}`, canvas.toDataURL("image/png"));
    } catch {
      /* ignore */
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawDone) return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* jsdom */
    }
    drawingRef.current = true;
    pushUndo();
    lastRef.current = getPoint(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || drawDone) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const last = lastRef.current;
    const next = getPoint(e);
    if (!ctx || !last) return;
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = erasing ? 16 : 5.5;
    // Slight crayon texture via multi-pass soft stroke
    ctx.globalAlpha = erasing ? 1 : 0.88;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    if (!erasing) {
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    lastRef.current = next;
    pointsRef.current += 1;
    // Throttle React updates so we re-enable Listo without thrashing every move
    if (
      pointsRef.current === 3 ||
      pointsRef.current === MIN_STROKE_POINTS ||
      pointsRef.current % 8 === 0
    ) {
      setStrokePoints(pointsRef.current);
    }
  };

  const onPointerUp = () => {
    if (drawingRef.current) { setStrokePoints(pointsRef.current); persistDraw(); }
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clearDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    pushUndo();
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    clearCanvasSnapshot(`dibuja:${pageKey}`);
    setDrawDone(false);
    gretelEvent("activity:retry", { reason: "work-cleared" });
    pointsRef.current = 0;
    setStrokePoints(0);
  };

  const undoDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const snap = undoStackRef.current.pop();
    if (!canvas || !ctx || !snap) return;
    ctx.putImageData(snap, 0, 0);
    persistDraw();
  };

  const finishDraw = () => {
    if (!canFinishDraw || drawDone) return;
    setDrawDone(true);
    persistDraw();
    playCorrectChord();
    gretelEvent("activity:complete");
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: 0,
        total: 0,
        meta: { exercise: `dibuja_draw_${pageKey}`, completed: true, grading: "ungraded", mode: "draw" },
      });
    }
    onComplete?.();
  };

  const onPick = (opt: DibujaPickOption) => {
    if (pickDone) return;
    window.clearTimeout(wrongTimer.current);
    setShakeId(null);
    setPickedId(opt.id);
    if (opt.correct) {
      setPickGrade("correct");
      setPickDone(true);
      playCorrectChord();
      gretelEvent("answer:correct");
      gretelEvent("activity:complete");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: 1,
          meta: {
            exercise: `dibuja_pick_${pageKey}`,
            completed: true,
            mode: "pick",
            choice: opt.id,
          },
        });
      }
      onComplete?.();
    } else {
      setPickGrade("wrong");
      setShakeId(opt.id);
      playWrongBuzz();
      gretelEvent("answer:wrong");
      wrongTimer.current = window.setTimeout(
        () => {
          setShakeId(null);
          setPickGrade(null);
          setPickedId("");
        },
        reducedMotion ? 200 : 480,
      );
    }
  };

  const done = mode === "draw" ? drawDone : pickDone;

  return (
    <div
      className={`am-dibuja${className ? ` ${className}` : ""}${done ? " is-done" : ""}`}
      data-mode={mode}
      data-verb={verb}
    >
      <div className="am-dibuja__header">
        <span className="am-dibuja__verb">{verb}</span>
        {hint ? <span className="am-dibuja__hint">{hint}</span> : null}
      </div>

      {usablePicks.length >= 2 && <div className="am-dibuja__toggle" role="group" aria-label="Modo de dibujo">
        <button
          type="button"
          className={mode === "draw" ? "is-active" : ""}
          onClick={() => setMode("draw")}
          aria-pressed={mode === "draw"}
        >
          <Pencil className="w-4 h-4" /> Dibujar
        </button>
        <button
          type="button"
          className={mode === "pick" ? "is-active" : ""}
          onClick={() => setMode("pick")}
          aria-pressed={mode === "pick"}
          disabled={usablePicks.length < 2}
          title={
            usablePicks.length < 2 ? "Aún no hay dibujos para elegir en esta página" : undefined
          }
        >
          <Images className="w-4 h-4" /> Elegir el dibujo
        </button>
      </div>}

      {mode === "draw" ? (
        <div className="am-dibuja__draw">
          <div className="am-dibuja__paper">
            <canvas
              data-gretel-target="primary"
              ref={canvasRef}
              className="am-dibuja__canvas"
              style={{ touchAction: "none" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
              aria-label={verb === "Escribe" ? "Área para escribir" : "Área para dibujar"}
            />
          </div>
          {!drawDone && (
            <div className="am-dibuja__toolbar">
              <div className="am-dibuja__swatches">
                {BOOK_DRAW_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`am-dibuja__swatch${color === c && !erasing ? " is-active" : ""}`}
                    style={{ background: c }}
                    onClick={() => {
                      setColor(c);
                      setErasing(false);
                    }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className={`am-dibuja__tool${erasing ? " is-active" : ""}`}
                onClick={() => setErasing((e) => !e)}
                aria-label="Borrador"
                aria-pressed={erasing}
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="am-dibuja__tool"
                onClick={undoDraw}
                aria-label="Deshacer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="am-dibuja__tool"
                onClick={clearDraw}
                aria-label="Limpiar"
              >
                Limpiar
              </button>
              <button
                type="button"
                className="am-dibuja__done"
                onClick={finishDraw}
                disabled={!canFinishDraw}
              >
                <Check className="w-4 h-4" /> Listo
              </button>
            </div>
          )}
          {drawDone && (
            <p className="am-dibuja__success" role="status">
              ¡Qué lindo dibujo!
            </p>
          )}
        </div>
      ) : (
        <div className="am-dibuja__pick" role="listbox" aria-label="Elige el dibujo correcto">
          {usablePicks.length < 2 ? (
            <p className="am-dibuja__pick-empty">Usa el modo Dibujar para esta página.</p>
          ) : (
            usablePicks.map((opt) => {
              const selected = pickedId === opt.id;
              const classes = [
                "am-dibuja__card",
                selected && (pickGrade === "correct" || pickDone) ? "is-correct" : "",
                shakeId === opt.id ? "is-shake" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={classes}
                  disabled={pickDone}
                  onClick={() => onPick(opt)}
                >
                  {opt.illustrationSrc ? (
                    <LivingIllustration
                      src={opt.illustrationSrc}
                      alt={opt.caption}
                      loading="lazy"
                    />
                  ) : (
                    <span className="am-dibuja__card-word">{opt.caption}</span>
                  )}
                  <span className="am-dibuja__card-caption">{opt.caption}</span>
                </button>
              );
            })
          )}
          {pickGrade === "wrong" && (
            <p className="am-dibuja__retry" role="status">
              Inténtalo de nuevo
            </p>
          )}
          {pickDone && (
            <p className="am-dibuja__success" role="status">
              ¡Buen trabajo!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
