import { useCallback, useMemo, useRef, useState } from "react";
import { DirectPencilConnector, type PencilTarget } from "@/cartilla/interactions/PencilConnector";
import type { GameContent } from "@/lib/games/gameContent";
import {
  PALABRAS_PAREJAS_LESSON,
  PALABRAS_PAREJAS_PAGE,
  PALABRAS_PAREJAS_PAIR_COUNT,
} from "@/content/palabras-parejas";

function shuffle<T>(values: T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/**
 * Word → picture matching game built on the owner-approved pencil connector:
 * the child drags a real pencil line from a word on the left to its picture on
 * the right. Correct pairs snap and stay drawn; a wrong pair is gently erased
 * by the pencil so the child can try again. All five pairs show the finish state.
 *
 * The pairs come from the verified Workbook source page (see
 * `src/content/games/palabras-parejas.ts`), never from invented vocabulary.
 */
export function PalabrasParejas({ content }: { content: GameContent }) {
  const pairs = useMemo(() => content.words.slice(0, PALABRAS_PAREJAS_PAIR_COUNT), [content.words]);
  // The left column keeps the book order; pictures are shuffled once so the
  // child has to find the match instead of reading across a copied row.
  const [pictureOrder] = useState(() => shuffle(pairs.map((_, index) => index)));

  const targets = useMemo<PencilTarget[]>(() => {
    const words: PencilTarget[] = pairs.map((pair, index) => ({
      id: `pareja-${index}-palabra`,
      label: pair.word,
      role: "left",
      pairId: `pareja-${index}`,
    }));
    const pictures: PencilTarget[] = pictureOrder.map((index) => ({
      id: `pareja-${index}-dibujo`,
      label: pairs[index].word,
      src: pairs[index].imageUrl,
      role: "right",
      pairId: `pareja-${index}`,
    }));
    return [...words, ...pictures];
  }, [pairs, pictureOrder]);

  const matchedRef = useRef<Set<string>>(new Set());
  const [matchedCount, setMatchedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleResult = useCallback(
    ({ objectId, result }: { objectId: string; result: "correct" | "wrong" }) => {
      if (result !== "correct") return;
      // Rapid repeated drags can deliver the same pair twice before React
      // re-renders; count each pair at most once and never finish early.
      if (matchedRef.current.has(objectId)) return;
      matchedRef.current.add(objectId);
      const nextCount = matchedRef.current.size;
      setMatchedCount(nextCount);
      if (nextCount >= pairs.length) setFinished(true);
    },
    [pairs.length],
  );

  return (
    <section
      className="pencil-word-match space-y-3"
      data-testid="palabras-parejas"
      data-complete={String(finished)}
      aria-label="Une cada palabra con su dibujo"
    >
      <p className="text-center text-xs font-bold text-stone-500">
        Palabras y dibujos de la página {PALABRAS_PAREJAS_PAGE} del Libro del alumno (Lección{" "}
        {PALABRAS_PAREJAS_LESSON}).
      </p>

      <DirectPencilConnector
        pageKey={`juego-palabras-parejas-${content.id}`}
        targets={targets}
        mode="pair"
        instruction={content.instructions[0]}
        labels={{
          left: (target) => `Palabra ${target.label}`,
          right: (target) => `Dibujo de ${target.label}`,
        }}
        restoreProgress={false}
        pairAnchors="edges"
        onResult={handleResult}
        className="pencil-word-match__connector"
      />

      <p className="text-center text-xs font-bold text-stone-500" aria-live="polite">
        Parejas encontradas: {matchedCount} de {pairs.length}
      </p>

      {finished && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center shadow-sm"
        >
          <p className="text-base font-black text-emerald-800">
            ¡Muy bien! Completaste las 5 parejas.
          </p>
        </div>
      )}
    </section>
  );
}
