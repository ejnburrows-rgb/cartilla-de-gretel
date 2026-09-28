import { useState } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";

function syllableRange(word: string, syllable: string): [string, string, string] {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const position = normalize(word).indexOf(normalize(syllable));
  return position < 0 ? [word, "", ""] : [word.slice(0, position), word.slice(position, position + syllable.length), word.slice(position + syllable.length)];
}

/** The printed exercise asks the child to circle the syllable within each
 * word. Every word on the verified page contains its row's syllable. */
export function SyllableWordCircle({ region, lessonId }: { region: PageRegion; lessonId?: string }) {
  const words = (region.matchRows ?? []).flat();
  const key = `cartilla-circle-${region.id}`;
  const [marked, setMarked] = useState<Set<number>>(() => {
    try { return new Set<number>(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { return new Set(); }
  });
  const syllable = region.syllable ?? "";
  const toggle = (i: number) => {
    const next = new Set(marked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setMarked(next);
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* storage can be disabled */ }
    if (next.size === words.length) {
      gretelEvent("answer:correct");
      gretelEvent("activity:complete");
      if (lessonId) recordEvent({ lessonId, kind: "exercise", score: 1, total: 1, meta: { exercise: `syllable_circle_${region.id}`, completed: true } });
    }
  };
  return (
    <section className="native-syllable" aria-label={`Busca ${syllable} en cada palabra`}>
      <h2>{syllable}</h2>
      <div className="native-syllable__words">
        {words.map((entry, i) => {
          const [before, match, after] = syllableRange(entry.word, syllable);
          return <button key={`${i}-${entry.word}`} type="button" aria-pressed={marked.has(i)} onClick={() => toggle(i)}>
            {before}<span className={marked.has(i) ? "is-circled" : ""}>{match}</span>{after}
          </button>;
        })}
      </div>
      <p role="status">{marked.size} de {words.length} sílabas marcadas</p>
    </section>
  );
}
