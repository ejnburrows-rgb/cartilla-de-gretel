import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Sparkles, Star, Timer, X } from "lucide-react";
import type { GameContent, WordItem } from "@/lib/games/gameContent";
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
      className={`rounded-2xl border-2 px-5 py-3.5 font-extrabold shadow-sm ${
        ok
          ? "game-correct-glow border-[#2F7D4A] bg-[#ECF9F0] text-[#1D5631]"
          : "game-wrong-nudge border-[#C2413A] bg-[#FDF0EF] text-[#8E2620]"
      }`}
    >
      <span className="inline-flex items-center gap-2.5 text-base sm:text-lg">
        {ok ? (
          <span className="game-star-pop inline-flex items-center gap-1 text-[#2F7D4A]">
            <Star className="h-5 w-5 fill-[#F2B632] text-[#D99B1E]" aria-hidden />
            <Check className="h-5 w-5" aria-hidden />
          </span>
        ) : (
          <X className="h-5 w-5 text-[#C2413A]" aria-hidden />
        )}
        {text}
      </span>
    </div>
  );
}

function CompleteCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-wood-frame">
      <section className="game-paper-board p-5 sm:p-8 space-y-6">{children}</section>
    </div>
  );
}

function ProgressPill({ current, total, score }: { current: number; total: number; score?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DCC8] pb-3">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F1E8] border border-[#D4C4A8] px-3.5 py-1.5 text-sm font-black text-[#25313A]">
        Paso {Math.min(current, total)} de {total}
      </span>
      {typeof score === "number" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6D6] border border-[#D99B1E] px-3.5 py-1.5 text-sm font-black text-[#25313A]">
          <Star className="h-4 w-4 fill-[#F2B632] text-[#D99B1E]" aria-hidden />
          {score} / {total}
        </span>
      )}
    </div>
  );
}

export function MariposasGame({ content }: { content: GameContent }) {
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

  if (done) {
    return (
      <CompleteCard>
        <div className="text-center space-y-2">
          <div className="game-star-pop justify-center">
            <Sparkles className="h-10 w-10 text-[#F2B632]" aria-hidden />
          </div>
          <h2 className="text-2xl font-black text-[#25313A]">¡Las mariposas volvieron al jardín!</h2>
          <p className="font-bold text-[#25313A]/80">
            {score} de {content.words.length} palabras completas
          </p>
        </div>
        <button
          onClick={reset}
          className="mx-auto flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> Jugar otra vez
        </button>
      </CompleteCard>
    );
  }

  const choose = (tile: string) => {
    if (feedback) return;
    const next = [...picked, tile];
    const expected = word.syllables.slice(0, next.length);
    const validPrefix = next.every(
      (value, i) => value.toLocaleLowerCase("es") === expected[i]?.toLocaleLowerCase("es"),
    );
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

  return (
    <CompleteCard>
      <ProgressPill current={wordIndex + 1} total={content.words.length} score={score} />
      <div className="text-center">
        <div className="text-5xl" aria-hidden>
          🦋
        </div>
        <h2 className="text-3xl sm:text-4xl font-black mt-2 text-[#25313A]">{word.word}</h2>
      </div>
      <div className="game-slot-well min-h-20 rounded-2xl p-3 flex flex-wrap justify-center gap-2.5">
        {word.syllables.map((_, i) => (
          <span
            key={i}
            className="min-w-16 min-h-14 inline-flex items-center justify-center rounded-xl bg-white border-2 border-[#D4C4A8] px-4 py-2 text-2xl font-black text-[#25313A] shadow-sm"
          >
            {picked[i] ?? "__"}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {(content.tiles ?? []).map((tile) => (
          <button
            key={tile}
            onClick={() => choose(tile)}
            className="game-tactile-tile min-h-14 rounded-2xl py-3 text-xl font-black"
          >
            {tile}
          </button>
        ))}
      </div>
      {feedback === "ok" && <Result ok text="¡Palabra completa!" />}
      {feedback === "no" && <Result ok={false} text="Prueba de nuevo desde la primera sílaba." />}
    </CompleteCard>
  );
}

export function VowelGame({ content }: { content: GameContent }) {
  const target = content.letter.toLocaleLowerCase("es");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const answeredCount = Object.keys(answers).length;
  const allDone = answeredCount === content.words.length;

  const answer = (item: WordItem, saysStarts: boolean) => {
    if (item.word in answers) return;
    const correct = item.word.toLocaleLowerCase("es").startsWith(target) === saysStarts;
    setAnswers((a) => ({ ...a, [item.word]: correct }));
    if (correct) setScore((s) => s + 1);
    if (answeredCount + 1 === content.words.length) {
      finishGame(content, score + (correct ? 1 : 0), content.words.length);
    }
  };

  const reset = () => {
    setAnswers({});
    setScore(0);
  };

  return (
    <CompleteCard>
      <ProgressPill current={answeredCount} total={content.words.length} score={score} />
      <h2 className="text-2xl sm:text-3xl font-black text-center text-[#25313A]">
        ¿Comienza con <span className="text-[#167A72]">{content.letter.toUpperCase()}</span>?
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.words.map((item) => {
          const marked = answers[item.word];
          const answered = item.word in answers;
          return (
            <div
              key={item.word}
              className={`rounded-2xl border-2 p-4 transition-all ${
                answered
                  ? marked
                    ? "border-emerald-400 game-correct-glow"
                    : "border-[#C2413A] game-wrong-nudge"
                  : "game-tactile-card"
              }`}
            >
              {item.imageUrl && (
                <div className="rounded-xl bg-white border border-[#E6DCC8] p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.word}
                    className="h-28 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
              <p className="text-center text-2xl font-black mt-3 text-[#25313A]">{item.word}</p>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => answer(item, true)}
                  className="min-h-14 rounded-xl border-2 border-[#2F7D4A] bg-[#ECF9F0] px-3 py-2 text-base font-black text-[#1D5631] shadow-[0_3px_0_#2F7D4A] hover:bg-[#D8F3E0] active:translate-y-[2px] active:shadow-none disabled:opacity-55 disabled:shadow-none"
                >
                  Sí
                </button>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => answer(item, false)}
                  className="min-h-14 rounded-xl border-2 border-[#C9B798] bg-[#F5F1E8] px-3 py-2 text-base font-black text-[#25313A] shadow-[0_3px_0_#B9A789] hover:bg-[#EDE5D5] active:translate-y-[2px] active:shadow-none disabled:opacity-55 disabled:shadow-none"
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="text-center space-y-4 pt-2">
          <Result ok={score === content.words.length} text={`${score} de ${content.words.length} correctas`} />
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
          >
            <RotateCcw className="h-5 w-5" aria-hidden /> Repetir
          </button>
        </div>
      )}
    </CompleteCard>
  );
}

export function PhonicsCompleteGame({ content }: { content: GameContent }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const done = index >= content.words.length;
  const item = content.words[index];
  const missingIndex = index % 2 === 0 ? 0 : Math.max(0, item?.syllables.length - 1);

  const reset = () => {
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (done) {
    return (
      <CompleteCard>
        <Result ok={score === content.words.length} text={`${score} de ${content.words.length} palabras completadas`} />
        <button
          type="button"
          onClick={reset}
          className="mx-auto flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const choose = (tile: string) => {
    if (feedback) return;
    const correct =
      tile.toLocaleLowerCase("es") === item.syllables[missingIndex].toLocaleLowerCase("es");
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (correct) {
        if (index + 1 === content.words.length) finishGame(content, score + 1, content.words.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    }, 650);
  };

  return (
    <CompleteCard>
      <ProgressPill current={index + 1} total={content.words.length} score={score} />
      <p className="text-center text-base font-extrabold text-[#25313A]/75">
        Completa la palabra: <span className="text-[#167A72]">{item.word}</span>
      </p>
      <div className="flex justify-center gap-3 text-3xl sm:text-4xl font-black">
        {item.syllables.map((syllable, i) => {
          const isBlank = i === missingIndex;
          return (
            <span
              key={`${syllable}-${i}`}
              className={`min-h-20 min-w-20 inline-flex items-center justify-center rounded-2xl px-5 py-3 ${
                isBlank
                  ? feedback === "ok"
                    ? "game-correct-glow border-2 border-[#2F7D4A] text-[#1D5631]"
                    : feedback === "no"
                      ? "game-wrong-nudge border-2 border-[#C2413A] text-[#8E2620]"
                      : "game-slot-well text-[#25313A]/45"
                  : "game-tactile-card text-[#25313A]"
              }`}
            >
              {isBlank ? (feedback === "ok" ? syllable : "___") : syllable}
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {(content.tiles ?? []).map((tile) => (
          <button
            key={tile}
            type="button"
            onClick={() => choose(tile)}
            className="game-tactile-tile min-h-14 min-w-16 rounded-2xl px-6 py-3 text-2xl font-black"
          >
            {tile}
          </button>
        ))}
      </div>
      {feedback === "ok" && <Result ok text="¡Correcto!" />}
      {feedback === "no" && <Result ok={false} text="Esa sílaba no completa la palabra." />}
    </CompleteCard>
  );
}

export function RhymeGame({ content }: { content: GameContent }) {
  const pairs = useMemo(() => {
    const result: Array<[WordItem, WordItem]> = [];
    const remaining = [...content.words];
    while (remaining.length) {
      const first = remaining.shift();
      if (!first) break;
      const ending = first.syllables.at(-1)?.toLocaleLowerCase("es");
      const matchIndex = remaining.findIndex(
        (w) => w.syllables.at(-1)?.toLocaleLowerCase("es") === ending,
      );
      if (matchIndex >= 0) result.push([first, remaining.splice(matchIndex, 1)[0]]);
    }
    return result;
  }, [content.words]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const pair = pairs[index];

  const reset = () => {
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (!pair) {
    return (
      <CompleteCard>
        <Result ok text={`${score} de ${pairs.length} rimas encontradas`} />
        <button
          type="button"
          onClick={reset}
          className="mx-auto flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const candidates = content.words.filter((w) => w.word !== pair[0].word).slice(0, 4);
  if (!candidates.some((w) => w.word === pair[1].word)) candidates[candidates.length - 1] = pair[1];

  const choose = (candidate: WordItem) => {
    if (feedback) return;
    const correct = candidate.word === pair[1].word;
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (correct) {
        if (index + 1 === pairs.length) finishGame(content, score + 1, pairs.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    }, 650);
  };

  const gridCols = candidates.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2";

  return (
    <CompleteCard>
      <ProgressPill current={index + 1} total={pairs.length} score={score} />
      <div className="text-center space-y-2">
        <p className="text-base font-extrabold text-[#25313A]/75">¿Qué palabra rima con…?</p>
        <div className="inline-block rounded-2xl border-2 border-[#D99B1E] bg-[#FFF6D6] px-8 py-4 text-4xl sm:text-5xl font-black text-[#25313A] shadow-sm">
          {pair[0].word}
        </div>
      </div>
      <div className={`grid ${gridCols} gap-3.5 pt-2`}>
        {candidates.map((candidate) => (
          <button
            key={candidate.word}
            type="button"
            onClick={() => choose(candidate)}
            className="game-tactile-card min-h-16 rounded-2xl px-4 py-4 text-2xl font-black text-[#25313A] hover:bg-[#F5F1E8]"
          >
            {candidate.word}
          </button>
        ))}
      </div>
      {feedback === "ok" && <Result ok text="¡Riman!" />}
      {feedback === "no" && <Result ok={false} text="Busca la misma sílaba final." />}
    </CompleteCard>
  );
}

export function WordsPerMinuteGame({ content }: { content: GameContent }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [count, setCount] = useState(0);
  const finished = !running && seconds === 0;

  const countRef = useRef(count);
  countRef.current = count;
  const contentRef = useRef(content);
  contentRef.current = content;
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        finishGame(contentRef.current, countRef.current, contentRef.current.words.length);
      }
      return;
    }
    const timer = window.setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  const start = () => {
    hasFinishedRef.current = false;
    setCount(0);
    setSeconds(60);
    setRunning(true);
  };

  return (
    <CompleteCard>
      <div className="flex items-center justify-between rounded-2xl bg-[#F5F1E8] border-2 border-[#D4C4A8] px-5 py-4">
        <span className="inline-flex items-center gap-2 text-xl font-black text-[#25313A]">
          <Timer className="h-6 w-6 text-[#167A72]" aria-hidden /> {seconds}s
        </span>
        <span className="inline-flex items-center gap-2 text-xl font-black text-[#25313A]">
          <Star className="h-5 w-5 fill-[#F2B632] text-[#D99B1E]" aria-hidden />
          Leídas: {count}
        </span>
      </div>

      {!running && !finished && (
        <button
          type="button"
          onClick={start}
          className="w-full min-h-14 rounded-2xl bg-[#167A72] py-3.5 text-lg font-black text-white shadow-[0_4px_0_#0F544E] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          Empezar 1 minuto
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {content.words.map((item, i) => {
          const isRead = i < count;
          const isCurrent = running && i === count;
          return (
            <button
              key={`${item.word}-${i}`}
              type="button"
              disabled={!running || i !== count}
              onClick={() => setCount((n) => Math.min(n + 1, content.words.length))}
              className={`min-h-14 rounded-2xl border-2 px-3 py-3 text-xl font-black transition-all ${
                isRead
                  ? "border-[#2F7D4A] bg-[#ECF9F0] text-[#1D5631]"
                  : isCurrent
                    ? "game-tactile-tile ring-2 ring-[#F2B632]/50"
                    : "border-[#DFD3BC] bg-white text-[#25313A]/60"
              } disabled:cursor-default`}
            >
              {item.word}
            </button>
          );
        })}
      </div>

      {running && count >= content.words.length && (
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
            if (!hasFinishedRef.current) {
              hasFinishedRef.current = true;
              finishGame(content, count, content.words.length);
            }
          }}
          className="w-full min-h-14 rounded-2xl bg-[#2F7D4A] py-3.5 text-lg font-black text-white shadow-[0_4px_0_#1D5631]"
        >
          Terminé la lista
        </button>
      )}
      {finished && <Result ok text={`Leíste ${count} palabras.`} />}
      {finished && (
        <button
          type="button"
          onClick={start}
          className="mx-auto flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> Otra vez
        </button>
      )}
    </CompleteCard>
  );
}

export function DrawingsGame({ content }: { content: GameContent }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const item = content.words[index];

  const reset = () => {
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (!item) {
    return (
      <CompleteCard>
        <Result ok text={`${score} de ${content.words.length} dibujos correctos`} />
        <button
          type="button"
          onClick={reset}
          className="mx-auto flex min-h-14 items-center gap-2 rounded-2xl bg-[#167A72] px-6 py-3 font-black text-white shadow-[0_4px_0_#0F544E] active:translate-y-[2px] active:shadow-[0_2px_0_#0F544E]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const choose = (candidate: WordItem) => {
    if (feedback) return;
    const correct = candidate.word === item.word;
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    playWord(candidate.audioUrl);
    setTimeout(() => {
      if (correct) {
        if (index + 1 === content.words.length) finishGame(content, score + 1, content.words.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    }, 650);
  };

  return (
    <CompleteCard>
      <ProgressPill current={index + 1} total={content.words.length} score={score} />
      <div className="text-center">
        <span className="inline-block rounded-2xl border-2 border-[#D99B1E] bg-[#FFF6D6] px-8 py-3 text-3xl sm:text-4xl font-black text-[#25313A] shadow-sm">
          {item.word}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {content.words.map((candidate) => (
          <button
            key={candidate.word}
            type="button"
            onClick={() => choose(candidate)}
            aria-label={`Dibujo de ${candidate.word}`}
            className="game-tactile-card min-h-36 sm:min-h-44 rounded-2xl bg-white p-4 flex items-center justify-center"
          >
            {candidate.imageUrl ? (
              <img
                src={candidate.imageUrl}
                alt={candidate.word}
                className="h-32 sm:h-36 w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="font-bold">{candidate.word}</span>
            )}
          </button>
        ))}
      </div>
      {feedback === "ok" && <Result ok text="¡Ese es el dibujo!" />}
      {feedback === "no" && <Result ok={false} text="Busca el dibujo que corresponde a la palabra." />}
    </CompleteCard>
  );
}

export function CoreGame({ content }: { content: GameContent }) {
  switch (content.type) {
    case "mariposas":
      return <MariposasGame content={content} />;
    case "juego-vocal":
      return <VowelGame content={content} />;
    case "fonetica-completar":
      return <PhonicsCompleteGame content={content} />;
    case "lectura-rima":
      return <RhymeGame content={content} />;
    case "palabras-por-minuto":
      return <WordsPerMinuteGame content={content} />;
    case "dibujos":
      return <DrawingsGame content={content} />;
    default:
      return null;
  }
}
