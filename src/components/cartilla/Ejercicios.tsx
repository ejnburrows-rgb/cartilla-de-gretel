import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Eye, EyeOff, Volume2, X } from "lucide-react";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";

type Word = { word: string; emoji?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function primaryButtonStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function neutralChoiceStyle(color: string): CSSProperties {
  return { borderColor: `${color}44` };
}

function selectedChoiceStyle(color: string): CSSProperties {
  return { borderColor: color, color };
}

/** Tap-the-correct-syllable game */
export function SyllableTap({
  syllables,
  color,
  lessonId,
}: {
  syllables: string[];
  color: string;
  lessonId?: string;
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
      setTimeout(next, 1200);
    } else {
      setFeedback({ kind: "no", picked: s, target });
      speak(target);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Toca la sílaba que escuches</h3>
        <span className="text-xs font-bold text-foreground/60">
          {score} / {tries}
        </span>
      </div>
      <button
        onClick={() => speak(target)}
        className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold"
        style={primaryButtonStyle(color)}
      >
        <Volume2 className="w-4 h-4" /> Escuchar
      </button>
      <div className="flex flex-wrap gap-2">
        {choices.map((s) => (
          <button
            key={s}
            onClick={() => pick(s)}
            className={cn(
              "min-w-14 px-4 py-3 rounded-xl text-lg font-bold border-2 transition active:scale-95",
              feedback?.kind === "ok" && s === target && "bg-success text-white border-success",
              feedback?.kind === "no" &&
                s === feedback.picked &&
                "bg-destructive/10 border-destructive text-destructive",
              feedback?.kind === "no" &&
                s === target &&
                "bg-success/10 border-success text-success",
            )}
            style={feedback ? undefined : neutralChoiceStyle(color)}
          >
            {s}
          </button>
        ))}
      </div>
      {feedback?.kind === "no" && (
        <div className="mt-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
          <div className="text-sm font-bold text-destructive inline-flex items-center gap-1.5">
            <X className="w-4 h-4" /> Incorrecto
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            Tocaste <strong>«{feedback.picked}»</strong>. La sílaba correcta era{" "}
            <strong>«{feedback.target}»</strong>. Vuelve a escuchar y fíjate en el sonido inicial.
          </p>
          <div className="mt-2 flex gap-2">
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
        </div>
      )}
      {feedback?.kind === "ok" && (
        <div className="mt-3 rounded-xl border-2 border-success/30 bg-success/5 p-3">
          <div className="text-sm font-bold text-success inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> ¡Correcto!
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            <strong>«{feedback.target}»</strong> es la sílaba que sonaba. ¡Buen oído!
          </p>
        </div>
      )}
    </div>
  );
}

/** Match word to its syllable structure */
export function WordMatch({
  words,
  color,
  lessonId,
}: {
  words: Word[];
  color: string;
  lessonId?: string;
}) {
  const SYLLABLE_MAP: Record<string, string> = useMemo(() => ({
    ala: "a-la",
    elefante: "e-le-fan-te",
    iglú: "i-glú",
    oso: "o-so",
    uva: "u-va",
    uvas: "u-vas",
    ojo: "o-jo",
    ola: "o-la",
    olla: "o-lla",
    árbol: "ár-bol",
    avión: "a-vión",
    abeja: "a-be-ja",
    escoba: "es-co-ba",
    espejo: "es-pe-jo",
    estrella: "es-tre-lla",
    isla: "is-la",
    iguana: "i-gua-na",
    imán: "i-mán",
    uña: "u-ña",
    uno: "u-no",
    urna: "ur-na",
  }), []);

  const items = useMemo(() => words.slice(0, 4), [words]);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "no";
    word: string;
    syllables: string;
    correctSyllables?: string;
  } | null>(null);
  const loggedRound = useRef(false);
  const shuffled = useMemo(() => shuffle(items), [items]);

  if (items.length < 2) return null;

  const onWord = (w: string) => {
    if (matched.has(w)) return;
    setPicked(w);
    setFeedback(null);
  };

  const onSyllable = (target: string) => {
    if (!picked) return;
    setAttempts((a) => a + 1);
    const pickedSyllable = SYLLABLE_MAP[picked.toLowerCase()] || picked;
    const targetSyllable = SYLLABLE_MAP[target.toLowerCase()] || target;
    if (picked === target) {
      setHits((h) => h + 1);
      setMatched((m) => {
        const next = new Set(m).add(target);
        if (next.size === items.length && !loggedRound.current && lessonId) {
          loggedRound.current = true;
          recordEvent({
            lessonId,
            kind: "exercise",
            score: hits + 1,
            total: attempts + 1,
            meta: { exercise: "word_match", completed: true, items: items.length },
          });
        }
        return next;
      });
      setFeedback({ kind: "ok", word: picked, syllables: pickedSyllable });
      speak(target);
      setPicked(null);
      setTimeout(
        () => setFeedback((f) => (f?.kind === "ok" && f.word === target ? null : f)),
        1800,
      );
    } else {
      setFeedback({
        kind: "no",
        word: picked,
        syllables: targetSyllable,
        correctSyllables: pickedSyllable,
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
        <h3 className="font-bold">Une la palabra con sus sílabas</h3>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {items.map((w) => (
            <button
              key={w.word}
              disabled={matched.has(w.word)}
              onClick={() => onWord(w.word)}
              className={cn(
                "w-full px-3 py-2 rounded-xl border-2 font-bold text-left transition",
                matched.has(w.word)
                  ? "opacity-40 line-through"
                  : picked === w.word
                    ? "scale-[1.02]"
                    : "hover:bg-secondary",
              )}
              style={picked === w.word ? selectedChoiceStyle(color) : undefined}
            >
              {w.word}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffled.map((w) => {
            const syllableText = SYLLABLE_MAP[w.word.toLowerCase()] || w.word;
            return (
              <button
                key={w.word}
                disabled={matched.has(w.word)}
                onClick={() => onSyllable(w.word)}
                className={cn(
                  "w-full text-lg py-2 font-bold rounded-xl border-2 transition",
                  matched.has(w.word)
                    ? "opacity-40"
                    : "border-foreground/10 hover:bg-secondary active:scale-95 text-foreground/80",
                )}
              >
                {syllableText}
              </button>
            );
          })}
        </div>
      </div>
      {feedback?.kind === "ok" && (
        <div className="mt-3 rounded-xl border-2 border-success/30 bg-success/5 p-3">
          <div className="text-sm font-bold text-success inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> ¡Correcto!
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            <strong>«{feedback.word}»</strong> se divide en sílabas como <strong>«{feedback.syllables}»</strong>. ¡Buen trabajo!
          </p>
        </div>
      )}
      {feedback?.kind === "no" && (
        <div className="mt-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
          <div className="text-sm font-bold text-destructive inline-flex items-center gap-1.5">
            <X className="w-4 h-4" /> No coinciden
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            La palabra <strong>«{feedback.word}»</strong> no se divide como <strong>«{feedback.syllables}»</strong>.
            Su división correcta es <strong>«{feedback.correctSyllables}»</strong>. Inténtalo de nuevo.
          </p>
          <button
            onClick={() => speak(feedback.word)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            <Volume2 className="w-3.5 h-3.5" /> Escuchar «{feedback.word}»
          </button>
        </div>
      )}
      {allDone && (
        <div className="mt-3 rounded-xl border-2 border-success/40 bg-success/10 p-3">
          <div className="text-success font-bold inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> ¡Ronda completa!
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            Uniste todas las palabras con su división silábica. Resultado final:{" "}
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
