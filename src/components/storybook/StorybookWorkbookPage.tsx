/**
 * Proof pages 4 and 5 (Lección 2 · Vocal O) in the storybook direction.
 * Same page data (book-faithful layouts), same reader, same Gretel bus,
 * same completion store — only the presentation and the per-tap mechanic
 * are new. Rendered by FaithfulPageRenderer for these two pages only.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { PageGridCell, PageRegion } from "@/lib/book-faithful";
import { gretelEvent } from "@/lib/gretel-bus";
import { getCompletedPageActivities } from "@/lib/lesson-progress";
import { recordEvent } from "@/lib/student-session";
import { playCorrectChord, playNote, playWrongBuzz } from "@/lib/piano-audio";
import { audioEngine } from "@/lib/audio-engine";
import { speakAsGretel } from "@/lib/gretel-voice";
import { storybookLines } from "@/content/storybook-proof";
import { GretelActivity } from "@/components/gretel/GretelActivity";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { PageFrame } from "@/components/cartilla/PageFrame";
import { EscucharInstruccionButton } from "@/components/cartilla/EscucharInstruccionButton";
import "@/styles/storybook.css";

const STORE = "cartilla.storybook-proof.v1";

function loadFound(
  activityId: string,
  pageNumber: number,
  cells: PageGridCell[],
  exclude: number[] = [],
): Set<number> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "{}")[activityId];
    if (Array.isArray(saved))
      return new Set(saved.filter((n: unknown): n is number => typeof n === "number"));
  } catch {
    /* fresh */
  }
  // Page already completed earlier (e.g. before this proof): show it complete.
  if (getCompletedPageActivities(pageNumber).includes(activityId)) {
    return new Set(
      cells.map((c, i) => (c.correct && !exclude.includes(i) ? i : -1)).filter((i) => i >= 0),
    );
  }
  return new Set();
}

function saveFound(activityId: string, found: Set<number>) {
  try {
    const all = JSON.parse(localStorage.getItem(STORE) || "{}");
    all[activityId] = [...found];
    localStorage.setItem(STORE, JSON.stringify(all));
  } catch {
    /* storage unavailable: progress lives for this visit */
  }
}

/** A soft two-note "yes" — quieter than the activity-complete chord. */
function playItemChime() {
  if (typeof window === "undefined" || audioEngine.isMuted()) return;
  playNote(659.25, 0.45);
  window.setTimeout(() => playNote(987.77, 0.6), 90);
}

const reduceMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** "Instrucciones:" label, then the printed sentence with the taught vowel in teal bold (as printed). */
function Instruction({ region }: { region: PageRegion }) {
  const text = region.text ?? "";
  const parts = text.split(/(O o|Oo)/g);
  return (
    <div className="sb-instruction">
      <p className="sb-instruction__label">{region.label ?? "Instrucciones:"}</p>
      <p className="sb-instruction__text">
        {parts.map((part, i) =>
          /^(O o|Oo)$/.test(part) ? (
            <b key={i} className="sb-vowel">
              {part}
            </b>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
        <EscucharInstruccionButton text={text} className="sb-instruction__listen" />
      </p>
    </div>
  );
}

function Progress({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div
      className="sb-progress"
      role="status"
      aria-live="polite"
      aria-label={`${label}: ${done} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < done ? "is-done" : undefined} />
      ))}
      <em>
        {done} de {total}
      </em>
    </div>
  );
}

function useTransient(ms: number) {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    if (value === null) return;
    const t = window.setTimeout(() => setValue(null), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return [value, setValue] as const;
}

/** Book page 4 — "Marca con una x los dibujos que comienzan con O o." */
function MarkGrid({
  region,
  pageNumber,
  lessonId,
  activityId,
}: {
  region: PageRegion;
  pageNumber: number;
  lessonId?: string;
  activityId: string;
}) {
  const cells = useMemo(() => region.cells ?? [], [region.cells]);
  const columns = region.columns ?? 4;
  const correctIdx = useMemo(
    () => cells.map((c, i) => (c.correct ? i : -1)).filter((i) => i >= 0),
    [cells],
  );
  const [found, setFound] = useState<Set<number>>(() => loadFound(activityId, pageNumber, cells));
  const [wobble, setWobble] = useTransient(520);
  const [pop, setPop] = useTransient(700);
  const attempts = useRef(0);
  const total = correctIdx.length;
  const next = correctIdx.find((i) => !found.has(i));
  const complete = found.size >= total;
  const caption = (i?: number) => (typeof i === "number" ? cells[i]?.caption : undefined);

  const tap = (i: number) => {
    const cell = cells[i];
    if (!cell) return;
    const word = cell.caption ?? "";
    if (found.has(i)) {
      setPop(i);
      void speakAsGretel(word);
      return;
    }
    attempts.current += 1;
    if (cell.correct) {
      const nextFound = new Set(found).add(i);
      setFound(nextFound);
      saveFound(activityId, nextFound);
      setPop(i);
      const left = total - nextFound.size;
      const after = correctIdx.find((k) => !nextFound.has(k));
      const lines = storybookLines({
        pageNumber,
        word,
        correct: true,
        left,
        nextWord: caption(after),
      });
      gretelEvent("answer:correct", { activityId, pageNumber, perItem: true, lines });
      if (left === 0) {
        playCorrectChord();
        gretelEvent("activity:complete", { activityId, pageNumber, perItem: true, lines });
        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: 1,
            total: 1,
            meta: {
              exercise: `picture_grid_${region.id}`,
              completed: true,
              itemCount: total,
              attempt: attempts.current,
              corrected: attempts.current > total,
            },
          });
        }
      } else {
        playItemChime();
      }
      return;
    }
    setWobble(i);
    playWrongBuzz();
    const lines = storybookLines({
      pageNumber,
      word,
      correct: false,
      left: total - found.size,
      nextWord: caption(next),
    });
    gretelEvent("answer:wrong", { activityId, pageNumber, perItem: true, lines });
  };

  const domLines = storybookLines({
    pageNumber,
    left: total - found.size,
    nextWord: caption(next),
  });

  return (
    <div
      className="sb-markgrid"
      data-complete={complete ? "true" : "false"}
      data-gretel-lines={JSON.stringify(domLines)}
    >
      <div
        className="sb-markgrid__table"
        role="group"
        aria-label="Dibujos para marcar"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, i) => {
          const isFound = found.has(i);
          return (
            <button
              key={i}
              id={`sb-cell-${pageNumber}-${i}`}
              type="button"
              className="sb-cell"
              data-word={cell.caption}
              data-found={isFound ? "true" : undefined}
              data-wobble={wobble === i ? "true" : undefined}
              data-pop={pop === i ? "true" : undefined}
              data-gretel-correct={cell.correct === undefined ? undefined : String(cell.correct)}
              data-gretel-target={i === next ? "primary" : undefined}
              aria-pressed={isFound}
              aria-label={isFound ? `${cell.caption}, marcado con x` : cell.caption}
              onClick={() => tap(i)}
            >
              <span className="sb-cell__art">
                {cell.illustrationSrc ? (
                  <LivingIllustration src={cell.illustrationSrc} alt="" loading="eager" />
                ) : null}
              </span>
              <svg className="sb-cell__x" viewBox="0 0 100 100" aria-hidden="true">
                <path d="M20 22 C 40 42, 60 62, 80 80" pathLength={1} />
                <path d="M79 20 C 60 40, 40 62, 21 81" pathLength={1} />
              </svg>
            </button>
          );
        })}
      </div>
      <Progress done={found.size} total={total} label="Dibujos con o" />
    </div>
  );
}

type Box = { x: number; y: number; w: number; h: number };
/** Book page 5 radial layout, measured from the source scan (units: 540 × 610). */
const P5_W = 540;
const P5_H = 610;
const P5_BOXES: Box[] = [
  { x: 20, y: 38, w: 130, h: 130 }, // iglú
  { x: 217, y: 8, w: 130, h: 130 }, // oveja
  { x: 405, y: 40, w: 130, h: 130 }, // ojos
  { x: 0, y: 233, w: 132, h: 130 }, // oreja
  { x: 405, y: 233, w: 130, h: 130 }, // olla
  { x: 10, y: 423, w: 132, h: 132 }, // ola (printed example)
  { x: 215, y: 473, w: 130, h: 130 }, // oso
  { x: 405, y: 425, w: 130, h: 130 }, // alas
];
const P5_VOWEL = { x: 282, y: 287, r: 62 };

function edgePoint(box: Box, from: { x: number; y: number }) {
  return {
    x: Math.min(Math.max(from.x, box.x + 6), box.x + box.w - 6),
    y: Math.min(Math.max(from.y, box.y + 6), box.y + box.h - 6),
  };
}
function startPoint(to: { x: number; y: number }) {
  const dx = to.x - P5_VOWEL.x;
  const dy = to.y - P5_VOWEL.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: P5_VOWEL.x + (dx / len) * (P5_VOWEL.r * 0.8),
    y: P5_VOWEL.y + (dy / len) * (P5_VOWEL.r * 0.62),
  };
}

/** Book page 5 — "Traza una línea desde la vocal Oo hasta el dibujo…" */
function LineMatch({
  region,
  pageNumber,
  lessonId,
  activityId,
}: {
  region: PageRegion;
  pageNumber: number;
  lessonId?: string;
  activityId: string;
}) {
  const cells = useMemo(() => region.cells ?? [], [region.cells]);
  const example = Math.max(
    0,
    cells.findIndex((c) => c.caption === region.exampleCaption),
  );
  const correctIdx = useMemo(
    () => cells.map((c, i) => (c.correct && i !== example ? i : -1)).filter((i) => i >= 0),
    [cells, example],
  );
  const [found, setFound] = useState<Set<number>>(() =>
    loadFound(activityId, pageNumber, cells, [example]),
  );
  const [miss, setMiss] = useTransient(760);
  const [pop, setPop] = useTransient(700);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const attempts = useRef(0);
  const total = correctIdx.length;
  const next = correctIdx.find((i) => !found.has(i));
  const complete = found.size >= total;
  const caption = (i?: number) => (typeof i === "number" ? cells[i]?.caption : undefined);
  const disabledByHelp = (i: number) =>
    !!document.getElementById(`sb-box-${pageNumber}-${i}`)?.hasAttribute("disabled");

  const choose = (i: number) => {
    const cell = cells[i];
    if (!cell) return;
    const word = cell.caption ?? "";
    if (i === example || found.has(i)) {
      setPop(i);
      void speakAsGretel(word);
      return;
    }
    attempts.current += 1;
    if (cell.correct) {
      const nextFound = new Set(found).add(i);
      setFound(nextFound);
      saveFound(activityId, nextFound);
      setPop(i);
      const left = total - nextFound.size;
      const after = correctIdx.find((k) => !nextFound.has(k));
      const lines = storybookLines({
        pageNumber,
        word,
        correct: true,
        left,
        nextWord: caption(after),
      });
      gretelEvent("answer:correct", { activityId, pageNumber, perItem: true, lines });
      if (left === 0) {
        playCorrectChord();
        gretelEvent("activity:complete", { activityId, pageNumber, perItem: true, lines });
        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: 1,
            total: 1,
            meta: {
              exercise: `vowel_line_match_${region.id}`,
              completed: true,
              itemCount: total,
              attempt: attempts.current,
              corrected: attempts.current > total,
            },
          });
        }
      } else {
        playItemChime();
      }
      return;
    }
    setMiss(i);
    playWrongBuzz();
    const lines = storybookLines({
      pageNumber,
      word,
      correct: false,
      left: total - found.size,
      nextWord: caption(next),
    });
    gretelEvent("answer:wrong", { activityId, pageNumber, perItem: true, lines });
  };

  const toLocal = (event: ReactPointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * P5_W,
      y: ((event.clientY - rect.top) / rect.height) * P5_H,
    };
  };
  const boxAt = (p: { x: number; y: number }) =>
    P5_BOXES.findIndex(
      (b, i) =>
        i < cells.length &&
        p.x >= b.x &&
        p.x <= b.x + b.w &&
        p.y >= b.y &&
        p.y <= b.y + b.h &&
        !disabledByHelp(i),
    );

  const onVowelDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (complete) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const p = toLocal(event);
    if (p) setDrag(p);
    gretelEvent("listen:start", { activityId, pageNumber });
  };
  const onVowelMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const p = toLocal(event);
    if (!p) return;
    setDrag(p);
    const at = boxAt(p);
    setHover(at >= 0 ? at : null);
  };
  const onVowelUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const p = toLocal(event);
    setDrag(null);
    setHover(null);
    gretelEvent("listen:stop", { activityId, pageNumber });
    const at = p ? boxAt(p) : -1;
    if (at >= 0) choose(at);
  };

  const lineTo = (i: number) => {
    const end = edgePoint(P5_BOXES[i]!, P5_VOWEL);
    return { start: startPoint(end), end };
  };
  const domLines = storybookLines({
    pageNumber,
    left: total - found.size,
    nextWord: caption(next),
  });
  const dragStart = drag ? startPoint(drag) : null;

  return (
    <div
      className="sb-radial"
      data-complete={complete ? "true" : "false"}
      data-gretel-lines={JSON.stringify(domLines)}
    >
      <div ref={stageRef} className="sb-radial__stage" style={{ aspectRatio: `${P5_W} / ${P5_H}` }}>
        <svg className="sb-radial__lines" viewBox={`0 0 ${P5_W} ${P5_H}`} aria-hidden="true">
          {[example, ...found].map((i) => {
            const { start, end } = lineTo(i);
            return (
              <line
                key={i}
                className={i === example ? "sb-line sb-line--example" : "sb-line"}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                pathLength={1}
              />
            );
          })}
          {miss !== null &&
            (() => {
              const { start, end } = lineTo(miss);
              return (
                <line
                  key={`miss-${miss}`}
                  className="sb-line sb-line--miss"
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  pathLength={1}
                />
              );
            })()}
          {drag && dragStart && (
            <line
              className="sb-line sb-line--live"
              x1={dragStart.x}
              y1={dragStart.y}
              x2={drag.x}
              y2={drag.y}
            />
          )}
        </svg>
        {cells.map((cell, i) => {
          const box = P5_BOXES[i];
          if (!box) return null;
          const done = i === example || found.has(i);
          return (
            <button
              key={i}
              id={`sb-box-${pageNumber}-${i}`}
              type="button"
              className="sb-box"
              style={{
                left: `${(box.x / P5_W) * 100}%`,
                top: `${(box.y / P5_H) * 100}%`,
                width: `${(box.w / P5_W) * 100}%`,
                height: `${(box.h / P5_H) * 100}%`,
              }}
              data-word={cell.caption}
              data-found={done ? "true" : undefined}
              data-example={i === example ? "true" : undefined}
              data-miss={miss === i ? "true" : undefined}
              data-pop={pop === i ? "true" : undefined}
              data-hover={hover === i ? "true" : undefined}
              data-gretel-correct={i === example ? undefined : String(Boolean(cell.correct))}
              data-gretel-target={i === next ? "primary" : undefined}
              aria-pressed={done}
              aria-label={
                done ? `${cell.caption}, línea trazada` : `Trazar línea hasta ${cell.caption}`
              }
              onClick={() => choose(i)}
            >
              {cell.illustrationSrc ? (
                <LivingIllustration src={cell.illustrationSrc} alt="" loading="eager" />
              ) : null}
            </button>
          );
        })}
        <div
          className="sb-radial__vowel"
          style={{ left: `${(P5_VOWEL.x / P5_W) * 100}%`, top: `${(P5_VOWEL.y / P5_H) * 100}%` }}
          data-dragging={drag ? "true" : undefined}
          role="img"
          aria-label={`Vocal ${region.letterPair ?? "Oo"}: arrastra desde aquí hasta un dibujo, o toca el dibujo`}
          onPointerDown={onVowelDown}
          onPointerMove={onVowelMove}
          onPointerUp={onVowelUp}
          onPointerCancel={onVowelUp}
        >
          <span>{region.letterPair ?? "Oo"}</span>
        </div>
      </div>
      <Progress done={found.size} total={total} label="Líneas trazadas" />
    </div>
  );
}

export function StorybookWorkbookPage({
  pageNumber,
  lessonNumber,
  regions,
}: {
  pageNumber: number;
  lessonNumber?: number;
  regions: PageRegion[];
}) {
  const ordered = [...regions].sort((a, b) => a.order - b.order);
  const lessonId = lessonNumber ? String(lessonNumber) : undefined;
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), reduceMotion() ? 0 : 60);
    return () => window.clearTimeout(t);
  }, []);
  const body: ReactNode[] = ordered.map((region) => {
    if (region.regionType === "instruction") return <Instruction key={region.id} region={region} />;
    const activityId = `page-${pageNumber}-${region.id}`;
    if (region.regionType === "picture-grid") {
      return (
        <GretelActivity
          key={region.id}
          id={activityId}
          pageNumber={pageNumber}
          kind={region.regionType}
        >
          <MarkGrid
            region={region}
            pageNumber={pageNumber}
            lessonId={lessonId}
            activityId={activityId}
          />
        </GretelActivity>
      );
    }
    if (region.regionType === "vowel-line-match") {
      return (
        <GretelActivity
          key={region.id}
          id={activityId}
          pageNumber={pageNumber}
          kind={region.regionType}
        >
          <LineMatch
            region={region}
            pageNumber={pageNumber}
            lessonId={lessonId}
            activityId={activityId}
          />
        </GretelActivity>
      );
    }
    return null;
  });
  return (
    <PageFrame
      pageNumber={pageNumber}
      lessonNumber={lessonNumber}
      className={`sb-page sb-page--p${pageNumber}${entered ? " is-entered" : ""}`}
    >
      {body}
    </PageFrame>
  );
}
