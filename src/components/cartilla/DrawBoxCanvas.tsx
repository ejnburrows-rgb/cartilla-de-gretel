// DrawBoxCanvas.tsx — the interactive replacement for a static `draw-box`
// region ("Haz un dibujo que represente..."). The paper action is free
// drawing with crayons; the closest faithful tap/drag equivalent is real
// freehand drawing captured on a canvas with a small crayon-color picker,
// not a fabricated multiple-choice stand-in. There is no "correct" drawing,
// so completion (not correctness) is what's recorded — matching what a
// teacher could actually observe on paper: did the child do the activity.
// Reports through the same pipeline as the other interactive exercises
// (recordEvent + gretelEvent); student workbook only.
import { useRef, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useActivityEvents } from "@/lib/activity-events";


const CRAYON_COLORS = ["#1f2937", "#dc2626", "#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

interface DrawBoxCanvasProps {
  regionId: string;
  hint?: string;
  lessonId?: string;
}

export function DrawBoxCanvas({ regionId, hint, lessonId }: DrawBoxCanvasProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(CRAYON_COLORS[0]);
  const [hasStroke, setHasStroke] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || done) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const last = lastPointRef.current;
    const next = getPoint(e);
    if (!ctx || !last) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    lastPointRef.current = next;
    if (!hasStrokeRef.current) {
      hasStrokeRef.current = true;
      setHasStroke(true);
    }
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    setHasStroke(false);
  };

  const finish = () => {
    if (!hasStroke || done) return;
    setDone(true);
    gretelEvent("activity:complete");
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: 0,
        total: 0,
        meta: { exercise: `draw_box_${regionId}`, completed: true, grading: "ungraded" },
      });
    }
  };

  return (
    <div className="fp-draw-box fp-draw-box--interactive">
      {hint ? <span className="fp-draw-box__hint">{hint}</span> : null}
      <canvas
        data-gretel-target="primary"
        ref={canvasRef}
        className="fp-draw-box__canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="fp-draw-box__toolbar" aria-hidden={done}>
        {!done && (
          <>
            <div className="fp-draw-box__colors">
              {CRAYON_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className="fp-draw-box__color-swatch"
                  style={{
                    background: c,
                    outline: color === c ? "2px solid var(--book-teal)" : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={clearCanvas}
              className="fp-draw-box__btn fp-draw-box__btn--eraser"
              aria-label="Borrar"
              title="Borrar con goma"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block" aria-hidden="true">
                <path d="M4 15 L14 5 L20 11 L10 21 L4 21 Z" fill="#f498a9" stroke="#d9768c" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M10 9 L16 15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                <path d="M7 18 L10 21 L21 21" fill="none" stroke="#6c737b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={!hasStroke}
              className="fp-draw-box__btn fp-draw-box__btn--done"
            >
              <Check className="w-4 h-4" /> Listo
            </button>
          </>
        )}
        {done && <span className="fp-draw-box__done">¡Listo!</span>}
      </div>
    </div>
  );
}
