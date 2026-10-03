import { learnerStorageKey } from "@/lib/learner-storage";
import { useEffect, useState } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { useActivityEvents } from "@/lib/activity-events";

export function validSyllableStarts(word: string, syllable: string): number[] {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const text = normalize(word), target = normalize(syllable);
  return target ? Array.from({ length: word.length }, (_, i) => i).filter(i => text.startsWith(target, i)) : [];
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
  const [selectedStarts, setSelectedStarts] = useState<Record<number, number>>({});
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const syllable = region.syllable ?? "";

  useEffect(() => {
    if (correctCount > 0 && marked.size === correctCount) gretelEvent("activity:complete", { restored: true });
  }, [correctCount, marked, gretelEvent]);

  const toggle = (i: number, position: number) => {
    if (!isTarget(i) || !validSyllableStarts(words[i].word, syllable).includes(position)) {
      setWrongIndex(i);
      window.setTimeout(() => setWrongIndex((current) => current === i ? null : current), 450);
      gretelEvent("answer:wrong", { itemId: `${region.id}-${i}` });
      return;
    }

    setWrongIndex(null);
    const next = new Set(marked);
    const adding = !next.has(i) || (selectedStarts[i] ?? validSyllableStarts(words[i].word, syllable)[0]) !== position;
    setSelectedStarts(prev => ({ ...prev, [i]: position }));
    if (adding) next.add(i);
    else next.delete(i);
    setMarked(next);
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* storage can be disabled */ }

    if (adding) gretelEvent("answer:correct", { itemId: `${region.id}-${i}` });
    else gretelEvent("activity:retry", { reason: "work-cleared" });
    if (adding && correctCount > 0 && next.size === correctCount) {
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

  return (
    <section className="native-syllable" aria-label={`Busca ${syllable} en cada palabra`}>
      <h2>{syllable}</h2>
      <div className="native-syllable__words">
        {words.map((entry, i) => {
          const wrong = wrongIndex === i;
          return (
            <span
              key={`${i}-${entry.word}`}
              className={`native-syllable__word${wrong ? " is-wrong" : ""}`}
            >
              {Array.from(entry.word).map((letter, position) => (
                <button key={position} type="button"
                  className={`native-syllable__letter${marked.has(i) && position >= (selectedStarts[i] ?? validSyllableStarts(words[i].word, syllable)[0]) && position < (selectedStarts[i] ?? validSyllableStarts(words[i].word, syllable)[0]) + syllable.length ? " is-circled" : ""}`}
                  aria-label={position === 0 ? entry.word : `${entry.word}, posición ${position + 1}: ${letter}`}
                  aria-pressed={marked.has(i) && (selectedStarts[i] ?? validSyllableStarts(words[i].word, syllable)[0]) === position}
                  onClick={() => toggle(i, position)}>{letter}</button>
              ))}
            </span>
          );
        })}
      </div>
      <p role="status" aria-live="polite">
        {wrongIndex !== null ? "Inténtalo otra vez" : `${marked.size} de ${correctCount} respuestas correctas`}
      </p>
    </section>
  );
}
