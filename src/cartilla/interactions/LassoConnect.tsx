/**
 * LassoConnect — cinematic Gretel rope lasso for Enlaza / Une / Encierra /
 * pair-match / mark-circle / line-connect pages.
 *
 * Rope is a thick tapered SVG ribbon with natural tan strand texture, thrown
 * on a curved bezier arc with wrap-on-hit and reel-back-on-miss. Never a
 * dashed line, single <line>, or rubber-band string.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GretelLayerRig } from "@/components/gretel/GretelLayerRig";
import { speakGretelPhrase } from "@/lib/gretel-tts";
import { useActivityEvents, useActivityState } from "@/lib/activity-events";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { loadLassoProgress, saveLassoProgress } from "@/lib/activity-canvas-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LivingIllustration } from "@/components/living/LivingIllustration";
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
  /** Source-provided example: visible, already connected, never learner evidence. */
  example?: boolean;
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

type FlightState =
  | { kind: "idle" }
  | { kind: "throw"; from: Pt; to: Pt; t0: number; targetId: string; willHit: boolean }
  | { kind: "wrap"; targetId: string; t0: number }
  | { kind: "reel"; from: Pt; to: Pt; t0: number }
  | { kind: "link"; a: string; b: string };

type Pt = { x: number; y: number };

const THROW_MS = 580;
const WRAP_MS = 280;
const REEL_MS = 420;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function introLine(verb: LassoVerbFamily): string {
  switch (verb) {
    case "enlaza":
      return "Vamos a enlazar las palabras.";
    case "une":
      return "Vamos a unir.";
    case "conecta":
      return "Vamos a conectar.";
    case "encierra":
      return "Vamos a encerrar la respuesta.";
    case "empareja":
      return "Vamos a emparejar.";
    default:
      return "Vamos a unir.";
  }
}

function detectVerbFamily(text?: string): LassoVerbFamily {
  const t = (text ?? "").toLowerCase();
  if (t.includes("encierra")) return "encierra";
  if (t.includes("enlaza")) return "enlaza";
  if (t.includes("conecta")) return "conecta";
  if (t.includes("empareja")) return "empareja";
  if (t.includes("une") || t.includes("traza una línea")) return "une";
  return "encierra";
}

/** Thick tapered rope path: shaft + open loop head. */
function buildRopePath(
  hand: Pt,
  tip: Pt,
  progress: number,
  loopScale: number,
  arcLift: number,
): string {
  const mx = (hand.x + tip.x) / 2;
  const my = (hand.y + tip.y) / 2 - arcLift;
  // Quadratic arc hand → control → tip
  const cx = hand.x + (mx - hand.x) * progress + (tip.x - mx) * progress * progress;
  // Sample curve points
  const pts: Pt[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * progress;
    const x = (1 - t) * (1 - t) * hand.x + 2 * (1 - t) * t * mx + t * t * tip.x;
    const y = (1 - t) * (1 - t) * hand.y + 2 * (1 - t) * t * my + t * t * tip.y;
    pts.push({ x, y });
  }
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
  // Loop at tip
  if (progress > 0.15) {
    const end = pts[pts.length - 1];
    const prev = pts[Math.max(0, pts.length - 3)];
    const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
    const rx = 22 * loopScale;
    const ry = 16 * loopScale;
    const lx = end.x + Math.cos(ang) * 6;
    const ly = end.y + Math.sin(ang) * 6;
    d += ` M ${lx + rx} ${ly}`;
    d += ` A ${rx} ${ry} ${(ang * 180) / Math.PI} 1 1 ${lx + rx - 0.01} ${ly}`;
  }
  return d;
}

function drapedLink(a: Pt, b: Pt): string {
  const mx = (a.x + b.x) / 2;
  const my = Math.max(a.y, b.y) + 28;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export function LassoConnect({
  pageKey,
  targets,
  mode,
  verbFamily,
  instruction,
  lessonId,
  reducedMotion: reducedMotionProp,
  onResult,
  onComplete,
  absoluteLayout = false,
  className,
}: LassoConnectProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const [incorrectAttempts, setIncorrectAttempts] = useActivityState("incorrectAttempts", 0);
  const incorrectRef = useRef(incorrectAttempts);
  incorrectRef.current = incorrectAttempts;
  const recordWrong = () => {
    incorrectRef.current += 1; setIncorrectAttempts(incorrectRef.current);
    if (lessonId) recordEvent({ lessonId, kind: "exercise", score: mode === "mark" ? learnerMarked : links.length, total: totalNeeded + incorrectRef.current, meta: { exercise: `lasso_${pageKey}`, completed: false, attemptCorrect: false, mode } });
  };
  const reducedMotionHook = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? reducedMotionHook;
  const verb = verbFamily ?? detectVerbFamily(instruction);
  const stageRef = useRef<HTMLDivElement>(null);
  const targetEls = useRef<Map<string, HTMLButtonElement>>(new Map());
  const gretelRef = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<FlightState>({ kind: "idle" });
  const [ropePath, setRopePath] = useState("");
  const [loopScale, setLoopScale] = useState(1);
  const validMarkIds = new Set(targets.filter(t => t.example || t.correct === true || targets.every(item => item.correct === undefined)).map(t => t.id));
  const [marked, setMarked] = useState<Set<string>>(() => new Set([
    ...targets.filter(t => t.example).map(t => t.id),
    ...(mode === "mark" ? loadLassoProgress(pageKey)?.completedIds ?? [] : []).filter(id => validMarkIds.has(id)),
  ]));
  const [links, setLinks] = useState<Array<{ a: string; b: string; path: string }>>(() => {
    if (mode !== "pair") return [];
    const used = new Set<string>();
    return (loadLassoProgress(pageKey)?.completedIds ?? []).flatMap(id => {
      const [a, b] = id.split("|");
      const left = targets.find(t => t.id === a && t.role === "left");
      const right = targets.find(t => t.id === b && t.role === "right");
      if (!left || !right || !left.pairId || left.pairId !== right.pairId || used.has(a) || used.has(b)) return [];
      used.add(a); used.add(b);
      return [{ a, b, path: "" }];
    });
  });
  const [heldLeft, setHeldLeft] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [pose, setPose] = useState<"idle" | "cheer" | "talk">("idle");
  const [winding, setWinding] = useState(true);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [linkPaths, setLinkPaths] = useState<Record<string, string>>({});
  const rafRef = useRef<number | null>(null);
  const timers = useRef(new Set<number>());
  const later = useCallback((callback: () => void, ms: number) => {
    const timer = window.setTimeout(() => { timers.current.delete(timer); callback(); }, ms);
    timers.current.add(timer);
    return timer;
  }, []);
  const finishedRef = useRef(false);

  const throwMs = reducedMotion ? 220 : THROW_MS;
  const wrapMs = reducedMotion ? 120 : WRAP_MS;
  const reelMs = reducedMotion ? 180 : REEL_MS;

  // Intro VO + wind
  useEffect(() => {
    setPose("talk");
    try {
      speakGretelPhrase(introLine(verb));
    } catch {
      /* audio optional */
    }
    const windEnd = later(() => setWinding(false), reducedMotion ? 200 : 900);
    const poseEnd = later(() => setPose("idle"), reducedMotion ? 400 : 1600);
    return () => {
      window.clearTimeout(windEnd);
      window.clearTimeout(poseEnd);
    };
  }, [verb, reducedMotion, pageKey, later]);

  // Recompute link paths when links change
  useEffect(() => {
    if (!links.length) return;
    const next: Record<string, string> = {};
    for (const link of links) {
      const elA = targetEls.current.get(link.a);
      const elB = targetEls.current.get(link.b);
      const stage = stageRef.current;
      if (!elA || !elB || !stage) continue;
      const sr = stage.getBoundingClientRect();
      const ar = elA.getBoundingClientRect();
      const br = elB.getBoundingClientRect();
      const a = { x: ar.left + ar.width / 2 - sr.left, y: ar.top + ar.height / 2 - sr.top };
      const b = { x: br.left + br.width / 2 - sr.left, y: br.top + br.height / 2 - sr.top };
      next[`${link.a}|${link.b}`] = drapedLink(a, b);
    }
    setLinkPaths(next);
  }, [links, marked]);

  const handPoint = useCallback((): Pt => {
    const stage = stageRef.current;
    const g = gretelRef.current;
    if (!stage || !g) return { x: 48, y: 120 };
    const sr = stage.getBoundingClientRect();
    const gr = g.getBoundingClientRect();
    // Approximate hand near mid-right of figure
    return {
      x: gr.left + gr.width * 0.72 - sr.left,
      y: gr.top + gr.height * 0.48 - sr.top,
    };
  }, []);

  const targetCenter = useCallback((id: string): Pt => {
    const stage = stageRef.current;
    const el = targetEls.current.get(id);
    if (!stage || !el) return { x: 200, y: 100 };
    const sr = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top };
  }, []);

  const totalNeeded = useMemo(() => {
    if (mode === "mark") {
      const n = targets.filter((t) => t.correct && !t.example).length;
      return targets.some(t => t.correct !== undefined) ? n : targets.filter(t => !t.example).length;
    }
    const lefts = targets.filter((t) => t.role === "left");
    return lefts.length > 0 ? lefts.length : Math.floor(targets.length / 2);
  }, [mode, targets]);

  const persist = useCallback(
    (ids: string[]) => {
      saveLassoProgress(pageKey, ids);
    },
    [pageKey],
  );

  const finishIfDone = useCallback(
    (markedCount: number) => {
      if (markedCount >= totalNeeded && totalNeeded > 0 && !finishedRef.current) {
        finishedRef.current = true;
        setCompleted(true);
        setPose("cheer");
        gretelEvent("activity:complete");
        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: totalNeeded,
            total: totalNeeded + incorrectRef.current,
            meta: { exercise: `lasso_${pageKey}`, completed: true, attemptCorrect: true, mode },
          });
        }
        onComplete?.();
      }
    },
    [totalNeeded, lessonId, pageKey, mode, onComplete, gretelEvent, recordEvent],
  );

  const learnerMarked = [...marked].filter(id => !targets.find(t => t.id === id)?.example).length;
  useEffect(() => {
    const count = mode === "mark" ? learnerMarked : links.length;
    if (count >= totalNeeded && totalNeeded > 0 && !finishedRef.current) {
      finishedRef.current = true;
      setCompleted(true);
      gretelEvent("activity:complete", { restored: true });
    }
  }, [learnerMarked, links.length, mode, totalNeeded, gretelEvent]);

  const runThrow = useCallback(
    (targetId: string, willHit: boolean, onLand: () => void) => {
      const from = handPoint();
      const to = targetCenter(targetId);
      const t0 = performance.now();
      setBusy(true);
      setFlight({ kind: "throw", from, to, t0, targetId, willHit });
      setPose("talk");

      // Reduced-motion / test path: still run full rope logic with short timers
      // (never remove the ability to complete — only shorten decorative thrash).
      if (reducedMotion) {
        setRopePath(buildRopePath(from, to, 1, 1, 40));
        later(() => {
          if (willHit) {
            setLoopScale(0.75);
            setFlight({ kind: "wrap", targetId, t0: performance.now() });
            later(() => {
              onLand();
              setRopePath("");
              setFlight({ kind: "idle" });
              setBusy(false);
              setPose("cheer");
              later(() => setPose("idle"), 200);
            }, wrapMs);
          } else {
            setFlight({ kind: "reel", from: to, to: from, t0: performance.now() });
            setRopePath(buildRopePath(from, to, 0.35, 0.7, 20));
            later(() => {
              setRopePath("");
              setFlight({ kind: "idle" });
              setBusy(false);
              setPose("idle");
              onLand();
            }, reelMs);
          }
        }, throwMs);
        return;
      }

      const animateThrow = (now: number) => {
        const t = Math.min(1, (now - t0) / throwMs);
        const e = easeOutCubic(t);
        const lift = 70 * Math.sin(Math.PI * e);
        setRopePath(buildRopePath(from, to, e, 1 + Math.sin(e * Math.PI) * 0.25, lift));
        setLoopScale(1.05 + Math.sin(e * Math.PI) * 0.2);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(animateThrow);
          return;
        }
        if (willHit) {
          setFlight({ kind: "wrap", targetId, t0: performance.now() });
          const wrapStart = performance.now();
          const wrapAnim = (nw: number) => {
            const wt = Math.min(1, (nw - wrapStart) / wrapMs);
            setLoopScale(1.2 - easeInOut(wt) * 0.45);
            if (wt < 1) {
              rafRef.current = requestAnimationFrame(wrapAnim);
              return;
            }
            onLand();
            setRopePath("");
            setFlight({ kind: "idle" });
            setBusy(false);
            setPose("cheer");
            later(() => setPose("idle"), 900);
          };
          rafRef.current = requestAnimationFrame(wrapAnim);
        } else {
          setFlight({ kind: "reel", from: to, to: from, t0: performance.now() });
          const reelStart = performance.now();
          const reelAnim = (nw: number) => {
            const rt = Math.min(1, (nw - reelStart) / reelMs);
            const e2 = easeInOut(rt);
            const liftR = 50 * Math.sin(Math.PI * (1 - e2));
            setRopePath(buildRopePath(from, to, 1 - e2, 1, liftR));
            setLoopScale(1 - e2 * 0.5);
            if (rt < 1) {
              rafRef.current = requestAnimationFrame(reelAnim);
              return;
            }
            setRopePath("");
            setFlight({ kind: "idle" });
            setBusy(false);
            setPose("idle");
            onLand();
          };
          rafRef.current = requestAnimationFrame(reelAnim);
        }
      };
      rafRef.current = requestAnimationFrame(animateThrow);
    },
    [handPoint, targetCenter, throwMs, wrapMs, reelMs, reducedMotion, later],
  );

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      for (const timer of pendingTimers) window.clearTimeout(timer);
      pendingTimers.clear();
    };
  }, []);

  const handleTap = (target: LassoTarget) => {
    if (busy || completed) return;
    if (mode === "mark") {
      if (marked.has(target.id)) return;
      const isCorrect =
        target.correct !== false &&
        (target.correct === true || targets.every((t) => t.correct === undefined));
      // Prefer explicit correct flags when present
      const hasFlags = targets.some((t) => t.correct !== undefined);
      const ok = hasFlags ? Boolean(target.correct) : true;

      runThrow(target.id, ok, () => {
        if (ok) {
          playCorrectChord();
          gretelEvent("answer:correct", { itemId: target.id });

          const next = new Set(marked).add(target.id);
          setMarked(next);
          persist([...next]);
          finishIfDone([...next].filter(id => !targets.find(t => t.id === id)?.example).length);
          onResult?.({ objectId: target.id, result: "correct" });
        } else {
          playWrongBuzz();
          gretelEvent("answer:wrong", { itemId: target.id });
          recordWrong();
          try {
            speakGretelPhrase("Oh no, inténtalo de nuevo.");
          } catch {
            /* optional */
          }
          setWrongId(target.id);
          later(() => setWrongId(null), 500);
          onResult?.({ objectId: target.id, result: "wrong" });
        }
      });
      return;
    }

    // pair mode
    if (target.role === "left" || (!target.role && !heldLeft)) {
      if (links.some((l) => l.a === target.id || l.b === target.id)) return;
      setHeldLeft(target.id);
      // soft hold — short wind, no full throw yet
      setWinding(true);
      later(() => setWinding(false), 200);
      return;
    }

    // second tap = partner
    if (!heldLeft) {
      setHeldLeft(target.id);
      return;
    }
    if (target.id === heldLeft) {
      setHeldLeft(null);
      return;
    }
    if (links.some((l) => l.a === target.id || l.b === target.id)) return;

    const left = targets.find((t) => t.id === heldLeft);
    const right = target;
    const ok =
      left?.pairId && right.pairId
        ? left.pairId === right.pairId
        : left?.correct !== false && right.correct !== false && left?.id !== right.id
          ? Boolean(right.correct ?? true) &&
            (left?.pairId === right.pairId || (!left?.pairId && !right.pairId))
          : false;

    // Prefer pairId match when available
    const pairOk =
      left?.pairId && right.pairId
        ? left.pairId === right.pairId
        : left?.role === "left" && right.role === "right"
          ? left.pairId === right.pairId
          : ok;

    runThrow(right.id, pairOk, () => {
      if (pairOk && left) {
        playCorrectChord();
        gretelEvent("answer:correct", { itemId: `${left?.id}|${right.id}` });

        const next = [...links, { a: left.id, b: right.id, path: "" }];
        setLinks(next);
        persist(next.map(l => `${l.a}|${l.b}`));
        finishIfDone(next.length);
        setHeldLeft(null);
        onResult?.({ objectId: left.id, result: "correct" });
      } else {
        playWrongBuzz();
        gretelEvent("answer:wrong", { itemId: `${left?.id}|${right.id}` });
        recordWrong();
        try {
          speakGretelPhrase("Oh no, inténtalo de nuevo.");
        } catch {
          /* optional */
        }
        setWrongId(right.id);
        later(() => setWrongId(null), 500);
        // keep first selection held for clearer retry UX
        onResult?.({ objectId: right.id, result: "wrong" });
      }
    });
  };

  const isLinked = (id: string) => links.some((l) => l.a === id || l.b === id);

  return (
    <div
      className={`am-lasso${className ? ` ${className}` : ""}${absoluteLayout ? " am-lasso--absolute" : ""}`}
      data-complete={String(completed)}
      data-mode={mode}
      data-verb={verb}
    >
      {targets.some(t => t.example) && <p role="status">{learnerMarked} de {totalNeeded} respuestas correctas</p>}
      {instruction ? <p className="am-lasso__instruction">{instruction}</p> : null}
      <div className="am-lasso__stage" ref={stageRef}>
        {/* Full-presence Gretel */}
        <div
          ref={gretelRef}
          className={`am-lasso__gretel${winding ? " is-winding" : ""}${pose === "cheer" ? " is-cheer" : ""}`}
        >
          <div className="am-lasso__shadow" aria-hidden />
          <div className="am-lasso__gretel-img relative" role="img" aria-label="Gretel">
            <GretelLayerRig
              state={pose === "cheer" ? "cheering" : pose === "talk" ? "teaching" : "idle"}
              speaking={pose === "talk"}
              paused={Boolean(reducedMotion)}
            />
          </div>
          {/* Rope coil prop in hand */}
          <svg className="am-lasso__coil" viewBox="0 0 40 40" aria-hidden>
            <defs>
              <linearGradient id="ropeGradCoil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c4a574" />
                <stop offset="50%" stopColor="#a67c52" />
                <stop offset="100%" stopColor="#8b6914" />
              </linearGradient>
            </defs>
            <ellipse
              cx="20"
              cy="20"
              rx="14"
              ry="10"
              fill="none"
              stroke="url(#ropeGradCoil)"
              strokeWidth="4"
            />
            <ellipse
              cx="20"
              cy="20"
              rx="8"
              ry="5.5"
              fill="none"
              stroke="url(#ropeGradCoil)"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Rope SVG layer — thickness via stroke, strand texture via dual stroke */}
        <svg className="am-lasso__rope-layer" aria-hidden>
          <defs>
            <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4b896" />
              <stop offset="40%" stopColor="#b08968" />
              <stop offset="100%" stopColor="#7f5539" />
            </linearGradient>
            <filter id="ropeSoft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="b" />
              <feOffset dy="0.5" result="o" />
              <feMerge>
                <feMergeNode in="o" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Settled pair links — draped curves, never straight connectors */}
          {Object.entries(linkPaths).map(([id, d]) => (
            <g key={id} className="am-lasso__link">
              <path
                d={d}
                fill="none"
                stroke="#6b4423"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d={d}
                fill="none"
                stroke="url(#ropeGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#ropeSoft)"
              />
              <path
                d={d}
                fill="none"
                stroke="#e6ccb2"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="3 5"
                opacity="0.55"
              />
            </g>
          ))}
          {/* Active flight rope */}
          {ropePath && (
            <g className="am-lasso__flight">
              <path
                d={ropePath}
                fill="none"
                stroke="#5c3d2e"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d={ropePath}
                fill="none"
                stroke="url(#ropeGrad)"
                strokeWidth="5.5"
                strokeLinecap="round"
                filter="url(#ropeSoft)"
              />
              <path
                d={ropePath}
                fill="none"
                stroke="#f0e0c8"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeDasharray="2 4"
                opacity="0.65"
              />
            </g>
          )}
        </svg>

        {/* Targets */}
        <div className={`am-lasso__targets${absoluteLayout ? " am-lasso__targets--abs" : ""}`}>
          {targets.map((t, i) => {
            const isMarked = marked.has(t.id);
            const linked = isLinked(t.id);
            const held = heldLeft === t.id;
            const wrong = wrongId === t.id;
            const style =
              absoluteLayout && t.box
                ? {
                    position: "absolute" as const,
                    left: `${t.box.xPct}%`,
                    top: `${t.box.yPct}%`,
                    width: `${t.box.wPct}%`,
                    height: `${t.box.hPct}%`,
                  }
                : { ["--stagger" as string]: `${i * 40}ms` };
            return (
              <button
                key={t.id}
                type="button"
                ref={(el) => {
                  if (el) targetEls.current.set(t.id, el);
                  else targetEls.current.delete(t.id);
                }}
                className={[
                  "am-lasso__target",
                  isMarked || linked ? "is-caught" : "",
                  held ? "is-held" : "",
                  wrong ? "is-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={style}
                disabled={busy || isMarked || linked}
                onClick={() => handleTap(t)}
                aria-label={t.label}
                aria-pressed={isMarked || linked || held}
                data-gretel-correct={t.correct === undefined ? undefined : String(t.correct)}
                data-example={t.example ? "true" : undefined}
              >
                {t.src ? (
                  <LivingIllustration src={t.src} alt={t.label} loading="lazy" />
                ) : (
                  <span className="am-lasso__target-text">{t.label}</span>
                )}
                {(isMarked || linked) && <span className="am-lasso__caught-glow" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
      {completed && (
        <p className="am-lasso__done" role="status">
          ¡Listo!
        </p>
      )}
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
  const targets: LassoTarget[] = objects.map((o: WorkbookObject) => {
    const data = (o.interaction?.data ?? {}) as {
      correct?: boolean;
  /** Source-provided example: visible, already connected, never learner evidence. */
  example?: boolean;
      role?: "left" | "right";
      pairId?: string;
    };
    return {
      id: o.id,
      label: o.alt ?? o.text ?? o.id,
      src: o.src,
      box: o.box,
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
