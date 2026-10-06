import { learnerStorageKey } from "@/lib/learner-storage";
import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { useActivityEvents, useActivityState } from "@/lib/activity-events";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";

export function validSyllableStarts(word: string, syllable: string): number[] {
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const text = normalize(word);
  const target = normalize(syllable);
  return target
    ? Array.from({ length: word.length }, (_, i) => i).filter((i) => text.startsWith(target, i))
    : [];
}

type PendingMark = {
  wordIndex: number;
  start: number;
  correct: boolean;
};

function clampMarkStart(word: string, syllable: string, start: number): number {
  const span = Math.max(1, syllable.length);
  return Math.max(0, Math.min(start, Math.max(0, word.length - span)));
}

export function SyllableWordCircle({ region, lessonId }: { region: PageRegion; lessonId?: string }) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const words = (region.matchRows ?? []).flat();
  const isTarget = (i: number) => words[i]?.correct !== false;
  const correctCount = words.filter((entry) => entry.correct !== false).length;
  const key = learnerStorageKey(`cartilla-circle-${region.id}`);
  const [marked, setMarked] = useState<Set<number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
      return new Set(stored.filter((i) => isTarget(i)));
    } catch {
      return new Set();
    }
  });
  const [selectedStarts, setSelectedStarts] = useActivityState<Record<number, number>>(
    "syllableStarts",
    {},
  );
  const [pending, setPending] = useState<PendingMark | null>(null);
  const syllable = region.syllable ?? "";

  useEffect(() => {
    if (correctCount > 0 && marked.size === correctCount) {
      gretelEvent("activity:complete", { restored: true });
    }
  }, [correctCount, marked, gretelEvent]);

  const persistMarked = (next: Set<number>) => {
    try {
      localStorage.setItem(key, JSON.stringify([...next]));
    } catch {
      /* storage can be disabled */
    }
  };

  const commitCorrect = (wordIndex: number, start: number) => {
    const next = new Set(marked);
    next.add(wordIndex);
    setSelectedStarts((prev) => ({ ...prev, [wordIndex]: start }));
    setMarked(next);
    persistMarked(next);
    setPending(null);

    if (correctCount > 0 && next.size === correctCount) {
      gretelEvent("activity:complete");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 1,
          total: 1,
          meta: { exercise: `syllable_circle_${region.id}`, completed: true },
        });
      }
    }
  };

  const removeCorrect = (wordIndex: number) => {
    const next = new Set(marked);
    next.delete(wordIndex);
    setMarked(next);
    persistMarked(next);
    setSelectedStarts((prev) => {
      const copy = { ...prev };
      delete copy[wordIndex];
      return copy;
    });
    gretelEvent("activity:retry", { reason: "work-cleared" });
  };

  const attempt = (wordIndex: number, start: number, correct: boolean) => {
    if (pending) return;
    const normalizedStart = clampMarkStart(words[wordIndex]?.word ?? "", syllable, start);
    if (
      correct &&
      marked.has(wordIndex) &&
      (selectedStarts[wordIndex] ?? validSyllableStarts(words[wordIndex].word, syllable)[0]) ===
        normalizedStart
    ) {
      removeCorrect(wordIndex);
      return;
    }
    setPending({ wordIndex, start: normalizedStart, correct });
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLButtonElement>,
    wordIndex: number,
  ) => {
    if (pending) return;
    const word = words[wordIndex]?.word ?? "";
    if (!word) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const ratio = Math.max(0, Math.min(0.9999, (event.clientX - rect.left) / width));
    const charIndex = Math.min(word.length - 1, Math.floor(ratio * word.length));
    const starts = validSyllableStarts(word, syllable);
    const occurrence = starts.find(
      (start) => charIndex >= start && charIndex < start + Math.max(1, syllable.length),
    );
    const correct = isTarget(wordIndex) && occurrence !== undefined;
    attempt(wordIndex, occurrence ?? charIndex, correct);
  };

  const handleKeyboardActivate = (wordIndex: number) => {
    if (pending) return;
    const word = words[wordIndex]?.word ?? "";
    const starts = validSyllableStarts(word, syllable);
    const start = starts[0] ?? 0;
    attempt(wordIndex, start, isTarget(wordIndex) && starts.length > 0);
  };

  const overlayFor = (wordIndex: number) => {
    const word = words[wordIndex]?.word ?? "";
    if (!word) return null;
    const pendingHere = pending?.wordIndex === wordIndex ? pending : null;
    const committedStart = marked.has(wordIndex)
      ? selectedStarts[wordIndex] ?? validSyllableStarts(word, syllable)[0]
      : undefined;
    const start = pendingHere?.start ?? committedStart;
    if (start === undefined) return null;
    const normalizedStart = clampMarkStart(word, syllable, start);
    const spanLength = Math.max(1, Math.min(Math.max(1, syllable.length), word.length - normalizedStart));
    const style = {
      left: `${(normalizedStart / word.length) * 100}%`,
      width: `${(spanLength / word.length) * 100}%`,
    };

    return (
      <span className="native-syllable__mark" style={style} aria-hidden="true">
        {pendingHere ? (
          <WorkbookPencilMark
            key={`pending-${wordIndex}-${pendingHere.start}-${pendingHere.correct}`}
            markType="circle"
            isCorrect={pendingHere.correct}
            itemId={`${region.id}-${wordIndex}`}
            onSuccess={() => commitCorrect(wordIndex, pendingHere.start)}
            onRetry={() => setPending((current) => (current?.wordIndex === wordIndex ? null : current))}
          />
        ) : (
          <WorkbookPencilMark
            markType="circle"
            status="correct"
            itemId={`${region.id}-${wordIndex}-restored`}
          />
        )}
      </span>
    );
  };

  return (
    <section className="native-syllable" aria-label={`Busca ${syllable} en cada palabra`}>
      <h2>{syllable}</h2>
      <div className="native-syllable__words">
        {words.map((entry, i) => {
          const retrying = pending?.wordIndex === i && pending.correct === false;
          return (
            <button
              key={`${i}-${entry.word}`}
              type="button"
              className={`native-syllable__word${retrying ? " is-retrying" : ""}`}
              aria-label={entry.word}
              aria-pressed={marked.has(i)}
              aria-disabled={pending !== null}
              disabled={pending !== null}
              onPointerUp={(event) => handlePointerUp(event, i)}
              onClick={(event) => {
                if (event.detail === 0) handleKeyboardActivate(i);
              }}
            >
              <span className="native-syllable__letters" aria-hidden="true">
                {Array.from(entry.word).map((letter, position) => (
                  <span key={position} className="native-syllable__letter">
                    {letter}
                  </span>
                ))}
              </span>
              {overlayFor(i)}
            </button>
          );
        })}
      </div>
      <p role="status" aria-live="polite">
        {pending?.correct === false
          ? "Inténtalo otra vez"
          : `${marked.size} de ${correctCount} respuestas correctas`}
      </p>
    </section>
  );
}
