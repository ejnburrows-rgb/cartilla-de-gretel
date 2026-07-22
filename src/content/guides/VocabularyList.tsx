import React from "react";
import { CATALOG } from "@/lib/lesson-catalog";

/**
 * Real, verified key-vocabulary chips for a lesson's teacher guide —
 * "Vocabulario y Poema" section. Every guide (the 16 hand-written ones and
 * the 8 that fall back to PartialLessonGuide) previously only showed the
 * rhyme/poem *title*, never the actual list of key words teachers are meant
 * to introduce — 0 of 24 lessons had one (see SPEC.md's status table).
 *
 * Sourced from src/lib/lesson-catalog.ts's CATALOG (the same vocab data
 * already used by ActivityCarousel and verified this session against the
 * real book pages), NOT a new data source — so this can never drift from
 * what students actually see, and never invents anything: a word with no
 * illustrationSrc shows its emoji fallback exactly like everywhere else in
 * the app, it's never silently hidden or replaced.
 */
export function VocabularyList({ lessonNumber }: { lessonNumber: number }) {
  const entry = CATALOG.find((e) => e.n === lessonNumber);
  if (!entry) return null;

  const vocab =
    entry.kind === "vowel"
      ? entry.lesson.vocab
      : entry.kind === "consonant"
        ? entry.data.vocab
        : [];
  if (vocab.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-black text-sm uppercase tracking-wide text-stone-500 mb-3">
        Palabras clave de la lección
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {vocab.map((v) => (
          <div
            key={v.word}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-blue-100 bg-white p-3 text-center"
          >
            {v.illustrationSrc ? (
              <img
                src={v.illustrationSrc}
                alt={v.word}
                className="h-14 w-14 object-contain"
                loading="eager"
                decoding="async"
              />
            ) : (
              <span className="text-3xl" aria-hidden>
                {v.emoji}
              </span>
            )}
            <span className="font-bold capitalize text-stone-800">{v.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
