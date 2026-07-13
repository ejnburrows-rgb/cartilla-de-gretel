/**
 * PaintCanvas — professional freehand brush for "Colorea".
 * Real continuous strokes with soft round brush, high-DPI canvas, optional
 * alpha mask from the activity illustration, eraser, undo, clear confirm,
 * and local persistence. Not click-to-flood-fill (flood-fill is optional assist only).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, RotateCcw, Check, Paintbrush } from "lucide-react";
import {
  BOOK_PAINT_SWATCHES,
  clearCanvasSnapshot,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
} from "@/lib/activity-canvas-store";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "@/styles/activity-mechanics.css";

export type BrushSize = "fine" | "normal" | "thick";

const BRUSH_PX: Record<BrushSize, number> = {
  fine: 12,
  normal: 22,
  thick: 32,
};

export interface PaintCanvasProps {
  /** Unique key for local progress (lesson+page+region). */
  pageKey: string;
  /** Base illustration under the paint layer (line art / color crop). */
  illustrationSrc?: string;
  /** Alt text for the illustration. */
  illustrationAlt?: string;
  /** Printed verb kept honest — usually "Colorea". */
  verbLabel?: string;
  lessonId?: string;
  onComplete?: () => void;
  className?: string;
}

type Tool = "brush" | "eraser";

function stampBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  erase: boolean,
) {
  ctx.save();
  if (erase) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
  }
  // Soft round brush: layered radial falloff (not hard square stamps)
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  if (erase) {
    g.addColorStop(0, "rgba(0,0,0,0.85)");
    g.addColorStop(0.55, "rgba(0,0,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
  } else {
    // Parse hex → rgb for soft alpha edge
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const gC = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    g.addColorStop(0, `rgba(${r},${gC},${b},0.92)`);
    g.addColorStop(0.45, `rgba(${r},${gC},${b},0.55)`);
    g.addColorStop(1, `rgba(${r},${gC},${b},0)`);
    ctx.fillStyle = g;
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function strokeBetween(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  color: string,
  erase: boolean,
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const step = Math.max(1, radius * 0.28);
  const n = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    stampBrush(ctx, x0 + dx * t, y0 + dy * t, radius, color, erase);
  }
}

export function PaintCanvas({
  pageKey,
  illustrationSrc,
  illustrationAlt = "",
  verbLabel = "Colorea",
  lessonId,
  onComplete,
  className,
}: PaintCanvasProps) {
  const paintRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const pendingMoveRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const paintPixelsRef = useRef(0);

  const [color, setColor] = useState<string>(BOOK_PAINT_SWATCHES[0]);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState<BrushSize>("normal");
  const [hasPaint, setHasPaint] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const reducedMotion = useReducedMotion();

  const resizeCanvases = useCallback(() => {
    const canvas = paintRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const prev = canvas.toDataURL("image/png");
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Restore previous paint after resize
    if (prev && prev.length > 100) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = prev;
    }

    // Build / rebuild mask from illustration alpha (drawable where opaque)
    if (illustrationSrc) {
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const mctx = mask.getContext("2d");
      if (mctx) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          mctx.clearRect(0, 0, w, h);
          // Fit contain
          const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          const ox = (w - dw) / 2;
          const oy = (h - dh) / 2;
          mctx.drawImage(img, ox, oy, dw, dh);
          maskRef.current = mask;
        };
        img.onerror = () => {
          // Safe drawable bounds: full illustration box (never past wrap)
          mctx.fillStyle = "#000";
          mctx.fillRect(0, 0, w, h);
          maskRef.current = mask;
        };
        img.src = illustrationSrc;
      }
    } else {
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const mctx = mask.getContext("2d");
      if (mctx) {
        mctx.fillStyle = "#000";
        mctx.fillRect(8, 8, w - 16, h - 16);
        maskRef.current = mask;
      }
    }
  }, [illustrationSrc]);

  useEffect(() => {
    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
    return () => window.removeEventListener("resize", resizeCanvases);
  }, [resizeCanvases]);

  // Restore saved paint
  useEffect(() => {
    const snap = loadCanvasSnapshot(pageKey);
    if (!snap?.dataUrl) return;
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHasPaint(true);
      paintPixelsRef.current = 1;
    };
    img.src = snap.dataUrl;
  }, [pageKey]);

  const getPoint = (e: React.PointerEvent) => {
    const canvas = paintRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const isMaskedOk = (x: number, y: number) => {
    const mask = maskRef.current;
    if (!mask) return true;
    const mctx = mask.getContext("2d");
    if (!mctx) return true;
    const px = Math.max(0, Math.min(mask.width - 1, Math.floor(x)));
    const py = Math.max(0, Math.min(mask.height - 1, Math.floor(y)));
    const a = mctx.getImageData(px, py, 1, 1).data[3];
    return a > 12;
  };

  const pushUndo = () => {
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStackRef.current.push(data);
      if (undoStackRef.current.length > 12) undoStackRef.current.shift();
    } catch {
      /* tainted canvas */
    }
  };

  const flushStroke = useCallback(() => {
    rafRef.current = null;
    const next = pendingMoveRef.current;
    const last = lastRef.current;
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!next || !last || !ctx || !drawingRef.current) return;
    pendingMoveRef.current = null;

    const radius = BRUSH_PX[brushSize] / 2;
    // Sample along path; only stamp where mask allows (stay inside lines)
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(1, radius * 0.28);
    const n = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = last.x + dx * t;
      const y = last.y + dy * t;
      if (tool === "eraser" || isMaskedOk(x, y)) {
        stampBrush(ctx, x, y, radius, color, tool === "eraser");
        paintPixelsRef.current += 1;
      }
    }
    lastRef.current = next;
    if (!hasPaint && paintPixelsRef.current > 0) setHasPaint(true);
  }, [brushSize, color, tool, hasPaint]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (done) return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* jsdom */
    }
    drawingRef.current = true;
    pushUndo();
    const p = getPoint(e);
    lastRef.current = p;
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const radius = BRUSH_PX[brushSize] / 2;
    if (tool === "eraser" || isMaskedOk(p.x, p.y)) {
      stampBrush(ctx, p.x, p.y, radius, color, tool === "eraser");
      paintPixelsRef.current += 1;
      setHasPaint(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = getPoint(e);
    setHover(p);
    if (!drawingRef.current || done) return;
    pendingMoveRef.current = p;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(flushStroke);
    }
  };

  const persist = () => {
    const canvas = paintRef.current;
    if (!canvas) return;
    try {
      saveCanvasSnapshot(pageKey, canvas.toDataURL("image/png"));
    } catch {
      /* ignore */
    }
  };

  const handlePointerUp = () => {
    if (drawingRef.current) persist();
    drawingRef.current = false;
    lastRef.current = null;
    pendingMoveRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const undo = () => {
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    const snap = undoStackRef.current.pop();
    if (!canvas || !ctx || !snap) return;
    ctx.putImageData(snap, 0, 0);
    persist();
  };

  const clearAll = () => {
    const canvas = paintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    pushUndo();
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    clearCanvasSnapshot(pageKey);
    paintPixelsRef.current = 0;
    setHasPaint(false);
    setConfirmClear(false);
  };

  const finish = () => {
    if (!hasPaint || done) return;
    setDone(true);
    persist();
    gretelEvent("answer:correct");
    gretelEvent("activity:complete");
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: 1,
        total: 1,
        meta: { exercise: `paint_${pageKey}`, completed: true, verb: verbLabel },
      });
    }
    onComplete?.();
  };

  // Long-press flood-fill assist (secondary, not a replacement for brush)
  const longPressTimer = useRef<number | null>(null);
  const handlePointerDownWithAssist = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerDown(e);
    if (tool !== "brush" || done) return;
    const start = getPoint(e);
    longPressTimer.current = window.setTimeout(() => {
      if (!drawingRef.current) return;
      floodFillRegion(start.x, start.y, color);
      setHasPaint(true);
      persist();
    }, 650);
  };
  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const floodFillRegion = (sx: number, sy: number, fillColor: string) => {
    const canvas = paintRef.current;
    const mask = maskRef.current;
    if (!canvas || !mask) return;
    const ctx = canvas.getContext("2d");
    const mctx = mask.getContext("2d");
    if (!ctx || !mctx) return;
    const w = mask.width;
    const h = mask.height;
    const maskData = mctx.getImageData(0, 0, w, h).data;
    const paint = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Work in CSS pixel space vs backing store
    const dpr = canvas.width / w;
    const hex = fillColor.replace("#", "");
    const fr = parseInt(hex.slice(0, 2), 16);
    const fg = parseInt(hex.slice(2, 4), 16);
    const fb = parseInt(hex.slice(4, 6), 16);
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
    if (maskData[(y0 * w + x0) * 4 + 3] <= 12) return;
    const seen = new Uint8Array(w * h);
    const stack = [x0, y0];
    pushUndo();
    while (stack.length) {
      const y = stack.pop()!;
      const x = stack.pop()!;
      const idx = y * w + x;
      if (x < 0 || y < 0 || x >= w || y >= h || seen[idx]) continue;
      if (maskData[idx * 4 + 3] <= 12) continue;
      seen[idx] = 1;
      // Write into paint backing store
      const px = Math.floor(x * dpr);
      const py = Math.floor(y * dpr);
      for (let oy = 0; oy < dpr; oy++) {
        for (let ox = 0; ox < dpr; ox++) {
          const pi = ((py + oy) * canvas.width + (px + ox)) * 4;
          paint.data[pi] = fr;
          paint.data[pi + 1] = fg;
          paint.data[pi + 2] = fb;
          paint.data[pi + 3] = 180;
        }
      }
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
    }
    ctx.putImageData(paint, 0, 0);
  };

  const radiusPreview = BRUSH_PX[brushSize];

  return (
    <div
      className={`am-paint${className ? ` ${className}` : ""}${done ? " is-done" : ""}`}
      data-verb={verbLabel}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <div className="am-paint__label" aria-hidden="true">
        <Paintbrush className="am-paint__label-icon" aria-hidden />
        <span>{verbLabel}</span>
      </div>
      <div className="am-paint__stage" ref={wrapRef}>
        {illustrationSrc ? (
          <img
            src={illustrationSrc}
            alt={illustrationAlt}
            className="am-paint__base"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="am-paint__paper" aria-hidden="true" />
        )}
        <canvas
          ref={paintRef}
          className="am-paint__layer"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            handlePointerDownWithAssist(e);
          }}
          onPointerMove={(e) => {
            clearLongPress();
            handlePointerMove(e);
          }}
          onPointerUp={() => {
            clearLongPress();
            handlePointerUp();
          }}
          onPointerCancel={() => {
            clearLongPress();
            handlePointerUp();
          }}
          onPointerLeave={() => {
            clearLongPress();
            handlePointerUp();
            setHover(null);
          }}
          aria-label={`${verbLabel}: pinta con el pincel`}
        />
        {hover && !done && tool === "brush" && (
          <span
            className="am-paint__cursor"
            style={{
              left: hover.x,
              top: hover.y,
              width: radiusPreview,
              height: radiusPreview,
              background: color,
            }}
            aria-hidden
          />
        )}
      </div>

      {!done && (
        <div className="am-paint__toolbar">
          <div className="am-paint__swatches" role="listbox" aria-label="Colores">
            {BOOK_PAINT_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={color === c && tool === "brush"}
                className={`am-paint__swatch${color === c && tool === "brush" ? " is-active" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c);
                  setTool("brush");
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <div className="am-paint__sizes">
            {(["fine", "normal", "thick"] as BrushSize[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`am-paint__size${brushSize === s ? " is-active" : ""}`}
                onClick={() => setBrushSize(s)}
                aria-label={s === "fine" ? "Fino" : s === "normal" ? "Normal" : "Grueso"}
              >
                <span style={{ width: BRUSH_PX[s] * 0.45, height: BRUSH_PX[s] * 0.45 }} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`am-paint__tool${tool === "eraser" ? " is-active" : ""}`}
            onClick={() => setTool((t) => (t === "eraser" ? "brush" : "eraser"))}
            aria-label="Borrador"
            aria-pressed={tool === "eraser"}
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button type="button" className="am-paint__tool" onClick={undo} aria-label="Deshacer">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="am-paint__tool"
            onClick={() => setConfirmClear(true)}
            aria-label="Borrar todo"
          >
            Limpiar
          </button>
          <button
            type="button"
            className="am-paint__done"
            onClick={finish}
            disabled={!hasPaint}
          >
            <Check className="w-4 h-4" /> Listo
          </button>
        </div>
      )}

      {done && (
        <p className="am-paint__success" role="status">
          ¡Qué bonito quedó el color!
        </p>
      )}

      {confirmClear && (
        <div className="am-paint__confirm" role="dialog" aria-modal="true" aria-label="Confirmar">
          <p>¿Borrar todo el color?</p>
          <div className="am-paint__confirm-actions">
            <button type="button" onClick={() => setConfirmClear(false)}>
              No
            </button>
            <button type="button" className="am-paint__confirm-yes" onClick={clearAll}>
              Sí, borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// silence unused import if tree-shaken oddly
void strokeBetween;
