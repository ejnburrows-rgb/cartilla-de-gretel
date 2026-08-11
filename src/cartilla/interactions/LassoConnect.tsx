/**
 * LassoConnect — quiet workbook-style mark/connect interaction.
 *
 * The printed workbook stays visually in charge. Students tap the original
 * drawing and the app adds only a restrained pencil circle or pencil line.
 * There is no character overlay, thrown rope, arcade animation, or audio.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";
import { loadLassoProgress, saveLassoProgress } from "@/lib/activity-canvas-store";
import type { WorkbookObject } from "@/content/workbook/types";
import type { InteractionProps } from "./shared";
import "@/styles/activity-mechanics.css";

export type LassoTarget = {
  id: string;
  label: string;
  src?: string;
  /** Absolute or percent box when used in free layout; grid layout ignores. */
  box?: { xPct: number; yPct: number; wPct: number; hPct: number };
  correct?: boolean;
  /** Pair matching: role + shared pairId */
  role?: "left" | "right" | "solo";
  pairId?: string;
};

export type LassoMode = "mark" | "pair";

export type LassoVerbFamily = "enlaza" | "une" | "encierra" | "conecta" | "empareja";

export interface LassoConnectProps {
  pageKey: string;
  targets: LassoTarget[];
  mode: LassoMode;
  verbFamily?: LassoVerbFamily;
  /** Printed instruction shown above stage (never invented). */
  instruction?: string;
  lessonId?: string;
  reducedMotion?: boolean;
  onResult?: (r: { objectId: string; result: "correct" | "wrong" }) => void;
  onComplete?: () => void;
  /** When true, targets use absolute percent boxes (LivingWorkbook). */
  absoluteLayout?: boolean;
  className?: string;
}

type Pt = { x: number; y: number };
type Link = { a: string; b: string };

function detectVerbFamily(text?: string): LassoVerbFamily {
  const value = (text ?? "").toLowerCase();
  if (value.includes("encierra")) return "encierra";
  if (value.includes("enlaza")) return "enlaza";
  if (value.includes("conecta")) return "conecta";
  if (value.includes("empareja")) return "empareja";
  if (value.includes("une") || value.includes("traza una línea")) return "une";
  return "encierra";
}

function pencilCurve(a: Pt, b: Pt): string {
  const mx = (a.x + b.x) / 2;
  const distance = Math.abs(b.x - a.x);
  const sag = Math.min(22, Math.max(8, distance * 0.08));
  const my = (a.y + b.y) / 2 + sag;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

function PencilCircle({ held = false }: { held?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 100"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-10%",
        width: "120%",
        height: "120%",
        overflow: "visible",
        pointerEvents: "none",
        transform: "rotate(-4deg)",
        zIndex: 8,
      }}
    >
      <ellipse
        cx="60"
        cy="50"
        rx="51"
        ry="40"
        fill="none"
        stroke="#5f5149"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray={held ? "8 7" : undefined}
        opacity={held ? 0.7 : 0.92}
      />
      {!held ? (
        <ellipse
          cx="59"
          cy="51"
          rx="49"
          ry="38"
          fill="none"
          stroke="#7a6960"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.38"
          transform="rotate(3 60 50)"
        />
      ) : null}
    </svg>
  );
}

export function LassoConnect({
  pageKey,
  targets,
  mode,
  verbFamily,
  instruction,
  lessonId,
  reducedMotion: _reducedMotion,
  onResult,
  onComplete,
  absoluteLayout = false,
  className,
}: LassoConnectProps) {
  const verb = verbFamily ?? detectVerbFamily(instruction);
  const stageRef = useRef<HTMLDivElement>(null);
  const targetEls = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [links, setLinks] = useState<Link[]>([]);
  const [heldLeft, setHeldLeft] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [linkPaths, setLinkPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    const snapshot = loadLassoProgress(pageKey);
    if (!snapshot?.completedIds?.length) return;
    if (mode === "mark") {
      setMarked(new Set(snapshot.completedIds));
      return;
    }
    const restored: Link[] = [];
    for (const id of snapshot.completedIds) {
      const [a, b] = id.split("|");
      if (a && b) restored.push({ a, b });
    }
    setLinks(restored);
  }, [pageKey, mode]);

  const totalNeeded = useMemo(() => {
    if (mode === "mark") {
      const explicitlyCorrect = targets.filter((target) => target.correct).length;
      return explicitlyCorrect > 0 ? explicitlyCorrect : targets.length;
    }
    const leftTargets = targets.filter((target) => target.role === "left");
    return leftTargets.length > 0 ? leftTargets.length : Math.floor(targets.length / 2);
  }, [mode, targets]);

  const persistMark = useCallback(
    (values: Set<string>) => saveLassoProgress(pageKey, [...values]),
    [pageKey],
  );

  const persistLinks = useCallback(
    (values: Link[]) => saveLassoProgress(pageKey, values.map((link) => `${link.a}|${link.b}`)),
    [pageKey],
  );

  const finishIfDone = useCallback(
    (count: number) => {
      if (completed || totalNeeded <= 0 || count < totalNeeded) return;
      setCompleted(true);
      gretelEvent("activity:complete");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: totalNeeded,
          total: totalNeeded,
          meta: { exercise: `lasso_${pageKey}`, completed: true, mode },
        });
      }
      onComplete?.();
    },
    [completed, totalNeeded, lessonId, pageKey, mode, onComplete],
  );

  const targetCenter = useCallback((id: string): Pt | null => {
    const stage = stageRef.current;
    const target = targetEls.current.get(id);
    if (!stage || !target) return null;
    const stageRect = stage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return {
      x: targetRect.left + targetRect.width / 2 - stageRect.left,
      y: targetRect.top + targetRect.height / 2 - stageRect.top,
    };
  }, []);

  const refreshLinkPaths = useCallback(() => {
    const next: Record<string, string> = {};
    for (const link of links) {
      const a = targetCenter(link.a);
      const b = targetCenter(link.b);
      if (!a || !b) continue;
      next[`${link.a}|${link.b}`] = pencilCurve(a, b);
    }
    setLinkPaths(next);
  }, [links, targetCenter]);

  useEffect(() => {
    refreshLinkPaths();
    window.addEventListener("resize", refreshLinkPaths);
    return () => window.removeEventListener("resize", refreshLinkPaths);
  }, [refreshLinkPaths]);

  useEffect(() => {
    if (mode === "mark") finishIfDone(marked.size);
    else finishIfDone(links.length);
  }, [mode, marked.size, links.length, finishIfDone]);

  const isLinked = (id: string) => links.some((link) => link.a === id || link.b === id);

  const showWrongBriefly = (id: string) => {
    setWrongId(id);
    window.setTimeout(() => setWrongId((current) => (current === id ? null : current)), 650);
  };

  const handleMark = (target: LassoTarget) => {
    if (marked.has(target.id) || completed) return;
    const hasExplicitAnswers = targets.some((candidate) => candidate.correct !== undefined);
    const correct = hasExplicitAnswers ? Boolean(target.correct) : true;
    if (!correct) {
      showWrongBriefly(target.id);
      onResult?.({ objectId: target.id, result: "wrong" });
      return;
    }
    setMarked((previous) => {
      const next = new Set(previous).add(target.id);
      persistMark(next);
      return next;
    });
    onResult?.({ objectId: target.id, result: "correct" });
  };

  const pairMatches = (left: LassoTarget, right: LassoTarget): boolean => {
    if (left.id === right.id) return false;
    if (left.pairId && right.pairId) return left.pairId === right.pairId;
    if (left.role === "left" && right.role === "right") return left.pairId === right.pairId;
    return left.correct !== false && right.correct !== false;
  };

  const handlePair = (target: LassoTarget) => {
    if (completed || isLinked(target.id)) return;
    if (!heldLeft) {
      setHeldLeft(target.id);
      return;
    }
    if (heldLeft === target.id) {
      setHeldLeft(null);
      return;
    }
    const first = targets.find((candidate) => candidate.id === heldLeft);
    if (!first || !pairMatches(first, target)) {
      showWrongBriefly(target.id);
      onResult?.({ objectId: target.id, result: "wrong" });
      return;
    }
    const nextLink = { a: first.id, b: target.id };
    setLinks((previous) => {
      const next = [...previous, nextLink];
      persistLinks(next);
      return next;
    });
    setHeldLeft(null);
    onResult?.({ objectId: first.id, result: "correct" });
  };

  const handleTap = (target: LassoTarget) => {
    if (mode === "mark") handleMark(target);
    else handlePair(target);
  };

  return (
    <div
      className={`am-lasso${className ? ` ${className}` : ""}${absoluteLayout ? " am-lasso--absolute" : ""}`}
      data-mode={mode}
      data-verb={verb}
    >
      {instruction ? <p className="am-lasso__instruction">{instruction}</p> : null}
      <div className="am-lasso__stage" ref={stageRef}>
        {mode === "pair" && Object.keys(linkPaths).length > 0 ? (
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${stageRef.current?.clientWidth ?? 1000} ${stageRef.current?.clientHeight ?? 700}`}
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 7,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            {Object.entries(linkPaths).map(([id, path]) => (
              <g key={id}>
                <path
                  d={path}
                  fill="none"
                  stroke="#5f5149"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  opacity="0.88"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#8b7b72"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.36"
                  vectorEffect="non-scaling-stroke"
                  transform="translate(1 1)"
                />
              </g>
            ))}
          </svg>
        ) : null}

        <div className={`am-lasso__targets${absoluteLayout ? " am-lasso__targets--abs" : ""}`}>
          {targets.map((target, index) => {
            const isMarked = marked.has(target.id);
            const linked = isLinked(target.id);
            const held = heldLeft === target.id;
            const wrong = wrongId === target.id;
            const style =
              absoluteLayout && target.box
                ? {
                    position: "absolute" as const,
                    left: `${target.box.xPct}%`,
                    top: `${target.box.yPct}%`,
                    width: `${target.box.wPct}%`,
                    height: `${target.box.hPct}%`,
                  }
                : { ["--stagger" as string]: `${index * 40}ms` };

            return (
              <button
                key={target.id}
                type="button"
                ref={(element) => {
                  if (element) targetEls.current.set(target.id, element);
                  else targetEls.current.delete(target.id);
                }}
                className="am-lasso__target"
                style={{
                  ...style,
                  ...(wrong
                    ? {
                        outline: "2px solid rgba(173, 74, 62, 0.58)",
                        outlineOffset: "2px",
                      }
                    : {}),
                }}
                disabled={isMarked || linked}
                onClick={() => handleTap(target)}
                aria-label={target.label}
                aria-pressed={isMarked || linked || held}
              >
                {target.src ? (
                  <img src={target.src} alt="" draggable={false} loading="lazy" />
                ) : (
                  <span className="am-lasso__target-text">{target.label}</span>
                )}
                {isMarked || linked ? <PencilCircle /> : held ? <PencilCircle held /> : null}
              </button>
            );
          })}
        </div>
      </div>
      {completed ? (
        <p className="am-lasso__done" role="status">
          ¡Listo!
        </p>
      ) : null}
    </div>
  );
}

/** Living workbook adapter — pair-match / mark-circle → LassoConnect. */
export function LassoConnectFromWorkbook({
  objects,
  onResult,
  onComplete,
  reducedMotion,
  pageKey,
  mode,
  instruction,
  lessonId,
}: InteractionProps & {
  pageKey: string;
  mode: LassoMode;
  instruction?: string;
  lessonId?: string;
}) {
  const targets: LassoTarget[] = objects.map((object: WorkbookObject) => {
    const data = (object.interaction?.data ?? {}) as {
      correct?: boolean;
      role?: "left" | "right";
      pairId?: string;
    };
    return {
      id: object.id,
      label: object.alt ?? object.text ?? object.id,
      src: object.src,
      box: object.box,
      correct: data.correct,
      role: data.role ?? "solo",
      pairId: data.pairId,
    };
  });

  return (
    <LassoConnect
      pageKey={pageKey}
      targets={targets}
      mode={mode}
      instruction={instruction}
      lessonId={lessonId}
      reducedMotion={reducedMotion}
      onResult={onResult}
      onComplete={onComplete}
      absoluteLayout
      className="am-lasso--workbook"
    />
  );
}
