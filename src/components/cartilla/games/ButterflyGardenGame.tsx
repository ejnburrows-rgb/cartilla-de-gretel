import React, { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";

function finishGame(content: GameContent, score: number, total: number) {
  recordEvent({
    lessonId: `game:${content.id}`,
    kind: "exercise",
    score,
    total,
    meta: { exercise: content.type, completed: true, gameId: content.id },
  });
}

function Result({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      role="status"
      className={`rounded-xl border-2 px-4 py-3 font-bold ${
        ok
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-rose-300 bg-rose-50 text-rose-800"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {ok ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        {text}
      </span>
    </div>
  );
}

function CompleteCard({ children }: { children: React.ReactNode }) {
  return <section className="kid-card p-5 sm:p-7 space-y-5">{children}</section>;
}

export function ButterflyGardenGame({ content }: { content: GameContent }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);

  const word = content.words[wordIndex];
  const done = wordIndex >= content.words.length;

  const reset = () => {
    setWordIndex(0);
    setPicked([]);
    setFeedback(null);
    setScore(0);
  };

  const choose = (tile: string) => {
    if (feedback) return;
    const next = [...picked, tile];
    const expected = word.syllables.slice(0, next.length);
    const validPrefix = next.every((value, i) => value.toLocaleLowerCase("es") === expected[i]?.toLocaleLowerCase("es"));
    if (!validPrefix) {
      setFeedback("no");
      setTimeout(() => {
        setPicked([]);
        setFeedback(null);
      }, 650);
      return;
    }
    setPicked(next);
    if (next.length === word.syllables.length) {
      setFeedback("ok");
      setScore((s) => s + 1);
      setTimeout(() => {
        const nextIndex = wordIndex + 1;
        if (nextIndex === content.words.length) finishGame(content, score + 1, content.words.length);
        setWordIndex(nextIndex);
        setPicked([]);
        setFeedback(null);
      }, 650);
    }
  };

  if (done) {
    return (
      <CompleteCard>
        <h2 className="text-2xl font-black text-center">¡Las mariposas volvieron al jardín!</h2>
        <p className="text-center font-bold text-stone-600">
          {score} de {content.words.length} palabras completas
        </p>
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
          <p className="font-bold text-amber-800">
            [Falta de arte original] Animación visual de jardín y mariposas bloqueada por ausencia de fuente limpia. Se han utilizado cajas de texto como reemplazo funcional interactivo temporal.
          </p>
        </div>
        <button onClick={reset} className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
          <RotateCcw className="h-4 w-4" /> Jugar otra vez
        </button>
      </CompleteCard>
    );
  }

  // Deduplicate tiles to avoid redundant buttons
  const uniqueTiles = Array.from(new Set(content.tiles ?? []));

  return (
    <CompleteCard>
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center mb-4">
        <p className="font-bold text-amber-800 text-sm">
          [Falta de arte original] Animación visual interactiva del vuelo de las mariposas al jardín y flores bloqueada porque el arte original limpio (fondo, alas/cuerpos separados, pasto, etc) no se encontró. No se pueden reconstruir desde el pantallazo de referencia plano.
        </p>
      </div>

      <div className="text-center">
        <div className="text-5xl" aria-hidden>🦋</div>
        <p className="mt-2 text-sm font-bold text-stone-500">Palabra {wordIndex + 1} de {content.words.length}</p>
        <h2 className="text-3xl font-black mt-1">{word.word}</h2>
      </div>

      <div className="min-h-16 rounded-2xl border-2 border-dashed border-stone-300 bg-white p-3 flex flex-wrap justify-center gap-2">
        {word.syllables.map((_, i) => (
          <span key={i} className="min-w-16 rounded-xl bg-stone-100 px-4 py-3 text-center text-2xl font-black">
            {picked[i] ?? "__"}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {uniqueTiles.map((tile) => (
          <button key={tile} onClick={() => choose(tile)} className="rounded-xl border-2 border-sky-200 bg-sky-50 px-5 py-3 text-xl font-black hover:bg-sky-100 active:scale-95">
            {tile}
          </button>
        ))}
      </div>

      {feedback === "ok" && <Result ok text="¡Correcto!" />}
      {feedback === "no" && <Result ok={false} text="Sílaba incorrecta." />}
    </CompleteCard>
  );
}
