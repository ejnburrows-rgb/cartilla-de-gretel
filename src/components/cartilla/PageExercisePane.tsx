import type { CSSProperties, ReactNode } from "react";
import { usePageBinding } from "@/hooks/usePageBinding";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { SyllableTap, WordMatch } from "./Ejercicios";
import { DragBuildWord } from "./DragBuildWord";

interface Props {
  pageNumber: number;
}

function dotStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function headerColorStyle(color: string): CSSProperties {
  return { color };
}

function numberBadgeStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function PaneHeader({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={dotStyle(color)}
        aria-hidden
      />
      <h3
        className="text-xs font-black uppercase tracking-[0.18em] sm:text-sm"
        style={headerColorStyle(color)}
      >
        {label}
      </h3>
    </div>
  );
}

function collectWordsFromExamples(
  examples: Record<string, string[]> | undefined,
  limit = 4,
): Array<{ word: string }> {
  const out: Array<{ word: string }> = [];
  if (!examples) return out;
  for (const list of Object.values(examples)) {
    if (Array.isArray(list) && list.length > 0) {
      const w = list[0];
      if (typeof w === "string" && w.length > 0) out.push({ word: w });
    }
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Renders the page-specific student exercise for a given workbook page.
 *
 * Drawn from src/content/page-bindings.json. Each consonant lesson (4 pages)
 * gets: syllable-tap, word-match, drag-build, reading. Each vowel lesson
 * (3 pages) gets: syllable-tap, word-match, reading. Intro pages (1-3) get
 * an all-vowels syllable tap.
 *
 * Designed to be passed as `belowPage` to OfficialWorkbookLessonView.
 */
export function PageExercisePane({ pageNumber }: Props): ReactNode {
  const binding = usePageBinding(pageNumber);
  if (!binding) return null;

  const entry = CATALOG.find((e) => e.n === binding.lessonN) as
    | CatalogEntry
    | undefined;
  if (!entry) return null;

  const color = entry.color;
  const lessonId = `${entry.n}-p${pageNumber}`;

  if (binding.kind === "intro") {
    const vowels = ["a", "e", "i", "o", "u"];
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label="Toca la vocal que escuchas" />
        <SyllableTap syllables={vowels} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (binding.kind === "syllable-tap") {
    let syllables: string[] = [];
    if (entry.kind === "vowel") syllables = [entry.vowel];
    else if (entry.kind === "consonant") syllables = entry.data.syllables ?? [];
    if (syllables.length === 0) return null;
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label="Toca la sílaba" />
        <SyllableTap syllables={syllables} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (binding.kind === "word-match") {
    let words: Array<{ word: string }> = [];
    if (entry.kind === "vowel") {
      const vocab = entry.lesson.vocab ?? [];
      for (const v of vocab) {
        if (v?.word && words.length < 4) words.push({ word: v.word });
      }
    } else if (entry.kind === "consonant") {
      words = collectWordsFromExamples(entry.data.examples, 4);
    }
    if (words.length < 2) return null;
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label="Une la palabra con su sílaba" />
        <WordMatch words={words} color={color} lessonId={lessonId} />
      </section>
    );
  }

  if (binding.kind === "drag-build") {
    return (
      <section className="mt-6 w-full space-y-4">
        <PaneHeader color={color} label="Forma la palabra" />
        <DragBuildWord entry={entry} accent={color} />
      </section>
    );
  }

  if (binding.kind === "reading") {
    let sentences: string[] = [];
    if (entry.kind === "consonant") {
      sentences = entry.data.sentences ?? [];
    } else if (entry.kind === "vowel") {
      sentences = (entry.lesson.vocab ?? [])
        .map((v) => v.word)
        .filter((w): w is string => typeof w === "string" && w.length > 0);
    }
    if (sentences.length === 0) return null;
    return (
      <section className="mt-6 w-full space-y-3">
        <PaneHeader color={color} label="Lee con ayuda" />
        <ol className="space-y-2.5 rounded-3xl border border-stone-200 bg-white/85 p-5 text-base font-bold text-amber-950 shadow-[0_18px_42px_rgba(50,30,10,0.07)]">
          {sentences.map((s, i) => (
            <li key={`${lessonId}-s${i}`} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
                style={numberBadgeStyle(color)}
              >
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
