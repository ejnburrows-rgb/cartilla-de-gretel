import { learnerStorageKey } from "@/lib/learner-storage";
import { useEffect, useRef, useState, useCallback } from "react";
import { useActivityEvents } from "@/lib/activity-events";
import { Check, Keyboard, Pencil, Eraser, RotateCcw } from "lucide-react";
import {
  BOOK_DRAW_SWATCHES,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
  clearCanvasSnapshot,
} from "@/lib/activity-canvas-store";
import { playCorrectChord } from "@/lib/piano-audio";

/** Enough writing to count the page's open-ended task as done (no grading). */
export function isWritingResponseDone(value: string): boolean {
  return value.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 2;
}

export interface WorkbookWritingResponseProps {
  pageNumber: number;
  interactive: boolean;
  prompt?: string;
}

/** Open-ended writing stays open-ended; no guessed grading or answer key. */
export function WorkbookWritingResponse({ pageNumber, interactive, prompt }: WorkbookWritingResponseProps) {
  const { emit: gretelEvent } = useActivityEvents();
  const storagePrefix = `cartilla-writing-page-${pageNumber}`;
  const keyTyped = learnerStorageKey(`${storagePrefix}-typed`);
  const keyMode = learnerStorageKey(`${storagePrefix}-mode`);
  const keyDone = learnerStorageKey(`${storagePrefix}-done`);
  const canvasKey = `writing:${pageNumber}`;

  // Mode state: default "typed" (desktop default) vs "freehand"
  const [mode, setMode] = useState<"typed" | "freehand">(() => {
    try {
      return (window.localStorage.getItem(keyMode) as "typed" | "freehand") || "typed";
    } catch {
      return "typed";
    }
  });

  // Typed text state
  const [value, setValue] = useState(() => {
    try {
      return window.localStorage.getItem(keyTyped) ?? window.localStorage.getItem(learnerStorageKey(`cartilla-writing-page-${pageNumber}`)) ?? "";
    } catch {
      return "";
    }
  });

  // Completion state
  const [completed, setCompleted] = useState(() => {
    try {
      return window.localStorage.getItem(keyDone) === "true" || isWritingResponseDone(value);
    } catch {
      return isWritingResponseDone(value);
    }
  });

  // Freehand Canvas Ref & tools
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState<string>(BOOK_DRAW_SWATCHES[0]);
  const [erasing, setErasing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const reported = useRef(completed);

  // Sync mode changes to storage
  const handleSetMode = (nextMode: "typed" | "freehand") => {
    setMode(nextMode);
    try {
      window.localStorage.setItem(keyMode, nextMode);
    } catch {
      /* ignore */
    }
  };

  // Report completion on restore if already done
  useEffect(() => {
    if (interactive && completed) {
      reported.current = true;
      gretelEvent("activity:complete", { restored: true });
    }
  }, [interactive, completed, gretelEvent]);

  // Load freehand snapshot on mount or mode switch
  useEffect(() => {
    if (!interactive || mode !== "freehand") return;
    const snap = loadCanvasSnapshot(canvasKey);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (snap?.dataUrl) {
      const img = new Image();
      img.onload = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        setHasDrawn(true);
      };
      img.src = snap.dataUrl;
    }
  }, [interactive, mode, canvasKey]);

  // Resize canvas responsively
  const resizeCanvas = useCallback(() => {
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
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (prev.width && prev.height) {
      ctx.drawImage(prev, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    if (mode !== "freehand") return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [mode, resizeCanvas]);

  // Freehand drawing handlers
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const persistCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      saveCanvasSnapshot(canvasKey, canvas.toDataURL("image/png"));
    } catch {
      /* ignore */
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* jsdom */
    }
    drawingRef.current = true;
    lastRef.current = getPoint(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const last = lastRef.current;
    const next = getPoint(e);
    if (!ctx || !last) return;

    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = erasing ? 16 : 4;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();

    lastRef.current = next;
    if (!hasDrawn) setHasDrawn(true);
  };

  const onPointerUp = () => {
    if (drawingRef.current) persistCanvas();
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clearFreehand = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    clearCanvasSnapshot(canvasKey);
    setHasDrawn(false);
  };

  // Complete activity explicitly or automatically
  const markComplete = () => {
    if (!reported.current) {
      reported.current = true;
      setCompleted(true);
      playCorrectChord();
      gretelEvent("activity:complete");
      try {
        window.localStorage.setItem(keyDone, "true");
      } catch {
        /* ignore */
      }
    }
  };

  const handleTextChange = (text: string) => {
    setValue(text);
    const isDone = isWritingResponseDone(text);
    if (!reported.current && isDone) {
      reported.current = true;
      setCompleted(true);
      gretelEvent("activity:complete");
      try {
        window.localStorage.setItem(keyDone, "true");
      } catch {
        /* ignore */
      }
    } else if (reported.current && !isDone && !hasDrawn) {
      reported.current = false;
      setCompleted(false);
      gretelEvent("activity:retry", { reason: "work-cleared" });
      try {
        window.localStorage.removeItem(keyDone);
      } catch {
        /* ignore */
      }
    }

    try {
      window.localStorage.setItem(keyTyped, text);
      window.localStorage.setItem(learnerStorageKey(`cartilla-writing-page-${pageNumber}`), text);
    } catch {
      window.dispatchEvent(new Event("cartilla:work-save-failed"));
    }
  };

  if (!interactive) {
    return (
      <div className="fp-writing-response__lines" aria-label="Renglones para escribir">
        <span className="fp-writing-line__rule" />
        <span className="fp-writing-line__rule" />
        <span className="fp-writing-line__rule" />
      </div>
    );
  }

  return (
    <div className="fp-writing-response" data-mode={mode}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-bold text-teal-800 text-base">{prompt ?? "Mis oraciones"}</span>

        {/* Mode Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-xl bg-teal-50/80 p-1 border border-teal-200/60"
            role="group"
            aria-label="Modo de escritura"
          >
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "typed"
                  ? "bg-white text-teal-900 shadow-sm border border-teal-200"
                  : "text-teal-700 hover:text-teal-900"
              }`}
              onClick={() => handleSetMode("typed")}
              aria-pressed={mode === "typed"}
            >
              <Keyboard className="w-3.5 h-3.5" /> Teclado
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "freehand"
                  ? "bg-white text-teal-900 shadow-sm border border-teal-200"
                  : "text-teal-700 hover:text-teal-900"
              }`}
              onClick={() => handleSetMode("freehand")}
              aria-pressed={mode === "freehand"}
            >
              <Pencil className="w-3.5 h-3.5" /> Mano alzada
            </button>
          </div>

          <button
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border shadow-sm ${
              completed
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-teal-700 text-white border-teal-800 hover:bg-teal-800 active:scale-95"
            }`}
            onClick={markComplete}
          >
            <Check className="w-4 h-4" /> {completed ? "Completado" : "Listo"}
          </button>
        </div>
      </div>

      {mode === "typed" ? (
        <div className="relative w-full rounded-2xl border border-teal-200/80 overflow-hidden bg-[#fffdf9] shadow-inner">
          {/* Digital Handwriting Lines background */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-around py-3 px-4 opacity-40">
            <div className="w-full border-b-2 border-teal-300" />
            <div className="w-full border-b border-dashed border-teal-400" />
            <div className="w-full border-b-2 border-teal-500" />
            <div className="w-full border-b-2 border-teal-300" />
            <div className="w-full border-b border-dashed border-teal-400" />
            <div className="w-full border-b-2 border-teal-500" />
          </div>

          <textarea
            aria-label="Escribe tus oraciones"
            rows={5}
            value={value}
            onChange={(e) => handleTextChange(e.target.value)}
            className="relative z-10 w-full min-h-[170px] resize-vertical bg-transparent p-4 text-stone-800 font-medium text-xl leading-[42px] focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-2xl"
            placeholder="Escribe tus oraciones aquí..."
          />
        </div>
      ) : (
        <div className="relative w-full rounded-2xl border border-teal-200/80 overflow-hidden bg-[#fffdf9] p-2 flex flex-col gap-2">
          <div className="relative w-full h-[180px] rounded-xl border border-teal-100 bg-[#fffdf9]">
            {/* Handwriting lines background */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-around py-3 px-4 opacity-30">
              <div className="w-full border-b-2 border-teal-300" />
              <div className="w-full border-b border-dashed border-teal-400" />
              <div className="w-full border-b-2 border-teal-500" />
            </div>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none z-10"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
              aria-label="Área para escribir a mano alzada"
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-2 py-1 bg-teal-50/50 rounded-xl">
            <div className="flex items-center gap-1.5">
              {BOOK_DRAW_SWATCHES.slice(0, 5).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c && !erasing ? "scale-110 border-stone-800" : "border-white"
                  }`}
                  style={{ background: c }}
                  onClick={() => {
                    setColor(c);
                    setErasing(false);
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                  erasing
                    ? "bg-teal-700 text-white border-teal-800"
                    : "bg-white text-teal-800 border-teal-200 hover:bg-teal-100"
                }`}
                onClick={() => setErasing((e) => !e)}
                aria-label="Borrador"
                aria-pressed={erasing}
              >
                <Eraser className="w-3.5 h-3.5" /> Borrador
              </button>

              <button
                type="button"
                className="p-1.5 rounded-lg bg-white text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 flex items-center gap-1"
                onClick={clearFreehand}
                aria-label="Limpiar trazo"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
