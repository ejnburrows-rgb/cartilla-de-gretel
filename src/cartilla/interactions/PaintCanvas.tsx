import { Eraser, RotateCcw, Check, Paintbrush } from "lucide-react";
import { BOOK_PAINT_SWATCHES } from "@/lib/activity-canvas-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "@/styles/activity-mechanics.css";
import { usePaintCanvas, PaintCanvasProps, BrushSize, BRUSH_PX } from "./usePaintCanvas";

export function PaintCanvas({
  pageKey,
  illustrationSrc,
  illustrationAlt = "",
  verbLabel = "Colorea",
  lessonId,
  onComplete,
  className,
}: PaintCanvasProps) {
  const reducedMotion = useReducedMotion();

  const {
    paintRef,
    wrapRef,
    color,
    setColor,
    tool,
    setTool,
    brushSize,
    setBrushSize,
    hasPaint,
    done,
    confirmClear,
    setConfirmClear,
    hover,
    setHover,
    handlePointerDownWithAssist,
    handlePointerMove,
    handlePointerUp,
    clearLongPress,
    handleSwatchesKeyDown,
    undo,
    clearAll,
    finish,
    radiusPreview,
  } = usePaintCanvas({
    pageKey,
    illustrationSrc,
    verbLabel,
    lessonId,
    onComplete,
  });

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
            data-living-static="true"
            className="am-paint__base"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="am-paint__paper" aria-hidden="true" />
        )}
        <canvas
          data-gretel-target="primary"
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
          <div
            className="am-paint__swatches"
            role="listbox"
            aria-label="Colores"
            onKeyDown={handleSwatchesKeyDown}
          >
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
          <button type="button" className="am-paint__done" onClick={finish} disabled={!hasPaint}>
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
