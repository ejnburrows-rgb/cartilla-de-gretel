import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RotateCcw, Eye, EyeOff, Volume2, X } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { gretelEvent } from "@/lib/gretel-bus";
import { EscucharInstruccionButton } from "./EscucharInstruccionButton";

type Word = { word: string; emoji?: string; illustrationSrc?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { SyllableTapGame as SyllableTap } from "./SyllableTapGame";

/**
 * Match word ↔ picture. Prefer real illustrationSrc; never show emoji as
 * object/picture substitutes (launch bar: no emoji object hints).
 */
export function WordMatch({
  words,
  color,
  lessonId,
}: {
  words: Word[];
  color: string;
  lessonId?: string;
}) {
  const { play, playingText } = useAudio();
  // Prefer items with real art; fall back to word-only tiles (honest, no emoji)
  const items = useMemo(() => {
    const withArt = words.filter((w) => w.illustrationSrc).slice(0, 4);
    if (withArt.length >= 2) return withArt;
    return words.filter((w) => w.word?.trim()).slice(0, 4);
  }, [words]);
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
  const onPicture = (target: string) => {
    if (!picked) return;
    setAttempts((a) => a + 1);
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
      gretelEvent("answer:correct");
      setFeedback({ kind: "ok", word: picked });
      play(target);
      setPicked(null);
      setTimeout(
        () => setFeedback((f) => (f?.kind === "ok" && f.word === target ? null : f)),
        1800,
      );
    } else {
      gretelEvent("answer:wrong");
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
    <div
      className="rounded-2xl border-2 border-foreground/10 bg-card p-4"
      data-emoji-objects="false"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Une la palabra con la imagen</h3>
          <EscucharInstruccionButton text="Une la palabra con la imagen" />
        </div>
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
                playingText === w.word && "animate-pulse ring-4 ring-current",
              )}
              style={{ borderColor: color, color: matched.has(w.word) ? undefined : color }}
            >
              {w.word}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffled.map((w) => (
            <button
              key={w.word}
              type="button"
              disabled={matched.has(w.word)}
              onClick={() => onPicture(w.word)}
              aria-label={
                w.illustrationSrc ? `Dibujo de ${w.word}` : `Ilustración pendiente: ${w.word}`
              }
              className={cn(
                "w-full min-h-[3.25rem] rounded-xl border-2 transition overflow-hidden flex items-center justify-center bg-white",
                matched.has(w.word)
                  ? "opacity-40"
                  : "border-foreground/10 hover:bg-secondary active:scale-95",
              )}
            >
              {w.illustrationSrc ? (
                <img
                  src={w.illustrationSrc}
                  alt=""
                  className="max-h-14 w-auto object-contain p-1"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <span className="text-[11px] font-bold text-stone-400 px-2 text-center">
                  pendiente
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {feedback?.kind === "ok" && (
        <div className="mt-3 rounded-xl border-2 border-success/30 bg-success/5 p-3">
          <div className="text-sm font-bold text-success inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> ¡Correcto!
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            <strong>«{feedback.word}»</strong> — uniste bien la palabra con su dibujo.
          </p>
        </div>
      )}
      {feedback?.kind === "no" && (
        <div className="mt-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
          <div className="text-sm font-bold text-destructive inline-flex items-center gap-1.5">
            <X className="w-4 h-4" /> No coinciden
          </div>
          <p className="text-sm text-foreground/80 mt-1">
            <strong>«{feedback.word}»</strong> no es ese dibujo. Lee la palabra otra vez, separa sus
            sílabas y busca el dibujo que la representa.
          </p>
          <button
            onClick={() => play(feedback.word)}
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

/** Teacher answer key reveal â€" visible only to logged-in teachers or registered students */
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

