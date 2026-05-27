/**
 * StudentExercisePane.tsx  — Lane A
 *
 * Renders the ordered student exercise sequence for a given lesson:
 *   1. BookArtFigure (character role)
 *   2. SyllableTap
 *   3. WordMatch
 *   4. TapObjectActivity
 *   5. DragBuildWord
 *   6. DragWordReveal
 *
 * Sticky bottom bar: LessonTimer + 3-dot progress (one per exercise).
 * Uses `key={lessonId}` strategy via caller to reset state on lesson change.
 */
import { useState, useEffect } from "react";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { SyllableTap, WordMatch } from "@/components/cartilla/Ejercicios";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { DragWordReveal } from "@/components/cartilla/DragWordReveal";
import { TapObjectActivity } from "@/components/cartilla/TapObjectActivity";
import { OrderedExercises } from "@/components/cartilla/OrderedExercises";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import "@/styles/cartilla-student.css";

const EXERCISE_IDS = [
  "syllable_tap",
  "word_match",
  "tap_object",
  "drag_build_word",
  "drag_word_reveal",
] as const;
type ExerciseId = (typeof EXERCISE_IDS)[number];

interface StudentExercisePaneProps {
  entry: CatalogEntry;
  lessonId: string;
  timeLimitSeconds?: number | null;
  onAllCompleted?: () => void;
}

export function StudentExercisePane({
  entry,
  lessonId,
  timeLimitSeconds,
  onAllCompleted,
}: StudentExercisePaneProps) {
  const [completed, setCompleted] = useState<Set<ExerciseId>>(new Set());

  useEffect(() => {
    if (completed.size === EXERCISE_IDS.length && onAllCompleted) {
      onAllCompleted();
    }
  }, [completed.size, onAllCompleted]);

  const markDone = (id: ExerciseId) =>
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      return new Set([...prev, id]);
    });

  const accent = entry.color;

  // Derive syllables + words from the lesson entry
  const syllables: string[] = (() => {
    if (entry.kind === "consonant") return entry.data.syllables;
    if (entry.kind === "vowel") return [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)];
    return ["a", "e", "i", "o", "u"];
  })();

  const words: Array<{ word: string; emoji?: string }> = (() => {
    if (entry.kind === "consonant") {
      return Object.values(entry.data.examples)
        .flat()
        .slice(0, 6)
        .map((w) => ({ word: w }));
    }
    if (entry.kind === "vowel") {
      return entry.lesson.vocab.slice(0, 4);
    }
    return [
      { word: "ala", emoji: "🦅" },
      { word: "oso", emoji: "🐻" },
      { word: "uva", emoji: "🍇" },
      { word: "isla", emoji: "🏝️" },
    ];
  })();

  const blocks = [
    {
      id: "syllable_tap",
      label: "Sílabas",
      node: <SyllableTap syllables={syllables} color={accent} lessonId={lessonId} onComplete={() => markDone("syllable_tap")} />
    },
    {
      id: "word_match",
      label: "Palabras",
      node: <WordMatch words={words} color={accent} lessonId={lessonId} onComplete={() => markDone("word_match")} />
    },
    {
      id: "tap_object",
      label: "Burbujas",
      node: (
        <TapObjectActivity
          entry={entry}
          accent={accent}
          lessonId={lessonId}
          onComplete={() => markDone("tap_object")}
        />
      )
    },
    {
      id: "drag_build_word",
      label: "Construir",
      node: (
        <DragBuildWord
          entry={entry}
          accent={accent}
          lessonId={lessonId}
          onComplete={() => markDone("drag_build_word")}
        />
      )
    },
    {
      id: "drag_word_reveal",
      label: "Lupa",
      node: (
        <DragWordReveal
          entry={entry}
          accent={accent}
          lessonId={lessonId}
          onComplete={() => markDone("drag_word_reveal")}
        />
      )
    }
  ];

  return (
    <div className="student-exercise-pane">
      {/* 1 — Character art from Lane B manifest */}
      <BookArtFigure
        lesson={entry.n}
        role="character"
        className="w-full mb-5"
        style={{ aspectRatio: "4/3", maxHeight: "18rem" } as React.CSSProperties}
      />

      <OrderedExercises lessonId={lessonId} blocks={blocks} />

      {/* Sticky footer: timer + dots */}
      <div className="lesson-sticky-bar">
        <LessonTimer limitSeconds={timeLimitSeconds ?? null} />
        <ProgressDots
          ids={EXERCISE_IDS as unknown as ExerciseId[]}
          completed={completed}
          accent={accent}
        />
      </div>
    </div>
  );
}

// ── progress indicator ──────────────────────────────────────
function ProgressDots({
  ids,
  completed,
  accent,
}: {
  ids: ExerciseId[];
  completed: Set<ExerciseId>;
  accent: string;
}) {
  return (
    <div
      className="progress-dots"
      role="group"
      aria-label="Progreso de ejercicios"
    >
      {ids.map((id) => (
        <div
          key={id}
          className="progress-dot"
          data-done={completed.has(id) ? "true" : "false"}
          data-active={!completed.has(id) ? "true" : "false"}
          style={{ "--dot-color": accent } as React.CSSProperties}
          aria-label={completed.has(id) ? `${id} completado` : `${id} pendiente`}
          title={id.replace(/_/g, " ")}
        />
      ))}
    </div>
  );
}
