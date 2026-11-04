import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, RotateCcw, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { gretelEvent } from "@/lib/gretel-bus";
import { cancelGretelSpeech, speakAsGretel } from "@/lib/gretel-voice";
import { matchesSyllablePhonetically } from "@/lib/phoneme-matcher";
import { recordEvent } from "@/lib/student-session";

interface GretelMirrorProps {
  syllables: string[];
  words: Array<{ word: string }>;
  color: string;
  lessonId?: string;
  onComplete?: () => void;
}

type MirrorStatus = "idle" | "listening" | "correct" | "retry";

function buildTargets(syllables: string[], words: Array<{ word: string }>): string[] {
  const canonical = [...syllables.slice(0, 3), ...words.slice(0, 2).map((item) => item.word)]
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(canonical)];
}

export function GretelMirror({ syllables, words, color, lessonId, onComplete }: GretelMirrorProps) {
  const targets = useMemo(() => buildTargets(syllables, words), [syllables, words]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<MirrorStatus>("idle");
  const completedRef = useRef(false);
  const handledTranscriptRef = useRef("");
  const wasListeningRef = useRef(false);
  const current = targets[index] ?? "";
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition({ lang: "es-MX" });

  useEffect(() => {
    if (isListening) {
      wasListeningRef.current = true;
      return;
    }
    if (wasListeningRef.current) {
      wasListeningRef.current = false;
      gretelEvent("listen:stop");
    }
  }, [isListening]);

  useEffect(() => {
    if (!transcript.trim() || transcript === handledTranscriptRef.current || !current) return;
    handledTranscriptRef.current = transcript;
    gretelEvent("listen:stop");
    const correct = matchesSyllablePhonetically(current, transcript);
    setStatus(correct ? "correct" : "retry");
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: correct ? 1 : 0,
        total: 1,
        meta: { exercise: "gretel_mirror", target: current, matched: correct },
      });
    }
  }, [current, lessonId, transcript]);

  useEffect(() => {
    if (!error) return;
    gretelEvent("listen:stop");
    setStatus("retry");
  }, [error]);

  useEffect(() => {
    return () => {
      stopListening();
      gretelEvent("listen:stop");
    };
  }, [stopListening]);

  const hear = () => {
    stopListening();
    setStatus("idle");
    void speakAsGretel(current);
  };

  const listen = () => {
    cancelGretelSpeech();
    setStatus("listening");
    gretelEvent("listen:start");
    startListening();
  };

  const advance = () => {
    if (status !== "correct") return;
    if (index >= targets.length - 1) {
      if (!completedRef.current) {
        completedRef.current = true;
        gretelEvent("activity:complete");
        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: targets.length,
            total: targets.length,
            meta: { exercise: "gretel_mirror", completed: true },
          });
        }
        onComplete?.();
      }
      return;
    }
    setIndex((value) => value + 1);
    setStatus("idle");
  };

  if (!targets.length) {
    return (
      <p className="rounded-2xl bg-white p-5 text-center text-sm font-bold text-stone-600">
        Esta lección todavía no tiene contenido canónico para practicar aquí.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-xl space-y-4" aria-label="El espejo de Gretel">
      <div className="rounded-3xl border bg-white p-5 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
          El espejo de Gretel · {index + 1} de {targets.length}
        </p>
        <p className="mt-4 text-sm font-bold text-stone-600">Escucha y repite</p>
        <div className="mt-2 text-5xl font-black" style={{ color }}>
          {current}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={hear}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-black text-stone-700 shadow-sm"
          >
            <Volume2 className="h-5 w-5" /> Escuchar a Gretel
          </button>
          <button
            type="button"
            onClick={listen}
            disabled={!isSupported || isListening}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: color }}
          >
            <Mic className="h-5 w-5" /> {isListening ? "Escuchando…" : "Ahora tú"}
          </button>
        </div>

        {!isSupported && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            El micrófono de práctica no está disponible en este navegador. Puedes escuchar a Gretel igualmente.
          </p>
        )}

        {status === "listening" && (
          <p className="mt-4 text-sm font-black text-sky-700" role="status">Te escucho…</p>
        )}
        {status === "correct" && (
          <div className="mt-4 space-y-3" role="status">
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
              ¡Muy bien!
            </p>
            <button
              type="button"
              onClick={advance}
              className="min-h-11 rounded-2xl px-5 py-2.5 text-sm font-black text-white shadow-sm"
              style={{ background: color }}
            >
              {index >= targets.length - 1 ? "Terminar" : "Siguiente"}
            </button>
          </div>
        )}
        {status === "retry" && (
          <div className="mt-4 flex flex-col items-center gap-3" role="status">
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-900">
              Casi. Escucha y prueba otra vez.
            </p>
            <button
              type="button"
              onClick={listen}
              disabled={!isSupported}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm font-black text-stone-700 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Intentar otra vez
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
