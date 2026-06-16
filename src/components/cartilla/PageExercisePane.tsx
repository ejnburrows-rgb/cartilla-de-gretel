import type { CSSProperties, ReactNode } from "react";
import { getLesson } from "@/content/lesson-meta";
import { exerciseForPage } from "@/content/exercise-seed";
import { SyllableTap, WordMatch } from "./Ejercicios";
import { DragBuildWord } from "./DragBuildWord";
import { usePageBinding } from "@/hooks/usePageBinding";

interface Props {
  pageNumber: number;
}

function PaneHeader({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: color }}>
        <span className="text-[10px] font-black text-white">1</span>
      </div>
      <h3 className="text-base font-black tracking-tight" style={{ color }}>{label}</h3>
    </div>
  );
}

export function PageExercisePane({ pageNumber }: Props): ReactNode {
  const binding = usePageBinding(pageNumber);
  if (!binding) return null;

  const lesson = getLesson(binding.lessonN);
  if (!lesson) return null;

  const exercise = exerciseForPage(pageNumber);
  if (!exercise) return null;

  const color = lesson.accent;
  const lessonId = `${lesson.n}-p${pageNumber}`;

  if (exercise.kind === "intro") {
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label={exercise.instructionEs} />
      </section>
    );
  }

  if (exercise.kind === "syllable-tap") {
    const syllables = exercise.syllables || [];
    if (syllables.length === 0) return null;
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label={exercise.instructionEs} />
        <SyllableTap syllables={syllables} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (exercise.kind === "word-match") {
    const words = exercise.pairs?.map(p => ({ word: p.word })) || [];
    if (words.length < 2) return null;
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label={exercise.instructionEs} />
        <WordMatch words={words} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (exercise.kind === "drag-build") {
    const words = exercise.words || [];
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label={exercise.instructionEs} />
        <DragBuildWord words={words} accent={color} lessonId={lessonId} />
      </section>
    );
  }

  if (exercise.kind === "reading") {
    const sentences = exercise.words || [];
    if (sentences.length === 0) return null;
    return (
      <section className="mt-6 w-full space-y-3">
        <PaneHeader color={color} label={exercise.instructionEs} />
        <ol className="space-y-2.5 rounded-3xl border border-stone-200 bg-white/85 p-5 text-base font-bold text-amber-950 shadow-[0_18px_42px_rgba(50,30,10,0.07)]">
          {sentences.map((s, i) => (
            <li key={`${lessonId}-s${i}`} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-600">
                {i + 1}
              </span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return null;
}
