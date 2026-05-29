import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Eye, EyeOff, Volume2, X } from "lucide-react";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { GretelFeedback } from "@/components/gretel/GretelFeedback";
import { feelBus } from "@/lib/feel-bus";
import { MonochromeDrawing } from "./MonochromeDrawings";

type Word = { word: string; emoji?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tap-the-correct-syllable game */
export function SyllableTap({
  syllables,
  color,
  lessonId,
  onComplete,
}: {
  syllables: string[];
  color: string;
  lessonId?: string;
  onComplete?: () => void;
}) {
  const [target, setTarget] = useState(() => syllables[0]);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "no";
    picked: string;
    target: string;
  } | null>(null);
  const choices = useMemo(() => shuffle(syllables), [target, syllables]);
  const lastLogged = useRef(0);

  // Log a snapshot every 5 attempts and a final snapshot on unmount.
  useEffect(() => {
    if (!lessonId) return;
    if (tries > 0 && tries - lastLogged.current >= 5) {
      lastLogged.current = tries;
      recordEvent({
        lessonId,
        kind: "exercise",
        score,
        total: tries,
        meta: { exercise: "syllable_tap" },
      });
    }
  }, [tries, score, lessonId]);

  useEffect(() => {
    return () => {
      if (!lessonId) return;
      if (tries > 0 && tries !== lastLogged.current) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score,
          total: tries,
          meta: { exercise: "syllable_tap", final: true },
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const next = () => {
    const others = syllables.filter((s) => s !== target);
    setTarget(others[Math.floor(Math.random() * others.length)] ?? syllables[0]);
    setFeedback(null);
  };

  const pick = (s: string) => {
    setTries((t) => t + 1);
    if (s === target) {
      setScore((x) => x + 1);
      setFeedback({ kind: "ok", picked: s, target });
      speak(s);
      feelBus.emit("success");
      if (score + 1 === 4 && onComplete) {
        onComplete();
      }
      setTimeout(next, 1200);
    } else {
      setFeedback({ kind: "no", picked: s, target });
      speak(target);
      feelBus.emit("error");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-fredoka">Toca la sílaba que escuches</h3>
        <span className="text-xs font-bold text-foreground/60">
          {score} / {tries}
        </span>
      </div>
      <button
        onClick={() => speak(target)}
        className="mb-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold transition hover:brightness-105 active:scale-95 hover:translate-y-px"
        style={{ backgroundColor: color }}
      >
        <Volume2 className="w-4 h-4" /> Escuchar
      </button>
      <div className="flex flex-wrap gap-3">
        {choices.map((s) => (
          <button
            key={s}
            onClick={() => pick(s)}
            className={cn(
              "min-w-16 h-16 px-6 py-3 rounded-2xl text-xl font-bold font-fredoka border-3 transition duration-200 active:scale-95 hover:scale-[1.03]",
              feedback?.kind === "ok" && s === target && "bg-[#e6f4ea] text-[#2e7d32] border-[#81c784]",
              feedback?.kind === "no" &&
                s === feedback.picked &&
                "bg-[#fce8e6] border-[#e57373] text-[#c62828]",
              feedback?.kind === "no" &&
                s === target &&
                "bg-[#e6f4ea] border-[#81c784] text-[#2e7d32]",
            )}
            style={{
              borderColor: !feedback ? color : undefined,
              color: !feedback ? color : undefined,
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <GretelFeedback
        isCorrect={feedback?.kind === "ok" ? true : feedback?.kind === "no" ? false : null}
        message={
          feedback?.kind === "no" ? (
            <p>
              Tocaste <strong>«{feedback.picked}»</strong>. La sílaba correcta era{" "}
              <strong>«{feedback.target}»</strong>. Vuelve a escuchar y fíjate en el sonido inicial.
            </p>
          ) : feedback?.kind === "ok" ? (
            <p>
              <strong>«{feedback.target}»</strong> es la sílaba que sonaba. ¡Buen oído!
            </p>
          ) : null
        }
      >
        {feedback?.kind === "no" && (
          <div className="flex gap-2">
            <button
              onClick={() => speak(feedback.target)}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary"
            >
              <Volume2 className="w-3.5 h-3.5" /> Escuchar «{feedback.target}»
            </button>
            <button
              onClick={next}
              className="text-xs font-bold text-foreground/60 hover:text-foreground"
            >
              Siguiente →
            </button>
          </div>
        )}
      </GretelFeedback>
    </div>
  );
}

/** Match drawing to word */
export function WordMatch({
  words,
  color,
  lessonId,
  onComplete,
}: {
  words: Word[];
  color: string;
  lessonId?: string;
  onComplete?: () => void;
}) {
  const items = useMemo(() => words.slice(0, 4), [words]);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "no";
    word: string;
  } | null>(null);
  const loggedRound = useRef(false);
  const shuffled = useMemo(() => shuffle(items), [items]);

  if (items.length < 2) return null;

  const onWord = (w: string) => {
    if (matched.has(w)) return;
    setPicked(w);
    setFeedback(null);
  };
  const onDrawing = (target: string) => {
    if (!picked) return;
    setAttempts((a) => a + 1);
    if (picked === target) {
      setHits((h) => h + 1);
      feelBus.emit("success");
      setMatched((m) => {
        const next = new Set(m).add(target);
        if (next.size === items.length && !loggedRound.current) {
          if (lessonId) {
            loggedRound.current = true;
            recordEvent({
              lessonId,
              kind: "exercise",
              score: hits + 1,
              total: attempts + 1,
              meta: { exercise: "word_match", completed: true, items: items.length },
            });
          }
          if (onComplete) onComplete();
        }
        return next;
      });
      setFeedback({ kind: "ok", word: picked });
      speak(target);
      setPicked(null);
      setTimeout(
        () => setFeedback((f) => (f?.kind === "ok" && f.word === target ? null : f)),
        1800,
      );
    } else {
      feelBus.emit("error");
      setFeedback({
        kind: "no",
        word: picked,
      });
      setPicked(null);
    }
  };
  const reset = () => {
    if (lessonId && attempts > 0 && !loggedRound.current) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: hits,
        total: attempts,
        meta: { exercise: "word_match", completed: false },
      });
    }
    setMatched(new Set());
    setPicked(null);
    setAttempts(0);
    setHits(0);
    setFeedback(null);
    loggedRound.current = false;
  };
  const allDone = matched.size === items.length;
  const acc = attempts > 0 ? Math.round((hits / attempts) * 100) : null;

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold font-fredoka">Une la palabra con su dibujo</h3>
        <div className="flex items-center gap-3">
          {acc !== null && (
            <span className="text-xs font-bold text-foreground/60">
              {hits}/{attempts} · {acc}%
            </span>
          )}
          <button
            onClick={reset}
            className="text-xs inline-flex items-center gap-1 text-foreground/60 hover:text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2.5">
          {items.map((w) => {
            const wordBtnStyle: React.CSSProperties = {
              borderColor: color,
              color: matched.has(w.word) ? undefined : color,
            };
            return (
              <button
                key={w.word}
                disabled={matched.has(w.word)}
                onClick={() => onWord(w.word)}
                className={cn(
                  "w-full h-14 px-4 py-2 rounded-2xl border-3 font-bold font-fredoka text-left transition duration-200",
                  matched.has(w.word)
                    ? "opacity-30 line-through border-gray-200 bg-gray-50 text-gray-400"
                    : picked === w.word
                      ? "scale-[1.04] bg-primary/10 border-primary shadow-md"
                      : "hover:bg-secondary/50 hover:scale-[1.02] active:scale-95",
                )}
                style={wordBtnStyle}
              >
                {w.word}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {shuffled.map((w) => (
            <button
              key={w.word}
              disabled={matched.has(w.word)}
              onClick={() => onDrawing(w.word)}
              className={cn(
                "w-full h-14 rounded-2xl border-3 transition duration-200 flex items-center justify-center p-1.5",
                matched.has(w.word)
                  ? "opacity-30 border-gray-200 bg-gray-50"
                  : "border-foreground/10 hover:bg-secondary/50 hover:scale-[1.04] active:scale-95 hover:shadow-md",
              )}
              aria-label={`Dibujo de ${w.word}`}
            >
              <MonochromeDrawing word={w.word} size={36} />
            </button>
          ))}
        </div>
      </div>
      <GretelFeedback
        isCorrect={feedback?.kind === "ok" ? true : feedback?.kind === "no" ? false : null}
        message={
          feedback?.kind === "no" ? (
            <p>
              <strong>«{feedback.word}»</strong> no es ese dibujo. Lee la palabra otra vez, separa sus sílabas y busca el dibujo que la representa.
            </p>
          ) : feedback?.kind === "ok" ? (
            <p>
              <strong>«{feedback.word}»</strong> — uniste bien la palabra con su dibujo.
            </p>
          ) : null
        }
      >
        {feedback?.kind === "no" && (
          <button
            onClick={() => speak(feedback.word)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            <Volume2 className="w-3.5 h-3.5" /> Escuchar «{feedback.word}»
          </button>
        )}
      </GretelFeedback>
      {allDone && (
        <div className="mt-3 rounded-xl border-2 border-success/40 bg-success/10 p-3">
          <div className="text-success font-bold inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> ¡Ronda completa!
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            Uniste todas las palabras. Resultado final:{" "}
            <strong>
              {hits} de {attempts} intentos
            </strong>{" "}
            ({acc}%).
          </p>
        </div>
      )}
    </div>
  );
}

/** Teacher answer key reveal — visible only to logged-in teachers or registered students */
export function TeacherAnswerKey({ items }: { items: Array<{ q: string; a: string }> }) {
  const [show, setShow] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const student = useStudentSession();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsTeacher(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setIsTeacher(!!s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isTeacher && !student) return null;

  return (
    <div className="rounded-2xl border-2 border-dashed border-foreground/20 bg-secondary/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm uppercase tracking-wide text-foreground/60">
          {isTeacher ? "Guía del maestro" : "Guía de estudio"}
        </h3>
        <button
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary"
        >
          {show ? (
            <>
              <EyeOff className="w-4 h-4" /> Ocultar
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Ver respuestas
            </>
          )}
        </button>
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-foreground/70 shrink-0">{i + 1}.</span>
            <span className="flex-1">{it.q}</span>
            <span
              className={cn(
                "font-bold transition",
                show ? "text-success" : "text-transparent bg-foreground/15 rounded select-none",
              )}
            >
              {show ? it.a : "••••"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
