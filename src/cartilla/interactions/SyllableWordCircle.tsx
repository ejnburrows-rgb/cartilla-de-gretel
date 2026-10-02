import { useState } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";

function syllableRange(word: string, syllable: string): [string, string, string] {
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const position = normalize(word).indexOf(normalize(syllable));
  return position < 0
    ? [word, "", ""]
    : [word.slice(0, position), word.slice(position, position + syllable.length), word.slice(position + syllable.length)];
}

export function SyllableWordCircle({ region, lessonId }: { region: PageRegion; lessonId?: string }) {
  const words = (region.matchRows ?? []).flat();
  const isTarget = (i: number) => words[i]?.correct !== false;
  const correctCount = words.filter((entry) => entry.correct !== false).length;
  const key = `cartilla-circle-${region.id}`;
  const [marked, setMarked] = useState<Set<number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
      return new Set(stored.filter((i) => isTarget(i)));
    } catch {
      return new Set();
    }
  });
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const syllable = region.syllable ?? "";

  const toggle = (i: number) => {
    if (!isTarget(i)) {
      setWrongIndex(i);
      window.setTimeout(() => setWrongIndex((current) => current === i ? null : current), 450);
      gretelEvent("answer:wrong");
      return;
    }

    const next = new Set(marked);
    const adding = !next.has(i);
    if (adding) next.add(i);
    else next.delete(i);
    setMarked(next);
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* storage can be disabled */ }

    if (adding) gretelEvent("answer:correct");
    else gretelEvent("activity:retry");
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
          const [before, match, after] = syllableRange(entry.word, syllable);
          const target = isTarget(i);
          const wrong = wrongIndex === i;
          return (
            <span
              key={`${i}-${entry.word}`}
              className={`native-syllable__word${wrong ? " is-wrong" : ""}`}
            >
              {target && match ? (
                <>
                  <span>{before}</span>
                  <button
                    type="button"
                    className={`native-syllable__tap${marked.has(i) ? " is-circled" : ""}`}
                    aria-pressed={marked.has(i)}
                    onClick={() => toggle(i)}
                  >
                    {match}
                  </button>
                  <span>{after}</span>
                </>
              ) : (
                <button
                  type="button"
                  className="native-syllable__distractor"
                  onClick={() => toggle(i)}
                >
                  {entry.word}
                </button>
              )}
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
