// WorkbookLetterTrace.tsx
// The student-workbook letter-tracing exercise (the interactive replacement for
// a static `writing-line` region). Unlike the games' DragLetterTrace, this
// grades REAL path-following: while the child traces, the pointer's distance to
// the current stroke polyline is measured continuously. To finish they must
// still pass through every checkpoint IN ORDER (so it can't be tapped through),
// and every excursion off the letter path is penalised — so a top score
// genuinely means "stayed on the letter." Reports through the same pipeline as
// the other interactive exercises (recordEvent + gretelEvent); student
// workbook only.
import { useMemo, useRef, useState } from "react";
import { playNote, playCorrectChord } from "@/lib/piano-audio";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";
import {
  getLetterTemplate,
  distanceToStroke,
  type Point,
} from "./letter-stroke-templates";

const VIEW_W = 100;
const VIEW_H = 120;
const START_TOL = 14; // how near the first checkpoint you must press to begin
const CHECKPOINT_TOL = 13; // how near a checkpoint counts as reached
const MAX_DEVIATION = 16; // how far off the stroke path before it's an excursion

interface WorkbookLetterTraceProps {
  modelText: string; // the printed model letter, e.g. "O" or "o"
  accent?: string;
  lessonId?: string;
}

type Status = "idle" | "tracing" | "done";

export function WorkbookLetterTrace({ modelText, accent = "#3FA9A6", lessonId }: WorkbookLetterTraceProps) {
  const strokes = useMemo(() => getLetterTemplate(modelText), [modelText]);

  const [strokeIdx, setStrokeIdx] = useState(0);
  const [pointIdx, setPointIdx] = useState(0); // next checkpoint within current stroke
  const [completed, setCompleted] = useState<Point[][]>([]);
  const [current, setCurrent] = useState<Point[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [slips, setSlips] = useState(0);
  const [offFlash, setOffFlash] = useState(false);

  const slipsRef = useRef(0);
  const offActiveRef = useRef(false);
  const reportedRef = useRef(false);
  const wrongFiredRef = useRef(false);

  // Guard: no faithful template (digraphs RR / Ñ, or a blank practice line) —
  // the caller falls back to a static line, but never render a broken trace.
  if (!strokes) return null;

  const totalPoints = strokes.reduce((n, s) => n + s.length, 0);
  const donePoints = completed.reduce((n, s) => n + s.length, 0) + current.length;
  const progress = Math.min(100, Math.round((donePoints / totalPoints) * 100));
  const nextCheckpoint = strokes[strokeIdx]?.[pointIdx];

  function toViewport(e: React.PointerEvent<SVGSVGElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  function finish() {
    setStatus("done");
    playCorrectChord();
    // Real score: clean trace = 1.0; each off-path excursion costs 0.25, min 0.
    const s = slipsRef.current;
    const score = Math.max(0, 1 - s * 0.25);
    const passed = score >= 0.75;
    gretelEvent(passed ? "answer:correct" : "answer:wrong");
    gretelEvent("activity:complete");
    if (!reportedRef.current) {
      reportedRef.current = true;
      recordEvent({
        lessonId: lessonId ?? "unknown",
        kind: "exercise",
        score: passed ? 1 : 0,
        total: 1,
        meta: {
          exercise: "workbook_letter_trace",
          letter: modelText,
          slips: s,
          quality: score,
          completed: true,
        },
      });
    }
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (status === "done" || !nextCheckpoint) return;
    const p = toViewport(e);
    if (Math.hypot(p.x - nextCheckpoint.x, p.y - nextCheckpoint.y) <= START_TOL) {
      e.currentTarget.setPointerCapture(e.pointerId);
      offActiveRef.current = false;
      setOffFlash(false);
      // pressing exactly on the active checkpoint counts as reaching it
      setCurrent((prev) => (prev.length === 0 ? [nextCheckpoint] : prev));
      setPointIdx((i) => (i === 0 ? 1 : i));
      setStatus("tracing");
      playNote(261.63 + pointIdx * 15, 0.08);
    }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (status !== "tracing" || !strokes) return;
    const stroke = strokes[strokeIdx];
    if (!stroke) return;
    const p = toViewport(e);

    // Real path-following: measure distance to the current stroke polyline.
    if (distanceToStroke(p, stroke) > MAX_DEVIATION) {
      // Count one penalty per contiguous excursion (not once per frame), and
      // do not advance checkpoints while off the path.
      if (!offActiveRef.current) {
        offActiveRef.current = true;
        slipsRef.current += 1;
        setSlips(slipsRef.current);
        setOffFlash(true);
        if (!wrongFiredRef.current) {
          wrongFiredRef.current = true;
          gretelEvent("answer:wrong");
        }
      }
      return;
    }
    if (offActiveRef.current) {
      offActiveRef.current = false;
      setOffFlash(false);
    }

    const cp = stroke[pointIdx];
    if (cp && Math.hypot(p.x - cp.x, p.y - cp.y) <= CHECKPOINT_TOL) {
      const nextCurrent = [...current, cp];
      setCurrent(nextCurrent);
      playNote(261.63 + pointIdx * 15, 0.08);
      const nextIdx = pointIdx + 1;
      if (nextIdx < stroke.length) {
        setPointIdx(nextIdx);
      } else {
        // Stroke finished.
        const nextStrokeIdx = strokeIdx + 1;
        setCompleted((prev) => [...prev, nextCurrent]);
        setCurrent([]);
        if (nextStrokeIdx < strokes.length) {
          setStrokeIdx(nextStrokeIdx);
          setPointIdx(0);
        } else {
          finish();
        }
      }
    }
  }

  function handlePointerUp() {
    if (status === "tracing") {
      // Lifting mid-stroke abandons the partial stroke; finished strokes remain.
      setCurrent([]);
      setPointIdx(0);
      offActiveRef.current = false;
    }
  }

  function reset() {
    setStrokeIdx(0);
    setPointIdx(0);
    setCompleted([]);
    setCurrent([]);
    setStatus("idle");
    setSlips(0);
    setOffFlash(false);
    slipsRef.current = 0;
    offActiveRef.current = false;
    reportedRef.current = false;
    wrongFiredRef.current = false;
  }

  return (
    <div className="fp-trace" data-status={status} data-slips={slips}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="fp-trace__svg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="img"
        aria-label={`Traza la letra ${modelText}`}
      >
        {/* Guide outline (dotted) */}
        {strokes.map((stroke, sIdx) => (
          <path
            key={`bg-${sIdx}`}
            d={stroke.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")}
            fill="none"
            stroke="#d8e6e5"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1,11"
          />
        ))}
        {/* Completed strokes */}
        {completed.map((stroke, sIdx) => (
          <path
            key={`done-${sIdx}`}
            d={stroke.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")}
            fill="none"
            stroke={accent}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* Active stroke in progress */}
        {current.length > 0 && (
          <path
            d={current.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")}
            fill="none"
            stroke={accent}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Next-checkpoint indicator */}
        {status !== "done" && nextCheckpoint && (
          <circle
            cx={nextCheckpoint.x}
            cy={nextCheckpoint.y}
            r="4.5"
            fill={offFlash ? "#e11d48" : accent}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}
      </svg>

      <div className="fp-trace__footer">
        <div className="fp-trace__progress" aria-hidden="true">
          <span className="fp-trace__progress-fill" style={{ width: `${progress}%`, backgroundColor: accent }} />
        </div>
        {offFlash && status !== "done" && (
          <span className="fp-trace__hint fp-trace__hint--off">Sigue la línea de la letra</span>
        )}
        {status === "done" && <span className="fp-trace__hint fp-trace__hint--ok">¡Muy bien!</span>}
        {status !== "idle" && (
          <button type="button" className="fp-trace__reset" onClick={reset} aria-label="Reiniciar el trazo">
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
