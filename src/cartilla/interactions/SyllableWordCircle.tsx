import { learnerStorageKey, useLearnerScope } from "@/lib/learner-storage";
import { loadLassoProgress } from "@/lib/activity-canvas-store";
import { useEffect, useMemo, useState } from "react";
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

export function SyllableWordCircle(props: { region: PageRegion; lessonId?: string }) {
  const scope = useLearnerScope();
  return <LearnerSyllableWordCircle key={`${scope}:${props.region.id}`} {...props} />;
}

function LearnerSyllableWordCircle({ region, lessonId }: { region: PageRegion; lessonId?: string }) {
  const { emit: gretelEvent, record: recordEvent } = useActivityEvents();
  const words = (region.matchRows ?? []).flat();
  const isTarget = (i: number) => words[i]?.correct !== false;
  const correctCount = words.filter((entry) => entry.correct !== false).length;
  const key = learnerStorageKey(`cartilla-circle-${region.id}`);
  const startsKey = learnerStorageKey(`cartilla-circle-starts-${region.id}`);
  const legacyKey = `${lessonId ?? "x"}:${region.id}`;
  const [marked, setMarked] = useState<Set<number>>(() => {
    try {
      // A newer pencil-circle save (even an intentionally cleared []) wins.
      const current = localStorage.getItem(key);
      if (current !== null) {
        const stored: unknown = JSON.parse(current);
        return new Set(Array.isArray(stored)
          ? stored.filter((i): i is number =>
              Number.isInteger(i) && i >= 0 && i < words.length && isTarget(i))
          : []);
      }

      // Legacy source IDs: <region-id>-<row>-<column>.
      // Read their progress, never reinstate the retired rope presentation.
      const legacy = new Set(loadLassoProgress(legacyKey)?.completedIds ?? []);
      const restored = new Set<number>();
      let flatIndex = 0;
      for (const [rowIndex, row] of (region.matchRows ?? []).entries()) {
        for (const [columnIndex, entry] of row.entries()) {
          if (
            legacy.has(`${region.id}-${rowIndex}-${columnIndex}`) &&
            entry.correct !== false &&
            validSyllableStarts(entry.word, region.syllable ?? "").length > 0
          ) restored.add(flatIndex);
          flatIndex++;
        }
      }
      return restored;
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    // Persist migrated answers once, on their original learner scope.
    // Never resurrect erased answers: [] is an explicit newer save.
    try {
      if (localStorage.getItem(key) === null && marked.size > 0) {
        localStorage.setItem(key, JSON.stringify([...marked]));
      }
    } catch {
      // Storage can be disabled; in-memory exercise remains usable.
    }
  }, [key, marked]);

  const initialStarts = useMemo(() => {
    try {
      const raw = localStorage.getItem(startsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<number, number>;
        }
      }
    } catch {}
    return {};
  }, [startsKey]);

  const [selectedStarts, setSelectedStarts] = useActivityState<Record<number, number>>(
    "syllableStarts",
    initialStarts,
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

  const persistStarts = (next: Record<number, number>) => {
    try {
      localStorage.setItem(startsKey, JSON.stringify(next));
    } catch {
      /* storage can be disabled */
    }
  };

  const commitCorrect = (wordIndex: number, start: number) => {
    const next = new Set(marked);
    next.add(wordIndex);
    const nextStarts = { ...selectedStarts, [wordIndex]: start };
    setSelectedStarts(nextStarts);
    setMarked(next);
    persistMarked(next);
    persistStarts(nextStarts);
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
    const nextStarts = { ...selectedStarts };
    delete nextStarts[wordIndex];
    setSelectedStarts(nextStarts);
    persistStarts(nextStarts);
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
    const letters = [...event.currentTarget.querySelectorAll(".native-syllable__letter")];
    const charIndex = letters.findIndex((letter) => {
      const rect = letter.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX < rect.right &&
        event.clientY >= rect.top && event.clientY < rect.bottom;
    });
    // Button padding is not an answer. Grade only the printed letters touched.
    if (charIndex < 0) return;
    const starts = validSyllableStarts(word, syllable);
    const occurrence =
      starts.find(
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
                {overlayFor(i)}
              </span>
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
