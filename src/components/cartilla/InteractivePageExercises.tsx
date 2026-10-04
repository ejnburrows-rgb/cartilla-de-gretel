import { useEffect, useRef, useState } from "react";
import "@/styles/interactive-exercises.css";
import type { PageGridCell, PageRegion } from "@/lib/book-faithful";
import { useActivityEvents, useActivityState } from "@/lib/activity-events";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { WorkbookPencilMark } from "./WorkbookPencilMark";

/** Pseudo-random per-cell animation offset so a grid never floats in lockstep. */
function floatDelay(index: number): string {
  return `${((index * 37) % 47) / 10}s`;
}

function ArtOrPending({ cell }: { cell: PageGridCell }) {
  if (cell.illustrationSrc) {
    return (
      <LivingIllustration src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />
    );
  }
  return (
    <div
      className="fp-art-pending"
      role="img"
      aria-label={
        cell.caption
          ? `Ilustración pendiente: ${cell.caption}`
          : "Ilustración pendiente"
      }
    >
      {cell.caption ? (
        <span className="fp-art-pending__word">{cell.caption}</span>
      ) : null}
      <span>pendiente</span>
    </div>
  );
}

type Grade = "correct" | "wrong" | "missed" | null;

/** How a picked picture is marked — follows the printed verb of the page. */
export type PictureMark = "circle" | "x";
export function pictureMarkFor(instruction?: string): PictureMark {
  return instruction && /marca con una x/i.test(instruction) ? "x" : "circle";
}

function gradeOf(picked: boolean, correct: boolean | undefined): Grade {
  if (correct === undefined) return null;
  if (picked && correct) return "correct";
  if (picked && !correct) return "wrong";
  if (!picked && correct) return "missed";
  return null;
}

function Cell({
  cell,
  index,
  picked,
  grade,
  disabled,
  onToggle,
  mark = "circle",
}: {
  cell: PageGridCell;
  index: number;
  picked: boolean;
  grade: Grade;
  disabled: boolean;
  onToggle: () => void;
  /** Printed gesture: "Circula…" draws a ring, "Marca con una x…" draws an X. */
  mark?: PictureMark;
}) {
  const flagged = cell.correct === undefined;
  const classes = [
    "fp-ix-cell",
    mark === "x" ? "fp-ix-cell--mark-x" : "",
    picked ? "picked" : "",
    grade === "correct" ? "graded-correct" : "",
    grade === "wrong" ? "graded-wrong" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={classes}
      data-gretel-correct={cell.correct === undefined ? undefined : String(cell.correct)}
      data-flagged={flagged ? "true" : undefined}
      disabled={flagged || disabled}
      style={{ ["--ix-float-delay" as string]: floatDelay(index) }}
      onClick={onToggle}
      aria-pressed={picked}
    >
      <svg
        className="fp-ix-cell__lasso"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {mark === "x" ? (
          <>
            <path d="M18 18 L82 82" />
            <path d="M82 18 L18 82" />
          </>
        ) : (
          <ellipse cx="50" cy="48" rx="42" ry="38" />
        )}
      </svg>
      <ArtOrPending cell={cell} />
      <span className="fp-ix-cell__badge" aria-hidden="true" />
    </button>
  );
}

interface ExerciseProps {
  region: PageRegion;
  accent: string;
  lessonId?: string;
}

/** "Presiona los dibujos..." — tap each guessed cell, grade on check. */
export function InteractivePictureGrid({
  region,
  accent,
  lessonId,
  precise = false,
  mark = "circle",
}: ExerciseProps & { precise?: boolean; mark?: PictureMark }) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const cells = region.cells ?? [];
  const columns = region.columns ?? 4;
  const [picked, setPicked] = useActivityState<Set<number>>("picked", new Set());
  const [graded, setGraded] = useActivityState("graded", false);
  const [solved, setSolved] = useActivityState("solved", false);
  const [validated, setValidated] = useActivityState<Set<number>>("validated", new Set());
  const [attempts, setAttempts] = useState(0);

  const restoredSolved = useRef(solved);
  useEffect(() => {
    if (solved && restoredSolved.current) gretelEvent("activity:complete", { restored: true });
  }, [solved, gretelEvent]);

  const toggle = (i: number) => {
    if (graded || validated.has(i)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const targets = cells.map((entry, i) => ({ key: i, correct: entry.correct }));
  const remaining = targets.filter(t => t.correct === true && !picked.has(t.key)).length;
  const isDirectPencilMode = region.id === "p1-grid" || region.id?.startsWith("p1-");
  const [markingCells, setMarkingCells] = useState<Map<number, boolean>>(new Map());

  const totalCorrectRequired = cells.filter((cell) => cell.correct === true).length;

  const handlePencilTap = (i: number) => {
    if (validated.has(i) || markingCells.size > 0) return;
    const cell = cells[i];
    if (!cell || cell.correct === undefined) return;
    setMarkingCells(new Map([[i, cell.correct === true]]));
  };

  const handleCellCorrect = (i: number) => {
    const next = new Set(validated).add(i);
    const complete = next.size === totalCorrectRequired;
    setValidated(next);
    setSolved(complete);
    playCorrectChord();
    if (complete && lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: totalCorrectRequired,
        total: totalCorrectRequired + attempts,
        meta: {
          exercise: `picture_grid_${region.id}`,
          completed: true,
          itemCount: cells.filter((cell) => cell.correct !== undefined).length,
          attempt: attempts + 1,
          corrected: attempts > 0,
        },
      });
    }
    setMarkingCells(new Map());
  };

  const handleCellRetry = () => {
    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    playWrongBuzz();
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: validated.size,
        total: totalCorrectRequired + nextAttempt,
        meta: {
          exercise: `picture_grid_${region.id}`,
          completed: false,
          itemCount: cells.filter((cell) => cell.correct !== undefined).length,
          attempt: nextAttempt,
          corrected: nextAttempt > 1,
        },
      });
    }
    setMarkingCells(new Map());
  };

  const check = () => {
    setValidated(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key)));
    setGraded(true);
    let allCorrect = true;
    cells.forEach((cell, i) => {
      if (cell.correct === undefined) return;
      const g = gradeOf(picked.has(i), cell.correct);
      if (g === "wrong" || g === "missed") allCorrect = false;
    });
    setSolved(allCorrect);
    setAttempts((n) => n + 1);
    gretelEvent(allCorrect ? "answer:correct" : "answer:wrong");
    if (allCorrect) {
      playCorrectChord();
      gretelEvent("activity:complete");
    } else playWrongBuzz();
    if (lessonId) {
      const gradable = cells.filter((c) => c.correct !== undefined).length;
      recordEvent({
        lessonId,
        kind: "exercise",
        score: targets.filter(t => t.correct === true && picked.has(t.key)).length,
        total: targets.filter(t => t.correct === true || (t.correct === false && picked.has(t.key))).length,
        meta: {
          exercise: `picture_grid_${region.id}`,
          completed: allCorrect,
          itemCount: gradable,
          attempt: attempts + 1,
          corrected: attempts > 0,
        },
      });
    }
  };

  const rows: PageGridCell[][] = [];
  for (let i = 0; i < cells.length; i += columns)
    rows.push(cells.slice(i, i + columns));

  const exactColumns = precise && region.gridColumnFracs?.length === columns
    ? region.gridColumnFracs.map((fraction) => `${fraction * 100}%`).join(" ")
    : undefined;
  const exactRows = precise && region.gridRowFracs?.length === rows.length
    ? region.gridRowFracs.map((fraction) => `${fraction * 100}%`).join(" ")
    : undefined;

  return (
    <div className={`fp-ix-grid${precise ? " fp-ix-grid--precise" : ""}`} style={{ ["--ix-accent" as string]: accent, gridTemplateRows: exactRows }}>
      {rows.map((row, r) => (
        <div
          key={r}
          className="fp-ix-row"
          style={{ gridTemplateColumns: exactColumns ?? `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {row.map((cell, c) => {
            const i = r * columns + c;
            const isMarking = markingCells.has(i);
            const isVal = validated.has(i);
            const isCorrect = isMarking ? markingCells.get(i) : isVal;

            if (isDirectPencilMode) {
              return (
                <button
                  key={i}
                  type="button"
                  className={`fp-ix-cell relative ${isVal ? "graded-correct" : ""}`}
                  style={{ ["--ix-float-delay" as string]: floatDelay(i) }}
                  onClick={() => handlePencilTap(i)}
                  disabled={cell.correct === undefined || isVal || (markingCells.size > 0 && !isMarking)}
                  aria-pressed={isVal || isMarking}
                >
                  <ArtOrPending cell={cell} />
                  {(isMarking || isVal) && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                      <WorkbookPencilMark
                        markType={mark}
                        isCorrect={isCorrect}
                        itemId={`${region.id}-${i}`}
                        completeOnSuccess={Boolean(isCorrect) && validated.size + 1 === totalCorrectRequired}
                        status={isVal && !isMarking ? "correct" : undefined}
                        onSuccess={() => handleCellCorrect(i)}
                        onRetry={handleCellRetry}
                      />
                    </div>
                  )}
                </button>
              );
            }

            return (
              <Cell
                key={i}
                cell={cell}
                index={i}
                picked={picked.has(i)}
                grade={graded || validated.has(i) ? gradeOf(picked.has(i), cell.correct) : null}
                disabled={graded || validated.has(i)}
                onToggle={() => toggle(i)}
                mark={mark}
              />
            );
          })}
        </div>
      ))}
      {!isDirectPencilMode && graded && !solved && <p role="status">Revisa las selecciones marcadas. Faltan {remaining} respuestas.</p>}
      {!isDirectPencilMode && (
        <div className="fp-ix-check-row">
          <button
            type="button"
            className="fp-ix-check-btn"
            onClick={check}
            disabled={graded || picked.size === 0}
          >
            {solved ? "Completado" : "Comprobar"}
          </button>
          {graded && !solved && (
            <button
              type="button"
              className="fp-ix-check-btn"
              onClick={() => { setPicked(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key))); setGraded(false); }}
            >
              Corregir respuestas
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Digital vowel cue: keep the printed vowel visible, but use the natural
 * on-screen action — the child taps the matching picture directly. */
function VowelLetterLabel({
  letter,
  precise = false,
}: {
  letter: string;
  precise?: boolean;
}) {
  return (
    <span
      className="fp-ix-pick__letter"
      aria-label={`Vocal ${letter}`}
    >
      {precise ? letter : `${letter.toUpperCase()}${letter}`}
    </span>
  );
}

/** Direct-tap picture target for one vowel row. */
function VowelPictureCell({
  cell,
  index,
  grade,
  wrong,
  disabled,
  onTap,
}: {
  cell: PageGridCell;
  index: number;
  grade: Grade;
  wrong: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  const flagged = cell.correct === undefined;
  const classes = [
    "fp-ix-cell",
    grade === "correct" ? "graded-correct" : "",
    wrong ? "graded-wrong-flash" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={classes}
      data-gretel-correct={cell.correct === undefined ? undefined : String(cell.correct)}
      data-flagged={flagged ? "true" : undefined}
      disabled={flagged || disabled}
      style={{ ["--ix-float-delay" as string]: floatDelay(index) }}
      onClick={onTap}
      aria-label={cell.caption ?? "dibujo"}
    >
      <ArtOrPending cell={cell} />
      <span className="fp-ix-cell__badge" aria-hidden="true" />
    </button>
  );
}

/** The printed page asks the child to identify the picture for each vowel.
 * On screen, translate that objective into a direct tap: no drag or extra
 * vowel-selection step is required. */
export function InteractiveVowelPickOne({
  region,
  accent,
  lessonId,
  precise = false,
}: ExerciseProps & { precise?: boolean }) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const rows = region.vowelRows ?? [];
  const exactRows = precise && region.gridRowFracs?.length === rows.length
    ? region.gridRowFracs.map((fraction) => `${fraction * 100}%`).join(" ")
    : undefined;
  const exactColumns = precise && region.gridColumnFracs?.length === 4
    ? region.gridColumnFracs
    : undefined;

  const [correctRows, setCorrectRows] = useActivityState<Set<number>>("correctRows", new Set());
  const [markingCells, setMarkingCells] = useState<Map<string, boolean>>(new Map());
  const [incorrectAttempts, setIncorrectAttempts] = useActivityState("incorrectAttempts", 0);
  const [completed, setCompleted] = useState(false);
  const restoredComplete = useRef(rows.length > 0 && correctRows.size === rows.length);

  useEffect(() => {
    if (rows.length > 0 && correctRows.size === rows.length && !completed) {
      setCompleted(true);
      if (restoredComplete.current) {
        gretelEvent("activity:complete", { restored: true });
      } else if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: rows.length,
          total: rows.length + incorrectAttempts,
          meta: { exercise: `vowel_pick_one_${region.id}`, completed: true, attemptCorrect: true },
        });
      }
    }
  }, [correctRows, rows.length, completed, lessonId, region.id, incorrectAttempts, gretelEvent, recordEvent]);

  const attempt = (rowIdx: number, cellIdx: number) => {
    if (correctRows.has(rowIdx) || markingCells.size > 0) return;
    const cell = rows[rowIdx]?.cells[cellIdx];
    if (!cell || cell.correct === undefined) return;
    setMarkingCells(new Map([[`${rowIdx}-${cellIdx}`, cell.correct === true]]));
  };

  const handleCellCorrect = (rowIdx: number) => {
    setCorrectRows((prev) => new Set(prev).add(rowIdx));
    playCorrectChord();
    setMarkingCells(new Map());
  };

  const handleCellRetry = () => {
    const nextAttempt = incorrectAttempts + 1;
    setIncorrectAttempts(nextAttempt);
    playWrongBuzz();
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: correctRows.size,
        total: rows.length + nextAttempt,
        meta: { exercise: `vowel_pick_one_${region.id}`, completed: false, attemptCorrect: false },
      });
    }
    setMarkingCells(new Map());
  };

  return (
    <div
      className={`fp-ix-pick${precise ? " fp-ix-pick--precise" : ""}`}
      style={{ ["--ix-accent" as string]: accent, gridTemplateRows: exactRows }}
    >
      {rows.map((row, r) => (
        <div
          key={r}
          className="fp-ix-pick__row"
          style={exactColumns ? { gridTemplateColumns: `${exactColumns[0] * 100}% 1fr` } : undefined}
        >
          <VowelLetterLabel letter={row.letter} precise={precise} />
          <div
            className="fp-ix-pick__cells"
            style={exactColumns ? {
              gridTemplateColumns: exactColumns.slice(1)
                .map((fraction) => `${fraction / (1 - exactColumns[0]) * 100}%`)
                .join(" "),
            } : undefined}
          >
            {row.cells.map((cell, cellIdx) => {
              const key = `${r}-${cellIdx}`;
              const isMarking = markingCells.has(key);
              const isRowCorrect = correctRows.has(r);
              const isThisCorrect = isRowCorrect && Boolean(cell.correct);
              const isCorrectMark = isMarking ? markingCells.get(key) : isThisCorrect;

              return (
                <button
                  key={cellIdx}
                  type="button"
                  className={`fp-ix-cell relative ${isThisCorrect ? "graded-correct" : ""}`}
                  style={{ ["--ix-float-delay" as string]: floatDelay(r * 3 + cellIdx) }}
                  disabled={cell.correct === undefined || isRowCorrect || (markingCells.size > 0 && !isMarking)}
                  onClick={() => attempt(r, cellIdx)}
                  aria-label={cell.caption ?? "dibujo"}
                >
                  <ArtOrPending cell={cell} />
                  {(isMarking || isThisCorrect) && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                      <WorkbookPencilMark
                        markType="circle"
                        isCorrect={isCorrectMark}
                        itemId={`${region.id}-${r}-${cellIdx}`}
                        completeOnSuccess={Boolean(isCorrectMark) && correctRows.size + 1 === rows.length}
                        status={isThisCorrect && !isMarking ? "correct" : undefined}
                        onSuccess={() => handleCellCorrect(r)}
                        onRetry={handleCellRetry}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** "Traza una línea de la vocal al dibujo..." — no distractors, tap to connect each pair. */
export function InteractiveVowelMatchAll({
  region,
  accent,
  lessonId,
}: ExerciseProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const pairs = region.vowelPairs ?? [];
  const [linked, setLinked] = useActivityState<Set<number>>("picked", new Set());

  useEffect(() => { if (pairs.length > 0 && linked.size === pairs.length) gretelEvent("activity:complete", { restored: true }); }, [linked, pairs.length, gretelEvent]);

  const connect = (i: number) => {
    if (linked.has(i)) return;
    const next = new Set(linked);
    next.add(i);
    setLinked(next);
    gretelEvent("answer:correct");
    if (next.size === pairs.length) {
      gretelEvent("activity:complete");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: pairs.length,
          total: pairs.length,
          meta: { exercise: `vowel_match_all_${region.id}`, completed: true },
        });
      }
    }
  };

  return (
    <div
      className="fp-ix-match-all"
      style={{ ["--ix-accent" as string]: accent }}
    >
      {pairs.map((pair, i) => (
        <div
          key={i}
          className={`fp-ix-match-row${linked.has(i) ? " linked" : ""}`}
        >
          <button
            type="button"
            className="fp-ix-letter-btn"
            onClick={() => connect(i)}
          >
            {pair.letter.toUpperCase()}
            {pair.letter}
          </button>
          <span className="fp-ix-track" aria-hidden="true">
            <svg viewBox="0 0 100 4" preserveAspectRatio="none">
              <path className="fp-ix-track__dash" d="M0,2 L100,2" />
            </svg>
            <svg viewBox="0 0 100 4" preserveAspectRatio="none">
              <path className="fp-ix-track__line" d="M0,2 L100,2" />
            </svg>
          </span>
          <button
            type="button"
            className="fp-ix-cell fp-ix-match-cell"
            style={{ ["--ix-float-delay" as string]: floatDelay(i) }}
            onClick={() => connect(i)}
          >
            <ArtOrPending cell={pair} />
          </button>
        </div>
      ))}
    </div>
  );
}

/** "Encierra en un círculo la sílaba correspondiente" — every word in a row
 * genuinely contains the target syllable (no distractors); tap each word to
 * mark it found, grade on check whether all got marked. */
export function InteractiveSyllableMatch({
  region,
  accent,
  lessonId,
}: ExerciseProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const rows = region.matchRows ?? [];
  const [picked, setPicked] = useActivityState<Set<string>>("picked", new Set());
  const [graded, setGraded] = useActivityState("graded", false);
  const [solved, setSolved] = useActivityState("solved", false);
  const [validated, setValidated] = useActivityState<Set<string>>("validated", new Set());
  const [attempts, setAttempts] = useState(0);
  const total = rows.reduce((n, row) => n + row.length, 0);

  useEffect(() => { if (solved) gretelEvent("activity:complete", { restored: true }); }, [solved, gretelEvent]);

  const toggle = (key: string) => {
    if (graded || validated.has(key)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const targets = rows.flatMap((row, r) => row.map((entry, w) => ({ key: `${r}-${w}`, correct: entry.correct })));
  const remaining = targets.filter(t => t.correct === true && !picked.has(t.key)).length;
  const check = () => {
    setValidated(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key)));
    setGraded(true);
    let allCorrect = true;
    rows.forEach((row, r) => {
      row.forEach((entry, w) => {
        if (entry.correct === undefined) return;
        const g = gradeOf(picked.has(`${r}-${w}`), entry.correct);
        if (g === "wrong" || g === "missed") allCorrect = false;
      });
    });
    setSolved(allCorrect);
    setAttempts((n) => n + 1);
    gretelEvent(allCorrect ? "answer:correct" : "answer:wrong");
    if (allCorrect) {
      playCorrectChord();
      gretelEvent("activity:complete");
    } else playWrongBuzz();
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: targets.filter(t => t.correct === true && picked.has(t.key)).length,
        total: targets.filter(t => t.correct === true || (t.correct === false && picked.has(t.key))).length,
        meta: {
          exercise: `syllable_match_${region.id}`,
          completed: allCorrect,
          itemCount: total,
          attempt: attempts + 1,
          corrected: attempts > 0,
        },
      });
    }
  };

  return (
    <div
      className="fp-ix-syllable"
      style={{ ["--ix-accent" as string]: accent }}
    >
      <div className="fp-ix-syllable__top">
        <span className="fp-ix-syllable__label">{region.syllable}</span>
        <div className="fp-ix-syllable__rows">
          {rows.map((row, r) => (
            <div key={r} className="fp-ix-syllable__row">
              {row.map((entry, w) => {
                const key = `${r}-${w}`;
                const isPicked = picked.has(key);
                const g = graded || validated.has(key) ? gradeOf(isPicked, entry.correct) : null;
                const flagged = entry.correct === undefined;
                const classes = [
                  "fp-ix-syllable__word",
                  isPicked ? "picked" : "",
                  g === "correct" ? "graded-correct" : "",
                  g === "wrong" ? "graded-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={key}
                    type="button"
                    className={classes}
                    data-gretel-correct={entry.correct === undefined ? undefined : String(entry.correct)}
                    disabled={flagged || graded || validated.has(key)}
                    onClick={() => toggle(key)}
                  >
                    {entry.illustrationSrc && (
                      <LivingIllustration
                        src={entry.illustrationSrc}
                        alt={entry.word}
                        className="fp-ix-syllable__img"
                        loading="lazy"
                      />
                    )}
                    <span>{entry.word}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {graded && !solved && <p role="status">Revisa las selecciones marcadas. Faltan {remaining} respuestas.</p>}
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={graded || picked.size === 0}
        >
          {solved ? "Completado" : "Comprobar"}
        </button>
        {graded && !solved && (
          <button
            type="button"
            className="fp-ix-check-btn"
            onClick={() => { setPicked(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key))); setGraded(false); }}
          >
            Corregir respuestas
          </button>
        )}
      </div>
    </div>
  );
}

/** "Completa las palabras con la sílaba correcta" — tap one choice per item, grade on check. */
export function InteractiveFillInBlank({
  region,
  accent,
  lessonId,
}: ExerciseProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const items = region.fillItems ?? [];
  const [picked, setPicked] = useActivityState<Record<number, number>>("picked", {});
  const [graded, setGraded] = useActivityState("graded", false);
  const [solved, setSolved] = useActivityState("solved", false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => { if (solved) gretelEvent("activity:complete", { restored: true }); }, [solved, gretelEvent]);

  const pick = (itemIdx: number, choiceIdx: number) => {
    if (items[itemIdx]?.choices[picked[itemIdx]]?.correct) return;
    const next = { ...picked, [itemIdx]: choiceIdx };
    setPicked(next); setGraded(true);
    const correct = items[itemIdx]?.choices[choiceIdx]?.correct === true;
    const gradable = items.filter(item => item.choices.some(c => c.correct));
    const score = items.filter((item, i) => item.choices[next[i]]?.correct).length;
    const complete = gradable.length > 0 && score === gradable.length;
    setSolved(complete); setAttempts(n => n + 1);
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    if (correct) playCorrectChord(); else playWrongBuzz();
    if (complete) gretelEvent("activity:complete");
    if (lessonId) recordEvent({ lessonId, kind: "exercise", score, total: gradable.length,
      meta: { exercise: `fill_in_blank_${region.id}`, completed: complete, attemptCorrect: correct, attempt: attempts + 1 } });
  };

  return (
    <div className={`fp-ix-fill${region.columns ? " fp-ix-fill--book-grid" : ""}`} style={{ ["--ix-accent" as string]: accent, ["--fill-columns" as string]: region.columns }}>
      {items.map((item, i) => {
        const flagged = !item.choices.some((c) => c.correct);
        return (
          <div
            key={i}
            className={`fp-ix-fill__item${flagged ? " fp-ix-fill__item--flagged" : ""}`}
          >
            {item.illustrationSrc && (
              <LivingIllustration
                src={item.illustrationSrc}
                alt={item.wordBox}
                className="fp-ix-fill__img"
                loading="lazy"
              />
            )}
            <span className="fp-ix-fill__wordbox">{item.wordBox}</span>
            <span className="fp-ix-fill__blank">
              {picked[i] === undefined
                ? item.blank
                : item.blank.replace("___", item.choices[picked[i]]?.text ?? "___")}
            </span>
            <div className="fp-ix-fill__choices">
              {item.choices.map((choice, c) => {
                const isPicked = picked[i] === c;
                const g = graded ? gradeOf(isPicked, choice.correct === true) : null;
                const classes = [
                  "fp-ix-fill__choice",
                  isPicked ? "picked" : "",
                  g === "correct" ? "graded-correct" : "",
                  g === "wrong" ? "graded-wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={c}
                    type="button"
                    className={classes}
                    data-gretel-correct={flagged ? undefined : String(choice.correct === true)}
                    disabled={flagged || items[i].choices[picked[i]]?.correct === true}
                    onClick={() => pick(i, c)}
                  >
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {graded && <p role="status">{solved ? "Completado" : items.some((item, i) => picked[i] !== undefined && !item.choices[picked[i]]?.correct) ? "Revisa la opción marcada e inténtalo otra vez." : "Bien. Sigue con la siguiente palabra."}</p>}
    </div>
  );
}

/** "Traza una línea desde la vocal Xx hasta el dibujo..." — tap the cells that start with Xx, grade on check. */
export function InteractiveVowelLineMatch({
  region,
  accent,
  lessonId,
}: ExerciseProps) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const cells = region.cells ?? [];
  const [picked, setPicked] = useActivityState<Set<number>>("picked", new Set());
  const [graded, setGraded] = useActivityState("graded", false);
  const [solved, setSolved] = useActivityState("solved", false);
  const [validated, setValidated] = useActivityState<Set<number>>("validated", new Set());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => { if (solved) gretelEvent("activity:complete", { restored: true }); }, [solved, gretelEvent]);

  const toggle = (i: number) => {
    if (graded || validated.has(i)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const targets = cells.map((entry, i) => ({ key: i, correct: entry.correct }));
  const remaining = targets.filter(t => t.correct === true && !picked.has(t.key)).length;
  const check = () => {
    setValidated(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key)));
    setGraded(true);
    let allCorrect = true;
    cells.forEach((cell, i) => {
      const g = gradeOf(picked.has(i), cell.correct);
      if (g === "wrong" || g === "missed") allCorrect = false;
    });
    setSolved(allCorrect);
    setAttempts((n) => n + 1);
    gretelEvent(allCorrect ? "answer:correct" : "answer:wrong");
    if (allCorrect) {
      playCorrectChord();
      gretelEvent("activity:complete");
    } else playWrongBuzz();
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: targets.filter(t => t.correct === true && picked.has(t.key)).length,
        total: targets.filter(t => t.correct === true || (t.correct === false && picked.has(t.key))).length,
        meta: {
          exercise: `vowel_line_match_${region.id}`,
          completed: allCorrect,
          itemCount: cells.length,
          attempt: attempts + 1,
          corrected: attempts > 0,
        },
      });
    }
  };

  return (
    <div
      className="fp-ix-line-match"
      style={{ ["--ix-accent" as string]: accent }}
    >
      <div
        className="fp-ix-row"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        {cells.map((cell, i) => (
          <Cell
            key={i}
            cell={cell}
            index={i}
            picked={picked.has(i)}
            grade={graded || validated.has(i) ? gradeOf(picked.has(i), cell.correct) : null}
            disabled={graded || validated.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
      {graded && !solved && <p role="status">Revisa las selecciones marcadas. Faltan {remaining} respuestas.</p>}
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={graded || picked.size === 0}
        >
          {solved ? "Completado" : "Comprobar"}
        </button>
        {graded && !solved && (
          <button
            type="button"
            className="fp-ix-check-btn"
            onClick={() => { setPicked(new Set(targets.filter(t => t.correct === true && picked.has(t.key)).map(t => t.key))); setGraded(false); }}
          >
            Corregir respuestas
          </button>
        )}
      </div>
    </div>
  );
}
