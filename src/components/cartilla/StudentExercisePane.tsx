/**
 * StudentExercisePane.tsx — Lane A
 *
 * Renders the book-faithful student exercise sequence for a given lesson.
 * All exercises are traceable to workbook or teacher-guide content.
 *
 * Sequence (consonant lessons):
 *   1. SyllableTap  — book syllables (ma, me, mi, mo, mu)
 *   2. WordMatch    — first example word per syllable from consonants.json
 *   3. DragBuildWord — build a word from book syllables
 *   4. ReadingSentences — read the 2 workbook sentences aloud
 *
 * Sequence (vowel lessons): 1, 2, 3, 4 using vowel vocab
 * Sequence (intro): syllable tap only
 *
 * Sticky bottom bar: LessonTimer + dots
 * Uses `key={lessonId}` strategy via caller to reset state on lesson change.
 */
import { useState, useEffect } from "react";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { SyllableTap, WordMatch } from "@/components/cartilla/Ejercicios";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { OrderedExercises } from "@/components/cartilla/OrderedExercises";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { gretelEvent } from "@/lib/gretel-bus";
import "@/styles/cartilla-student.css";

const EXERCISE_IDS = [
  "syllable_tap",
  "word_match",
  "drag_build_word",
  "reading_sentences",
] as const;

type ExerciseId = (typeof EXERCISE_IDS)[number];

interface StudentExercisePaneProps {
  entry: CatalogEntry;
  lessonId: string;
  timeLimitSeconds?: number | null;
  onAllCompleted?: () => void;
}

function numberBadgeStyle(color: string): React.CSSProperties {
  return { backgroundColor: color };
}

export function StudentExercisePane({
  entry,
  lessonId,
  timeLimitSeconds,
  onAllCompleted,
}: StudentExercisePaneProps) {
  const STORAGE_KEY = `cartilla.exercise-done.v1.${lessonId}`;

  const [completed, setCompleted] = useState<Set<ExerciseId>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as ExerciseId[];
        return new Set(arr);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  useEffect(() => {
    if (completed.size === EXERCISE_IDS.length) {
      gretelEvent("lesson:complete");
      if (onAllCompleted) onAllCompleted();
    }
  }, [completed.size, onAllCompleted]);

  const markDone = (id: ExerciseId) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set([...prev, id]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
    gretelEvent("answer:correct");
  };

  const accent = entry.color;

  // Derive syllables + words from workbook data only
  const syllables: string[] = (() => {
    if (entry.kind === "consonant") return entry.data.syllables;
    if (entry.kind === "vowel")
      return [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)];
    return ["a", "e", "i", "o", "u"];
  })();

  const words: Array<{ word: string; emoji?: string; illustrationSrc?: string }> = (() => {
    if (entry.kind === "consonant") {
      return entry.data.vocab.map((v) => ({
        word: v.word,
        illustrationSrc: v.illustrationSrc,
      }));
    }
    if (entry.kind === "vowel") {
      return entry.lesson.vocab.slice(0, 4).map((v) => ({
        word: v.word,
        illustrationSrc: v.illustrationSrc,
      }));
    }
    return [{ word: "ala" }, { word: "oso" }, { word: "uva" }, { word: "isla" }];
  })();

  // Book sentences (workbook-derived, from consonants.json)
  const sentences: string[] = (() => {
    if (entry.kind === "consonant") return entry.data.sentences ?? [];
    if (entry.kind === "vowel") {
      return (entry.lesson.vocab ?? [])
        .map((v) => v.word)
        .filter((w): w is string => typeof w === "string" && w.length > 0)
        .slice(0, 3);
    }
    return [];
  })();

  const blocks = [
    {
      id: "syllable_tap",
      label: "S\u00edlabas",
      node: <SyllableTap syllables={syllables} color={accent} lessonId={lessonId} />,
    },
    {
      id: "word_match",
      label: "Palabras",
      node: <WordMatch words={words} color={accent} lessonId={lessonId} />,
    },
    {
      id: "drag_build_word",
      label: "Construir",
      node: (
        <DragBuildWord
          words={words.map((w) => w.word)}
          accent={accent}
          lessonId={lessonId}
          onComplete={() => markDone("drag_build_word")}
        />
      ),
    },
    sentences.length > 0
      ? {
          id: "reading_sentences",
          label: "Leer",
          node: (
            <section className="space-y-3">
              <div
                className="text-xs font-black uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                Lee con el maestro
              </div>
              <ol className="space-y-2.5 rounded-3xl border border-stone-200 bg-white/85 p-5 text-base font-bold text-amber-950 shadow-[0_18px_42px_rgba(50,30,10,0.07)]">
                {sentences.map((s, i) => (
                  <li key={`${lessonId}-s${i}`} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
                      style={numberBadgeStyle(accent)}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="w-full rounded-2xl py-3 text-sm font-black text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: accent }}
                onClick={() => markDone("reading_sentences")}
              >
                Ya leí ✓
              </button>
            </section>
          ),
        }
      : {
          id: "reading_sentences",
          label: "Leer",
          node: (
            <button
              type="button"
              className="w-full rounded-2xl py-3 text-sm font-black text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: accent }}
              onClick={() => markDone("reading_sentences")}
            >
              Listo ✓
            </button>
          ),
        },
  ];

  return (
    <div className="student-exercise-pane relative">
      {/* Character art from book asset manifest */}
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
    <div className="progress-dots" role="group" aria-label="Progreso de ejercicios">
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
