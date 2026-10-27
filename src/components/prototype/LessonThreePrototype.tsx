import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import layouts from "@/data/page-layouts.json";
import transcription from "@/data/book-transcription/lessons-01-07.json";
import { ActivityContext, type ActivityContextValue } from "@/lib/activity-events";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";
import { DirectPencilConnector } from "@/cartilla/interactions/PencilConnector";
import { WorkbookPageRenderer } from "@/components/cartilla/WorkbookPageRenderer";
import { DrawBoxCanvas } from "@/components/cartilla/DrawBoxCanvas";
import { PageFrame } from "@/components/cartilla/PageFrame";
import { PageCurl } from "@/components/StudentBook/PageCurl";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "@/styles/prototype-lesson-three.css";

type Picture = { caption: string; illustrationSrc: string; correct: boolean };
const grid = layouts.pages["7"].regions.find((r) => r.id === "p7-grid")!.cells as Picture[];
const matching = layouts.pages["8"].regions.find((r) => r.id === "p8-match")!.cells as Picture[];
const writingLines = layouts.pages["9"].regions.filter((r) => r.regionType === "writing-line");
const targets = matching.map((cell, i) => ({
  id: `prototype-p8-${i}`,
  label: cell.caption,
  src: cell.illustrationSrc,
  correct: cell.correct,
  example: cell.caption === transcription.pages["8"].example,
}));

/** No production bus, report, persisted activity state or learner identity escapes this boundary. */
function LocalActivity({
  id,
  active,
  onComplete,
  children,
}: {
  id: string;
  active: boolean;
  onComplete?: (id: string) => void;
  children: ReactNode;
}) {
  const value = useMemo<ActivityContextValue>(
    () => ({
      activityId: id,
      isolated: true,
      isCurrent: () => active,
      onEvent: (type) => {
        if (type === "activity:complete") onComplete?.(id);
      },
    }),
    [id, active, onComplete],
  );
  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

function PictureGrid({ onComplete }: { onComplete: () => void }) {
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<string | null>(null);
  const correctCount = grid.filter((p) => p.correct).length;
  useEffect(() => {
    if (marked.size === correctCount) onComplete();
  }, [marked, correctCount, onComplete]);
  return (
    <div className="prototype-picture-grid">
      {grid.map((cell) => {
        const done = marked.has(cell.caption),
          active = pending === cell.caption;
        return (
          <button
            type="button"
            key={cell.caption}
            className="prototype-picture"
            aria-label={cell.caption}
            aria-pressed={done}
            disabled={done || pending !== null}
            data-marked={done}
            onClick={() => setPending(cell.caption)}
          >
            <img src={cell.illustrationSrc} alt="" draggable={false} />
            {(active || done) && (
              <span className="prototype-picture__mark" aria-hidden="true">
                <WorkbookPencilMark
                  markType="circle"
                  round
                  itemId={cell.caption}
                  completeOnSuccess={false}
                  isCorrect={cell.correct}
                  status={done ? "correct" : undefined}
                  onSuccess={() => {
                    setMarked((prev) => new Set(prev).add(cell.caption));
                    setPending(null);
                  }}
                  onRetry={() => setPending(null)}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LessonThreePrototype() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [finished, setFinished] = useState(false);
  const [turn, setTurn] = useState<{ to: number; direction: "next" | "prev" } | null>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const dragProgressRef = useRef(0);
  const navigationLock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useReducedMotion();
  const markDone = useCallback(
    (id: string) => setDone((prev) => (prev.has(id) ? prev : new Set(prev).add(id))),
    [],
  );
  const completeGrid = useCallback(() => markDone("prototype-p7"), [markDone]);
  const pageComplete =
    index === 0
      ? done.has("prototype-p7")
      : index === 1
        ? done.has("prototype-p8")
        : [...writingLines.map((r) => r.id), "prototype-p9-draw"].every((id) => done.has(id));
  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (navigationLock.current || (direction === "next" && !pageComplete)) return;
      const to = index + (direction === "next" ? 1 : -1);
      if (to < 0 || to > 2) return;
      if (reduced) {
        setIndex(to);
        window.scrollTo({ top: 0 });
        return;
      }
      navigationLock.current = true;
      setTurn({ to, direction });
      timer.current = setTimeout(() => {
        setIndex(to);
        setTurn(null);
        navigationLock.current = false;
        window.scrollTo({ top: 0 });
      }, 2300);
    },
    [index, pageComplete, reduced],
  );
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest("button,input,textarea,[contenteditable]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(event.key === "ArrowRight" ? "next" : "prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
  const leaf = turn?.direction === "prev" ? turn.to : index;
  return (
    <main className="lesson-prototype">
      <header className="prototype-heading">
        <span>Lección 3 · Aa</span>
        <span>Vista previa</span>
      </header>
      <div className="prototype-book" data-prototype-page={index + 7} data-turning={Boolean(turn)}>
        {[7, 8, 9].map((page, i) => {
          const visible = i === index || i === turn?.to;
          return (
            <div
              key={page}
              ref={i === leaf ? leafRef : undefined}
              className="prototype-leaf"
              aria-hidden={i !== index}
              inert={i !== index || Boolean(turn)}
              style={{
                  position: visible ? "relative" : "absolute",
                visibility: visible ? "visible" : "hidden",
                zIndex: i === leaf ? 2 : 1,
              }}
            >
              <PageFrame pageNumber={page} lessonNumber={3} paperOnly className="prototype-paper">
                <LocalActivity
                  id={`prototype-p${page}`}
                  active={i === index && !turn}
                  onComplete={markDone}
                >
                  {page === 7 && (
                    <>
                      <p className="prototype-instruction">
                        <strong>{transcription.pages["7"].label}</strong>{" "}
                        {transcription.pages["7"].instruction}
                      </p>
                      <PictureGrid onComplete={completeGrid} />
                    </>
                  )}
                  {page === 8 && (
                    <>
                      <p className="prototype-instruction">
                        <strong>{transcription.pages["8"].label}</strong>{" "}
                        {transcription.pages["8"].instruction}
                      </p>
                      <DirectPencilConnector
                        pageKey="prototype-lesson-3-p8"
                        mode="mark"
                        centerLabel="Aa"
                        targets={targets}
                      />
                    </>
                  )}
                  {page === 9 && (
                    <>
                      <p className="prototype-instruction">
                        {transcription.pages["9"].instruction}
                      </p>
                      <WorkbookPageRenderer
                        pageNumber={9}
                        sourceWritingLines={writingLines}
                        renderWritingInput={(line, lineIndex) => (
                          <LocalActivity
                            id={line.id}
                            active={i === index && !turn}
                            onComplete={markDone}
                          >
                            <div
                              className="prototype-writing-input"
                              role="group"
                              aria-label={`Renglón ${lineIndex + 1}`}
                            >
                              <DrawBoxCanvas regionId={`prototype-${line.id}`} />
                            </div>
                          </LocalActivity>
                        )}
                      />
                      <p className="prototype-instruction prototype-draw-instruction">
                        {transcription.pages["9"].drawInstruction}
                      </p>
                      <LocalActivity
                        id="prototype-p9-draw"
                        active={i === index && !turn}
                        onComplete={markDone}
                      >
                        <div className="prototype-drawing">
                          <DrawBoxCanvas regionId="prototype-p9-draw" />
                        </div>
                      </LocalActivity>
                    </>
                  )}
                </LocalActivity>
              </PageFrame>
            </div>
          );
        })}
        <PageCurl
          phase={turn ? "zoom" : "idle"}
          direction={turn?.direction ?? null}
          leafRef={leafRef}
          dragProgressRef={dragProgressRef}
          liftMs={300}
          turnMs={2000}
        />
      </div>
      <nav className="prototype-navigation" aria-label="Páginas de la lección">
        <button
          type="button"
          onClick={() => navigate("prev")}
          disabled={index === 0 || Boolean(turn)}
        >
          Anterior
        </button>
        <span aria-live="polite">{index + 1} de 3</span>
        {index < 2 ? (
          <button
            type="button"
            onClick={() => navigate("next")}
            disabled={!pageComplete || Boolean(turn)}
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            disabled={!pageComplete || finished}
            onClick={() => setFinished(true)}
          >
            Listo
          </button>
        )}
      </nav>
      <p className="prototype-progress" role="status">
        {finished
          ? "¡Terminaste la lección!"
          : pageComplete
            ? "Página completa"
            : index === 2
              ? "Escribe en los cuatro renglones y haz tu dibujo para seguir."
              : "Termina la actividad de esta página para seguir."}
      </p>
    </main>
  );
}
