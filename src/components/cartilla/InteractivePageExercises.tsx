import { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import "@/styles/interactive-exercises.css";
import type { PageGridCell, PageRegion } from "@/lib/book-faithful";
import { recordEvent } from "@/lib/student-session";

/** Pseudo-random per-cell animation offset so a grid never floats in lockstep. */
function floatDelay(index: number): string {
  return `${((index * 37) % 47) / 10}s`;
}

function ArtOrPending({ cell }: { cell: PageGridCell }) {
  if (cell.illustrationSrc) {
    return <img src={cell.illustrationSrc} alt={cell.caption ?? ""} loading="lazy" />;
  }
  return (
    <div
      className="fp-art-pending"
      role="img"
      aria-label={cell.caption ? `Ilustración pendiente: ${cell.caption}` : "Ilustración pendiente"}
    >
      {cell.caption ? <span className="fp-art-pending__word">{cell.caption}</span> : null}
      <span>pendiente</span>
    </div>
  );
}

type Grade = "correct" | "wrong" | "missed" | null;

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
}: {
  cell: PageGridCell;
  index: number;
  picked: boolean;
  grade: Grade;
  disabled: boolean;
  onToggle: () => void;
}) {
  const flagged = cell.correct === undefined;
  const classes = [
    "fp-ix-cell",
    picked ? "picked" : "",
    grade === "correct" ? "graded-correct" : "",
    grade === "wrong" ? "graded-wrong" : "",
    grade === "missed" ? "graded-missed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={classes}
      data-flagged={flagged ? "true" : undefined}
      disabled={flagged || disabled}
      style={{ ["--ix-float-delay" as string]: floatDelay(index) }}
      onClick={onToggle}
    >
      <svg className="fp-ix-cell__lasso" viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="48" rx="42" ry="38" />
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
export function InteractivePictureGrid({ region, accent, lessonId }: ExerciseProps) {
  const cells = region.cells ?? [];
  const columns = region.columns ?? 4;
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [graded, setGraded] = useState(false);

  const toggle = (i: number) => {
    if (graded) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const check = () => {
    setGraded(true);
    let allCorrect = true;
    cells.forEach((cell, i) => {
      if (cell.correct === undefined) return;
      const g = gradeOf(picked.has(i), cell.correct);
      if (g === "wrong" || g === "missed") allCorrect = false;
    });


    if (lessonId) {
      const gradable = cells.filter((c) => c.correct !== undefined).length;
      recordEvent({
        lessonId,
        kind: "exercise",
        score: allCorrect ? 1 : 0,
        total: gradable,
        meta: { exercise: `picture_grid_${region.id}`, completed: true },
      });
    }
  };

  const rows: PageGridCell[][] = [];
  for (let i = 0; i < cells.length; i += columns) rows.push(cells.slice(i, i + columns));

  return (
    <div className="fp-ix-grid" style={{ ["--ix-accent" as string]: accent }}>
      {rows.map((row, r) => (
        <div
          key={r}
          className="fp-ix-row"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {row.map((cell, c) => {
            const i = r * columns + c;
            return (
              <Cell
                key={i}
                cell={cell}
                index={i}
                picked={picked.has(i)}
                grade={graded ? gradeOf(picked.has(i), cell.correct) : null}
                disabled={graded}
                onToggle={() => toggle(i)}
              />
            );
          })}
        </div>
      ))}
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={graded || picked.size === 0}
        >
          Comprobar
        </button>
      </div>
    </div>
  );
}

/** The draggable vowel-letter chip for one row of InteractiveVowelPickOne.
 * Real pointer/touch drag via dnd-kit; also a plain tappable/focusable
 * button so "Presiona el dibujo..." (the real printed instruction) stays
 * true even for students who tap instead of drag. */
function DraggableVowelLetter({
  rowIdx,
  letter,
  locked,
  selected,
  onSelect,
}: {
  rowIdx: number;
  letter: string;
  locked: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `vp-letter-${rowIdx}`,
    data: { rowIdx },
    disabled: locked,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    zIndex: isDragging ? 999 : undefined,
    opacity: locked ? 0.35 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`fp-ix-pick__letter fp-ix-pick__letter--draggable${isDragging ? " is-dragging" : ""}${selected ? " is-selected" : ""}`}
      style={style}
      disabled={locked}
      aria-pressed={selected}
      aria-label={`Vocal ${letter}, arrástrala o presiónala y luego presiona el dibujo correcto`}
      onClick={onSelect}
    >
      {letter.toUpperCase()}
      {letter}
    </button>
  );
}

/** A droppable picture cell for one row of InteractiveVowelPickOne. Also a
 * plain tap target so the tap-to-select-then-tap-to-place path (keyboard
 * and touch-without-drag) grades identically to a real drop. */
function DroppableVowelCell({
  rowIdx,
  cellIdx,
  cell,
  index,
  grade,
  wrong,
  disabled,
  onTap,
}: {
  rowIdx: number;
  cellIdx: number;
  cell: PageGridCell;
  index: number;
  grade: Grade;
  wrong: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `vp-cell-${rowIdx}-${cellIdx}`,
    data: { rowIdx, cellIdx },
  });
  const flagged = cell.correct === undefined;
  const classes = [
    "fp-ix-cell",
    "fp-ix-cell--droppable",
    isOver ? "is-over" : "",
    grade === "correct" ? "graded-correct" : "",
    wrong ? "graded-wrong-flash" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={classes}
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

/** "Presiona el dibujo que comienza con la vocal del recuadro." — real
 * drag-the-vowel-onto-the-picture (mouse/touch via dnd-kit), with a
 * tap-to-select-then-tap-to-place fallback so touch-without-drag and
 * keyboard users get the identical graded interaction. Every drop grades
 * immediately: snap + chime + Gretel cheer on correct, bounce + soft buzz
 * on wrong (row stays open to retry). */
export function InteractiveVowelPickOne({ region, accent, lessonId }: ExerciseProps) {
  const rows = region.vowelRows ?? [];
  const [correctRows, setCorrectRows] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ row: number; cell: number } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (rows.length > 0 && correctRows.size === rows.length && !completed) {
      setCompleted(true);

      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: rows.length,
          total: rows.length,
          meta: { exercise: `vowel_pick_one_${region.id}`, completed: true },
        });
      }
    }
  }, [correctRows, rows.length, completed, lessonId, region.id]);

  const attempt = (rowIdx: number, cellIdx: number) => {
    if (correctRows.has(rowIdx)) return;
    const cell = rows[rowIdx]?.cells[cellIdx];
    if (cell?.correct) {
      setCorrectRows((prev) => new Set(prev).add(rowIdx));
      setSelectedRow(null);


    } else {
      setWrongFlash({ row: rowIdx, cell: cellIdx });


      setTimeout(() => setWrongFlash(null), 400);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const activeRow = e.active.data.current?.rowIdx as number | undefined;
    const overRow = e.over?.data.current?.rowIdx as number | undefined;
    const overCell = e.over?.data.current?.cellIdx as number | undefined;
    if (activeRow === undefined || overRow === undefined || overCell === undefined) return;
    if (activeRow !== overRow) {
      // Dropped on a different row's picture — not a valid target, bounce back.
      setWrongFlash({ row: activeRow, cell: -1 });


      setTimeout(() => setWrongFlash(null), 400);
      return;
    }
    attempt(overRow, overCell);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="fp-ix-pick" style={{ ["--ix-accent" as string]: accent }}>
        {rows.map((row, r) => (
          <div key={r} className="fp-ix-pick__row">
            <DraggableVowelLetter
              rowIdx={r}
              letter={row.letter}
              locked={correctRows.has(r)}
              selected={selectedRow === r}
              onSelect={() => setSelectedRow((prev) => (prev === r ? null : r))}
            />
            <div className="fp-ix-pick__cells">
              {row.cells.map((cell, c) => (
                <DroppableVowelCell
                  key={c}
                  rowIdx={r}
                  cellIdx={c}
                  cell={cell}
                  index={r * 3 + c}
                  grade={correctRows.has(r) && cell.correct ? "correct" : null}
                  wrong={wrongFlash?.row === r && wrongFlash.cell === c}
                  disabled={correctRows.has(r)}
                  onTap={() => {
                    if (selectedRow === r) attempt(r, c);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

/** "Traza una línea de la vocal al dibujo..." — no distractors, tap to connect each pair. */
export function InteractiveVowelMatchAll({ region, accent, lessonId }: ExerciseProps) {
  const pairs = region.vowelPairs ?? [];
  const [linked, setLinked] = useState<Set<number>>(new Set());

  const connect = (i: number) => {
    if (linked.has(i)) return;
    const next = new Set(linked);
    next.add(i);
    setLinked(next);

    if (next.size === pairs.length) {

      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: pairs.length,
          meta: { exercise: `vowel_match_all_${region.id}`, completed: true },
        });
      }
    }
  };

  return (
    <div className="fp-ix-match-all" style={{ ["--ix-accent" as string]: accent }}>
      {pairs.map((pair, i) => (
        <div key={i} className={`fp-ix-match-row${linked.has(i) ? " linked" : ""}`}>
          <button type="button" className="fp-ix-letter-btn" onClick={() => connect(i)}>
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
export function InteractiveSyllableMatch({ region, accent, lessonId }: ExerciseProps) {
  const rows = region.matchRows ?? [];
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [graded, setGraded] = useState(false);
  const total = rows.reduce((n, row) => n + row.length, 0);

  const toggle = (key: string) => {
    if (graded) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const check = () => {
    setGraded(true);
    let allCorrect = true;
    rows.forEach((row, r) => {
      row.forEach((entry, w) => {
        if (entry.correct === undefined) return;
        const g = gradeOf(picked.has(`${r}-${w}`), entry.correct);
        if (g === "wrong" || g === "missed") allCorrect = false;
      });
    });


    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: allCorrect ? 1 : 0,
        total,
        meta: { exercise: `syllable_match_${region.id}`, completed: true },
      });
    }
  };

  return (
    <div className="fp-ix-syllable" style={{ ["--ix-accent" as string]: accent }}>
      <div className="fp-ix-syllable__top">
        <span className="fp-ix-syllable__label">{region.syllable}</span>
        <div className="fp-ix-syllable__rows">
          {rows.map((row, r) => (
            <div key={r} className="fp-ix-syllable__row">
              {row.map((entry, w) => {
                const key = `${r}-${w}`;
                const isPicked = picked.has(key);
                const g = graded ? gradeOf(isPicked, entry.correct) : null;
                const flagged = entry.correct === undefined;
                const classes = [
                  "fp-ix-syllable__word",
                  isPicked ? "picked" : "",
                  g === "correct" ? "graded-correct" : "",
                  g === "missed" ? "graded-missed" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={key}
                    type="button"
                    className={classes}
                    disabled={flagged || graded}
                    onClick={() => toggle(key)}
                  >
                    {entry.illustrationSrc && (
                      <img
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
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={graded || picked.size === 0}
        >
          Comprobar
        </button>
      </div>
    </div>
  );
}

/** "Completa las palabras con la sílaba correcta" — tap one choice per item, grade on check. */
export function InteractiveFillInBlank({ region, accent, lessonId }: ExerciseProps) {
  const items = region.fillItems ?? [];
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);

  const pick = (itemIdx: number, choiceIdx: number) => {
    if (graded) return;
    setPicked((prev) => ({ ...prev, [itemIdx]: choiceIdx }));
  };

  const check = () => {
    setGraded(true);
    let allCorrect = true;
    let gradable = 0;
    items.forEach((item, i) => {
      const hasCorrect = item.choices.some((c) => c.correct);
      if (!hasCorrect) return;
      gradable += 1;
      const chosen = picked[i];
      if (chosen === undefined || !item.choices[chosen]?.correct) allCorrect = false;
    });


    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: allCorrect ? 1 : 0,
        total: gradable,
        meta: { exercise: `fill_in_blank_${region.id}`, completed: true },
      });
    }
  };

  return (
    <div className="fp-ix-fill" style={{ ["--ix-accent" as string]: accent }}>
      {items.map((item, i) => {
        const flagged = !item.choices.some((c) => c.correct);
        return (
          <div key={i} className={`fp-ix-fill__item${flagged ? " fp-ix-fill__item--flagged" : ""}`}>
            {item.illustrationSrc && (
              <img
                src={item.illustrationSrc}
                alt={item.wordBox}
                className="fp-ix-fill__img"
                loading="lazy"
              />
            )}
            <span className="fp-ix-fill__wordbox">{item.wordBox}</span>
            <span className="fp-ix-fill__blank">{item.blank}</span>
            <div className="fp-ix-fill__choices">
              {item.choices.map((choice, c) => {
                const isPicked = picked[i] === c;
                const g = graded ? gradeOf(isPicked, choice.correct) : null;
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
                    disabled={flagged || graded}
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
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={
            graded ||
            Object.keys(picked).length <
              items.filter((it) => it.choices.some((c) => c.correct)).length
          }
        >
          Comprobar
        </button>
      </div>
    </div>
  );
}

/** "Traza una línea desde la vocal Xx hasta el dibujo..." — tap the cells that start with Xx, grade on check. */
export function InteractiveVowelLineMatch({ region, accent, lessonId }: ExerciseProps) {
  const cells = region.cells ?? [];
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [graded, setGraded] = useState(false);

  const toggle = (i: number) => {
    if (graded) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const check = () => {
    setGraded(true);
    let allCorrect = true;
    cells.forEach((cell, i) => {
      const g = gradeOf(picked.has(i), cell.correct);
      if (g === "wrong" || g === "missed") allCorrect = false;
    });


    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: allCorrect ? 1 : 0,
        total: cells.length,
        meta: { exercise: `vowel_line_match_${region.id}`, completed: true },
      });
    }
  };

  return (
    <div className="fp-ix-line-match" style={{ ["--ix-accent" as string]: accent }}>
      <div className="fp-ix-row" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {cells.map((cell, i) => (
          <Cell
            key={i}
            cell={cell}
            index={i}
            picked={picked.has(i)}
            grade={graded ? gradeOf(picked.has(i), cell.correct) : null}
            disabled={graded}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
      <div className="fp-ix-check-row">
        <button
          type="button"
          className="fp-ix-check-btn"
          onClick={check}
          disabled={graded || picked.size === 0}
        >
          Comprobar
        </button>
      </div>
    </div>
  );
}
