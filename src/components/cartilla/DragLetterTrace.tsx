import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { playNote, playCorrectChord } from "@/lib/piano-audio";
import { recordEvent } from "@/lib/student-session";
import { RotateCcw, Award } from "lucide-react";
import { LETTER_TEMPLATES, type Point } from "./letter-stroke-templates";

interface DragLetterTraceProps {
  letter: string;
  color?: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function DragLetterTrace({ letter, color = "#f97316", lessonId, onComplete }: DragLetterTraceProps) {
  const targetLetter = letter.toUpperCase().trim() || "A";
  const strokes = LETTER_TEMPLATES[targetLetter] || LETTER_TEMPLATES.A;

  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [currentPointIdx, setCurrentPointIdx] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<Point[][]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalPoints = strokes.reduce((acc, stroke) => acc + stroke.length, 0);
  const completedPointsCount =
    completedStrokes.reduce((acc, stroke) => acc + stroke.length, 0) + currentStrokePoints.length;
  const progressPercent = Math.min(100, Math.round((completedPointsCount / totalPoints) * 100));

  const resetGame = useCallback(() => {
    setCurrentStrokeIdx(0);
    setCurrentPointIdx(0);
    setCompletedStrokes([]);
    setCurrentStrokePoints([]);
    setIsTracing(false);
    setIsFinished(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [letter, resetGame]);

  const nextCheckpoint = strokes[currentStrokeIdx]?.[currentPointIdx];

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isFinished || !nextCheckpoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 120;

    // Check if pointer is near starting checkpoint
    const dist = Math.sqrt(Math.pow(x - nextCheckpoint.x, 2) + Math.pow(y - nextCheckpoint.y, 2));

    if (dist < 15) {
      setIsTracing(true);
      setCurrentStrokePoints([nextCheckpoint]);
      playNote(261.63 + currentPointIdx * 15, 0.1); // Short tone
      setCurrentPointIdx(1);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isTracing || isFinished || !nextCheckpoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 120;

    const dist = Math.sqrt(Math.pow(x - nextCheckpoint.x, 2) + Math.pow(y - nextCheckpoint.y, 2));

    if (dist < 15) {
      // Complete current point
      const updatedStrokePoints = [...currentStrokePoints, nextCheckpoint];
      setCurrentStrokePoints(updatedStrokePoints);
      playNote(261.63 + currentPointIdx * 15, 0.1);

      const nextIdx = currentPointIdx + 1;
      const currentStroke = strokes[currentStrokeIdx];

      if (nextIdx < currentStroke.length) {
        // More points left in current stroke
        setCurrentPointIdx(nextIdx);
      } else {
        // Stroke complete!
        const nextStrokeIdx = currentStrokeIdx + 1;
        setCompletedStrokes((prev) => [...prev, updatedStrokePoints]);
        setCurrentStrokePoints([]);

        if (nextStrokeIdx < strokes.length) {
          // Move to next stroke
          setCurrentStrokeIdx(nextStrokeIdx);
          setCurrentPointIdx(0);
          setIsTracing(false); // Make them tap the start of the next stroke
        } else {
          // Finished entire letter!
          setIsFinished(true);
          setIsTracing(false);
          playCorrectChord();
          window.dispatchEvent(
            new CustomEvent("gretel:celebrate", {
              detail: { text: `¡Felicidades! Trazaste la letra ${targetLetter} muy bien.` },
            })
          );
          if (lessonId) {
            recordEvent({
              lessonId,
              kind: "exercise",
              score: 1,
              total: 1,
              meta: { exercise: "drag_letter_trace", letter: targetLetter, completed: true },
            });
          }
          onComplete?.();
        }
      }
    }
  };

  const handlePointerUp = () => {
    setIsTracing(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-5 bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/40">
        <div>
          <h3 className="text-lg font-black text-stone-800">Trazar Letra</h3>
          <p className="text-xs font-bold text-stone-500">Sigue los puntos verdes para trazar la letra.</p>
        </div>
        <button
          onClick={resetGame}
          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-all shadow-sm"
          title="Reiniciar Trazo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Canvas area */}
        <div className="relative w-64 h-72 bg-stone-50 border border-stone-200 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] flex items-center justify-center overflow-hidden touch-none select-none">
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full p-6 cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* 1. Background full guide outline */}
            {strokes.map((stroke, sIdx) => {
              const pathD = stroke.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              return (
                <path
                  key={`bg-${sIdx}`}
                  d={pathD}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1,12"
                />
              );
            })}

            {/* 2. Completed Strokes */}
            {completedStrokes.map((stroke, sIdx) => {
              const pathD = stroke.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              return (
                <path
                  key={`done-${sIdx}`}
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* 3. Current Active Stroke */}
            {currentStrokePoints.length > 0 && (
              <path
                d={currentStrokePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* 4. Tracing guide checkpoints */}
            {!isFinished &&
              strokes.map((stroke, sIdx) =>
                stroke.map((p, pIdx) => {
                  const isCompleted =
                    sIdx < currentStrokeIdx || (sIdx === currentStrokeIdx && pIdx < currentPointIdx);
                  const isActiveTarget = sIdx === currentStrokeIdx && pIdx === currentPointIdx;

                  if (isCompleted) return null;

                  return (
                    <circle
                      key={`cp-${sIdx}-${pIdx}`}
                      cx={p.x}
                      cy={p.y}
                      r={isActiveTarget ? "5.5" : "3.5"}
                      className={`${
                        isActiveTarget ? "fill-emerald-500 stroke-white stroke-2 animate-ping-slow" : "fill-stone-300"
                      }`}
                      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                    />
                  );
                })
              )}

            {/* Pulsing indicator overlay on target point */}
            {!isFinished && nextCheckpoint && (
              <circle
                cx={nextCheckpoint.x}
                cy={nextCheckpoint.y}
                r="4.5"
                className="fill-emerald-500 stroke-white stroke-2 pointer-events-none"
              />
            )}
          </svg>
        </div>

        {/* Tracing Progress Bar */}
        <div className="w-full space-y-1.5 px-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>Progreso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      </div>

      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2"
        >
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-black text-emerald-800">¡Trazo completado! Excelente 🎉</span>
        </motion.div>
      )}
    </div>
  );
}
