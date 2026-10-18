// LecturaPalabras.tsx — "Lectura de palabras" activity for one letter (Mm first).
//
// Source-faithful by contract: the section title, the three instructions, the
// word labels, the drawings, and the per-minute word grid are all verbatim from
// the teacher's DOCX files (see src/content/lectura-palabras/lectura-letras.ts).
//
// Two things are deliberately NOT implemented:
//  1. The syllable list after "Vamos a leer palabras con las sílabas:" is
//     MISSING from the source document — we render labeled "Pendiente"
//     placeholders and never invent syllables.
//  2. Word audio does not exist yet (owner rule: voice is "pendiente"). Tapping
//     a drawing shows the labeled "Audio pendiente" state; nothing is
//     synthesized.
//
// Interaction follows the source page: tap a drawing (its word plays — pending),
// drag it to the word it represents (or tap drawing then tap word), correct
// stays ("muy bien"), wrong returns ("trátalo de nuevo"), unlimited retries.
import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, Timer, X } from "lucide-react";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { KidButton } from "@/components/ui/KidButton";
import { playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";
import type {
  LecturaLetterActivity,
  LecturaMatchWord,
} from "@/content/lectura-palabras/lectura-letras";

function Status({ ok, text }: { ok: boolean; text: string }) {
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
        {ok ? <Check className="h-5 w-5" aria-hidden /> : <X className="h-5 w-5" aria-hidden />}
        {text}
      </span>
    </div>
  );
}

/** One syllable-list placeholder: the source document's box is empty. */
function SyllablePlaceholder({ index }: { index: number }) {
  return (
    <div
      aria-label={`Sílabas pendientes ${index + 1}`}
      className="flex h-16 min-w-0 items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/70 px-3 text-sm font-black text-amber-700"
    >
      Pendiente
    </div>
  );
}

function MatchingSection({ activity }: { activity: LecturaLetterActivity }) {
  const { words, drawingOrder, instructions } = activity.syllablesSection;
  const wordByLabel = new Map(words.map((w) => [w.word, w]));
  // Drawings still in the tray, in the source page's arrangement.
  const [tray, setTray] = useState<string[]>(() => [...drawingOrder]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [audioPending, setAudioPending] = useState(false);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const allMatched = Object.keys(matched).length === words.length;
  const finishRef = useRef(false);

  useEffect(() => {
    if (!allMatched || finishRef.current) return;
    finishRef.current = true;
    recordEvent({
      lessonId: `lectura-de-palabras:${activity.letter}`,
      kind: "exercise",
      score: words.length,
      total: words.length,
      meta: { exercise: "lectura-palabras-matching", completed: true, letter: activity.letter },
    });
  }, [allMatched, activity.letter, words.length]);

  const reset = () => {
    finishRef.current = false;
    setTray([...drawingOrder]);
    setSelected(null);
    setFeedback(null);
    setMatched({});
  };

  // Instruction 1: "Haz click en el dibujo, escucha la palabra."
  const tapDrawing = (label: string) => {
    const item = wordByLabel.get(label);
    if (!item) return;
    void item;
    // Word audio is pendiente (no recordings yet) — playWord() no-ops safely
    // and the UI labels the state instead of synthesizing anything.
    playWord();
    setAudioPending(true);
    window.setTimeout(() => setAudioPending(false), 1600);
    setSelected((prev) => (prev === label ? null : label));
  };

  // Instruction 2: "Arrastra el dibujo hasta la palabra que representa el dibujo."
  const placeDrawing = (label: string | null, word: string) => {
    if (!label) return;
    if (matched[word]) return;
    if (label === word) {
      // Instruction 3: "…el dibujo se queda con la palabra y escuchas 'muy bien'…"
      setMatched((m) => ({ ...m, [word]: true }));
      setTray((t) => t.filter((l) => l !== label));
      setFeedback({ ok: true, text: "muy bien" });
      setSelected(null);
    } else {
      // "…el dibujo sube a su lugar y escuchas: 'trátalo de nuevo'…"
      setFeedback({ ok: false, text: "trátalo de nuevo" });
      setSelected(null);
    }
  };

  return (
    <section className="kid-card p-5 sm:p-7 space-y-5" aria-label={activity.syllablesSection.title}>
      <h2 className="text-xl sm:text-2xl font-black text-center text-stone-800">
        {activity.syllablesSection.title}
      </h2>

      {/* The syllable list is missing from the source file — placeholders only. */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: activity.syllablesSection.placeholderCount }, (_, i) => (
            <SyllablePlaceholder key={i} index={i} />
          ))}
        </div>
        <p className="text-center text-xs font-bold text-amber-700">
          La lista de sílabas falta en el archivo original — pendiente.
        </p>
      </div>

      <ol className="space-y-1.5 text-sm sm:text-base font-semibold text-stone-700">
        {instructions.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-stone-400 font-black shrink-0">{i + 1}.</span>
            <span className="flex-1">{line}</span>
          </li>
        ))}
      </ol>

      {audioPending && (
        <p role="status" className="text-center text-xs font-black text-stone-500">
          Audio pendiente — la voz de Gretel se graba después.
        </p>
      )}

      {/* Drawings, in the source page's own arrangement. */}
      <ul className="grid grid-cols-5 gap-2" aria-label="Dibujos">
        {tray.map((label) => {
          const item = wordByLabel.get(label) as LecturaMatchWord;
          return (
            <li key={label} className="flex justify-center">
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", label);
                }}
                onClick={() => tapDrawing(label)}
                aria-label={`Dibujo de ${label}`}
                aria-pressed={selected === label}
                className={`h-20 w-full rounded-2xl border-2 bg-white p-1 transition-transform active:scale-95 sm:h-24 ${
                  selected === label
                    ? "border-primary ring-2 ring-primary"
                    : "border-stone-200 hover:border-primary"
                }`}
              >
                <img
                  src={item.drawing}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            </li>
          );
        })}
        {tray.length === 0 && (
          <li className="col-span-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center font-black text-emerald-800">
            ¡Todas las palabras tienen su dibujo!
          </li>
        )}
      </ul>

      {/* Word labels in the source page's order — drop targets. */}
      <ul className="grid grid-cols-5 gap-2" aria-label="Palabras">
        {words.map((w) => (
          <li key={w.word}>
            <button
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                placeDrawing(e.dataTransfer.getData("text/plain") || null, w.word);
              }}
              onClick={() => placeDrawing(selected, w.word)}
              aria-label={`Palabra ${w.word}${matched[w.word] ? " (completa)" : ""}`}
              className={`min-h-20 w-full rounded-2xl border-2 p-2 text-lg font-black transition-colors sm:min-h-24 ${
                matched[w.word]
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 bg-white hover:border-primary"
              }`}
            >
              {matched[w.word] ? (
                <span className="flex h-full flex-col items-center justify-center gap-1">
                  <img
                    src={w.drawing}
                    alt={w.word}
                    className="h-12 w-full object-contain sm:h-14"
                    draggable={false}
                  />
                  {w.word}
                </span>
              ) : (
                w.word
              )}
            </button>
          </li>
        ))}
      </ul>

      {feedback && <Status ok={feedback.ok} text={feedback.text} />}

      {allMatched && (
        <div className="text-center">
          <Status ok text={`muy bien — ${words.length} de ${words.length} palabras`} />
          <button
            onClick={reset}
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Repetir
          </button>
        </div>
      )}
    </section>
  );
}

function PerMinuteSection({ activity }: { activity: LecturaLetterActivity }) {
  const { title, instruction, words } = activity.perMinuteSection;
  const [duration, setDuration] = useState(60); // "ajusta el cronómetro"
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const finished = !running && seconds === 0;
  const finishedRef = useRef(false);
  const stateRef = useRef({ count, words: words.length });
  stateRef.current = { count, words: words.length };

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      if (!finishedRef.current) {
        finishedRef.current = true;
        recordEvent({
          lessonId: `lectura-de-palabras:${activity.letter}`,
          kind: "exercise",
          score: stateRef.current.count,
          total: stateRef.current.words,
          meta: { exercise: "lectura-palabras-minuto", completed: true, letter: activity.letter },
        });
      }
      return;
    }
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds, activity.letter]);

  const start = () => {
    finishedRef.current = false;
    setCount(0);
    setSeconds(duration);
    setRunning(true);
  };

  const adjust = (delta: number) => {
    if (running) return;
    const next = Math.min(120, Math.max(10, duration + delta));
    setDuration(next);
    setSeconds(next);
  };

  return (
    <section className="kid-card p-5 sm:p-7 space-y-5" aria-label={title}>
      <div className="space-y-1 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-stone-800">{title}</h2>
        <p className="text-sm sm:text-base font-semibold text-stone-600">{instruction}</p>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white border-2 border-stone-200 p-4">
        <span className="inline-flex items-center gap-2 font-black">
          <Timer className="h-5 w-5" aria-hidden /> {seconds}s
        </span>
        <div className="flex items-center gap-2" aria-label="Ajustar cronómetro">
          <KidButton
            variant="outline"
            sound={false}
            onClick={() => adjust(-10)}
            aria-label="Quitar 10 segundos"
            className="!p-2"
          >
            −10s
          </KidButton>
          <KidButton
            variant="outline"
            sound={false}
            onClick={() => adjust(10)}
            aria-label="Añadir 10 segundos"
            className="!p-2"
          >
            +10s
          </KidButton>
        </div>
        <span className="font-black" aria-live="polite">
          Leídas: {count}
        </span>
      </div>

      {!running && !finished && (
        <button
          onClick={start}
          className="w-full rounded-xl bg-primary py-3 text-lg font-black text-primary-foreground"
        >
          Empezar
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        {words.map((word, i) => (
          <button
            key={`${word}-${i}`}
            disabled={!running || i !== count}
            onClick={() => setCount((n) => Math.min(n + 1, words.length))}
            className={`rounded-xl border-2 p-3 text-lg font-black disabled:opacity-60 ${
              i < count ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white"
            }`}
          >
            {word}
          </button>
        ))}
      </div>

      {running && count >= words.length && (
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(0);
            if (!finishedRef.current) {
              finishedRef.current = true;
              recordEvent({
                lessonId: `lectura-de-palabras:${activity.letter}`,
                kind: "exercise",
                score: stateRef.current.count,
                total: stateRef.current.words,
                meta: {
                  exercise: "lectura-palabras-minuto",
                  completed: true,
                  letter: activity.letter,
                },
              });
            }
          }}
          className="w-full rounded-xl bg-emerald-600 py-3 font-black text-white"
        >
          Terminé la lista
        </button>
      )}

      {finished && (
        <div className="text-center space-y-3">
          <Status ok text={`Leíste ${count} palabras.`} />
          <button
            onClick={start}
            className="mx-auto inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Otra vez
          </button>
        </div>
      )}
    </section>
  );
}

export function LecturaPalabras({ activity }: { activity: LecturaLetterActivity }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:py-10 relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div className="flex justify-center">
          <GretelMascot
            pose="welcome"
            text={`Lectura de palabras — letra ${activity.letter}`}
            bubblePosition="top"
          />
        </div>
        <MatchingSection activity={activity} />
        <PerMinuteSection activity={activity} />
      </div>
    </main>
  );
}
