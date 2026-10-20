import { useEffect, useMemo, useState, useRef } from "react";
import { RotateCcw, Timer } from "lucide-react";
import type { GameContent, WordItem } from "@/lib/games/gameContent";
import { playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import { PickMark, usePickMark } from "./PickMark";

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
  return <PickMark correct={ok} text={text} />;
}

function CompleteCard({ children, reset }: { children: React.ReactNode; reset: () => void }) {
  return (
    <section className="kid-card p-5 sm:p-7 space-y-5">
      <button
        type="button"
        onClick={reset}
        aria-label="Reiniciar"
        className="min-h-11 rounded-xl border-2 px-4"
      >
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
      </button>
      {children}
    </section>
  );
}

export function MariposasGame({ content }: { content: GameContent }) {
  const marking = usePickMark();
  const [wordIndex, setWordIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const word = content.words[wordIndex];
  const done = wordIndex >= content.words.length;

  const reset = () => {
    marking.clear();
    setWordIndex(0);
    setPicked([]);
    setFeedback(null);
    setScore(0);
  };

  if (done) {
    return (
      <CompleteCard reset={reset}>
        <h2 className="text-2xl font-black text-center">¡Las mariposas volvieron al jardín!</h2>
        <p className="text-center font-bold text-stone-600">
          {score} de {content.words.length} palabras completas
        </p>
        <button
          onClick={reset}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Jugar otra vez
        </button>
      </CompleteCard>
    );
  }

  const choose = (tile: string) => {
    if (feedback || marking.pick) return;
    const next = [...picked, tile];
    const expected = word.syllables.slice(0, next.length);
    const validPrefix = next.every(
      (value, i) => value.toLocaleLowerCase("es") === expected[i]?.toLocaleLowerCase("es"),
    );
    if (!validPrefix) {
      setFeedback("no");
      marking.mark(tile, false, () => {
        setPicked([]);
        setFeedback(null);
      });
      return;
    }
    setPicked(next);
    if (next.length < word.syllables.length) marking.mark(tile, true);
    if (next.length === word.syllables.length) {
      setFeedback("ok");
      setScore((s) => s + 1);
      marking.mark(tile, true, () => {
        const nextIndex = wordIndex + 1;
        if (nextIndex === content.words.length)
          finishGame(content, score + 1, content.words.length);
        setWordIndex(nextIndex);
        setPicked([]);
        setFeedback(null);
      });
    }
  };

  return (
    <CompleteCard reset={reset}>
      <div className="text-center">
        <button
          type="button"
          aria-label={`Escuchar ${word.word}`}
          onClick={() => playWord(word.audioUrl, word.word)}
          className="min-h-11 min-w-11 rounded-xl border-2"
        >
          ▷
        </button>
        <p className="mx-auto mt-2 max-w-xs rounded-xl border-2 border-dashed border-stone-300 p-3 text-sm font-semibold text-stone-600">
          Ilustración de mariposa pendiente de fuente aprobada.
        </p>
        <p className="mt-2 text-sm font-bold text-stone-500">
          Palabra {wordIndex + 1} de {content.words.length}
        </p>
        <h2 className="text-3xl font-black mt-1">{word.word}</h2>
      </div>
      <div className="min-h-16 rounded-2xl border-2 border-dashed border-stone-300 bg-white p-3 flex flex-wrap justify-center gap-2">
        {word.syllables.map((_, i) => (
          <span
            key={i}
            className="min-w-16 rounded-xl bg-stone-100 px-4 py-3 text-center text-2xl font-black"
          >
            {picked[i] ?? "__"}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {(content.tiles ?? []).map((tile) => (
          <button
            key={tile}
            data-pick-mark={marking.attribute(tile)}
            disabled={!!marking.pick}
            onClick={() => choose(tile)}
            className="rounded-xl border-2 border-sky-200 bg-sky-50 py-3 text-xl font-black hover:bg-sky-100 active:scale-95"
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
  const marking = usePickMark();
  const target = content.letter.toLocaleLowerCase("es");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const allDone = Object.values(answers).filter(Boolean).length === content.words.length;

  const answer = (item: WordItem, saysStarts: boolean) => {
    if (item.word in answers || marking.pick) return;
    const correct = item.word.toLocaleLowerCase("es").startsWith(target) === saysStarts;
    marking.mark(item.word, correct, () => {
      if (!correct)
        setAnswers((a) => {
          const next = { ...a };
          delete next[item.word];
          return next;
        });
    });
    setAnswers((a) => ({ ...a, [item.word]: correct }));
    if (correct) setScore((s) => s + 1);
    if (correct && Object.values(answers).filter(Boolean).length + 1 === content.words.length) {
      finishGame(content, score + (correct ? 1 : 0), content.words.length);
    }
  };

  const reset = () => {
    marking.clear();
    setAnswers({});
    setScore(0);
  };

  return (
    <CompleteCard reset={reset}>
      <h2 className="text-xl font-black text-center">
        ¿Comienza con {content.letter.toUpperCase()}?
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {content.words.map((item) => {
          const marked = answers[item.word];
          const answered = item.word in answers;
          return (
            <div
              key={item.word}
              data-pick-mark={marking.attribute(item.word)}
              className={`rounded-2xl border-2 p-3 bg-white ${answered && marked && !marking.pick ? "border-emerald-400" : "border-stone-200"}`}
            >
              {item.imageUrl && (
                <button
                  type="button"
                  aria-label={`Escuchar ${item.word}`}
                  onClick={() => playWord(item.audioUrl, item.word)}
                >
                  <img
                    aria-hidden="true"
                    src={item.imageUrl}
                    alt=""
                    className="h-28 w-full object-contain"
                    loading="lazy"
                  />
                </button>
              )}
              <p className="text-center text-xl font-black mt-2">{item.word}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  disabled={answered || !!marking.pick}
                  onClick={() => answer(item, true)}
                  className="rounded-xl bg-emerald-100 px-3 py-2 font-bold disabled:opacity-50"
                >
                  Sí
                </button>
                <button
                  disabled={answered || !!marking.pick}
                  onClick={() => answer(item, false)}
                  className="rounded-xl bg-stone-100 px-3 py-2 font-bold disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {marking.pick && !marking.pick.correct && <PickMark correct={false} />}
      {allDone && (
        <div className="text-center space-y-3">
          <Result
            ok={score === content.words.length}
            text={`${score} de ${content.words.length} correctas`}
          />
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Repetir
          </button>
        </div>
      )}
    </CompleteCard>
  );
}

export function PhonicsCompleteGame({ content }: { content: GameContent }) {
  const marking = usePickMark();
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const done = index >= content.words.length;
  const item = content.words[index];
  const missingIndex = index % 2 === 0 ? 0 : Math.max(0, item?.syllables.length - 1);

  const reset = () => {
    marking.clear();
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (done) {
    return (
      <CompleteCard reset={reset}>
        <Result
          ok={score === content.words.length}
          text={`${score} de ${content.words.length} palabras completadas`}
        />
        <button
          onClick={reset}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const choose = (tile: string) => {
    if (feedback || marking.pick) return;
    const correct =
      tile.toLocaleLowerCase("es") === item.syllables[missingIndex].toLocaleLowerCase("es");
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    marking.mark(tile, correct, () => {
      if (correct) {
        if (index + 1 === content.words.length)
          finishGame(content, score + 1, content.words.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    });
  };

  return (
    <CompleteCard reset={reset}>
      <p className="text-center text-sm font-bold text-stone-500">Completa: {item.word}</p>
      <div className="flex justify-center gap-2 text-3xl font-black">
        {item.syllables.map((syllable, i) => (
          <span
            key={`${syllable}-${i}`}
            className="rounded-xl bg-white border-2 border-stone-200 px-4 py-3"
          >
            {i === missingIndex ? "___" : syllable}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {(content.tiles ?? []).map((tile) => (
          <button
            key={tile}
            data-pick-mark={marking.attribute(tile)}
            disabled={!!marking.pick}
            onClick={() => choose(tile)}
            className="rounded-xl bg-amber-100 border-2 border-amber-200 px-5 py-3 text-xl font-black hover:bg-amber-200"
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
  const marking = usePickMark();
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
    marking.clear();
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (!pairs.length) {
    return (
      <section role="status" className="kid-card border-2 border-dashed p-5">
        <h2 className="text-xl font-bold">Rimas pendientes de contenido verificado</h2>
        <p>
          No hay una pareja de rimas verificada del libro para esta actividad. Vuelve a Práctica y
          elige otro juego.
        </p>
      </section>
    );
  }

  if (!pair) {
    return (
      <CompleteCard reset={reset}>
        <Result ok text={`${score} de ${pairs.length} rimas encontradas`} />
        <button
          onClick={reset}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const candidates = content.words.filter((w) => w.word !== pair[0].word).slice(0, 4);
  if (!candidates.some((w) => w.word === pair[1].word)) candidates[candidates.length - 1] = pair[1];

  const choose = (candidate: WordItem) => {
    if (feedback || marking.pick) return;
    const correct = candidate.word === pair[1].word;
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    marking.mark(candidate.word, correct, () => {
      if (correct) {
        if (index + 1 === pairs.length) finishGame(content, score + 1, pairs.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    });
  };

  return (
    <CompleteCard reset={reset}>
      <p className="text-center text-sm font-bold text-stone-500">¿Qué palabra rima con…?</p>
      <div className="text-center text-4xl font-black">{pair[0].word}</div>
      <div className="grid grid-cols-2 gap-3">
        {candidates.map((candidate) => (
          <button
            key={candidate.word}
            data-pick-mark={marking.attribute(candidate.word)}
            disabled={!!marking.pick}
            onClick={() => choose(candidate)}
            className="rounded-2xl border-2 border-purple-200 bg-purple-50 py-4 text-xl font-black hover:bg-purple-100"
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
  }, [running, seconds]); // Removed count and content from dependencies to prevent timer resets

  const start = () => {
    hasFinishedRef.current = false;
    setCount(0);
    setSeconds(60);
    setRunning(true);
  };

  return (
    <CompleteCard reset={start}>
      <div className="flex items-center justify-between rounded-2xl bg-white border-2 border-stone-200 p-4">
        <span className="inline-flex items-center gap-2 font-black">
          <Timer className="h-5 w-5" /> {seconds}s
        </span>
        <span className="font-black">Leídas: {count}</span>
      </div>
      {!running && !finished && (
        <button
          onClick={start}
          className="w-full rounded-xl bg-primary py-3 text-lg font-black text-primary-foreground"
        >
          Empezar 1 minuto
        </button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {content.words.map((item, i) => (
          <button
            key={`${item.word}-${i}`}
            disabled={!running || i !== count}
            data-pick-mark={i < count ? "right" : undefined}
            onClick={() => {
              setCount((n) => Math.min(n + 1, content.words.length));
            }}
            className="rounded-xl border-2 border-stone-200 bg-white p-3 text-lg font-black disabled:opacity-60"
          >
            {item.word}
          </button>
        ))}
      </div>
      {running && count >= content.words.length && (
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(0);
            if (!hasFinishedRef.current) {
              hasFinishedRef.current = true;
              finishGame(content, count, content.words.length);
            }
          }}
          className="w-full rounded-xl bg-emerald-600 py-3 font-black text-white"
        >
          Terminé la lista
        </button>
      )}
      {finished && <Result ok text={`Leíste ${count} palabras.`} />}
      {finished && (
        <button
          onClick={start}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Otra vez
        </button>
      )}
    </CompleteCard>
  );
}

export function DrawingsGame({ content }: { content: GameContent }) {
  const marking = usePickMark();
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [score, setScore] = useState(0);
  const item = content.words[index];

  const reset = () => {
    marking.clear();
    setIndex(0);
    setFeedback(null);
    setScore(0);
  };

  if (!item) {
    return (
      <CompleteCard reset={reset}>
        <Result ok text={`${score} de ${content.words.length} dibujos correctos`} />
        <button
          onClick={reset}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Repetir
        </button>
      </CompleteCard>
    );
  }

  const choose = (candidate: WordItem) => {
    if (feedback || marking.pick) return;
    const correct = candidate.word === item.word;
    setFeedback(correct ? "ok" : "no");
    if (correct) setScore((s) => s + 1);
    playWord(candidate.audioUrl, candidate.word);
    marking.mark(candidate.word, correct, () => {
      if (correct) {
        if (index + 1 === content.words.length)
          finishGame(content, score + 1, content.words.length);
        setIndex((n) => n + 1);
      }
      setFeedback(null);
    });
  };

  return (
    <CompleteCard reset={reset}>
      <h2 className="text-center text-3xl font-black">{item.word}</h2>
      <div className="grid grid-cols-3 gap-3">
        {content.words.map((candidate) => (
          <button
            key={candidate.word}
            data-pick-mark={marking.attribute(candidate.word)}
            disabled={!!marking.pick}
            onClick={() => choose(candidate)}
            aria-label={`Dibujo de ${candidate.word}`}
            className="rounded-2xl border-2 border-stone-200 bg-white p-2 hover:border-primary active:scale-95"
          >
            {candidate.imageUrl ? (
              <img
                aria-hidden="true"
                src={candidate.imageUrl}
                alt=""
                className="h-32 w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="font-bold">{candidate.word}</span>
            )}
          </button>
        ))}
      </div>
      {feedback === "ok" && <Result ok text="¡Ese es el dibujo!" />}
      {feedback === "no" && (
        <Result ok={false} text="Busca el dibujo que corresponde a la palabra." />
      )}
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
