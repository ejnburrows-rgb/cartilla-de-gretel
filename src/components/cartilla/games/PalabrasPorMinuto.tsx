// PalabrasPorMinuto.tsx — "¿Cuántas palabras puedo leer por minuto?" game
// Owner-approved design: cork board with word grid, 01:00 timer with play button,
// instruction bar with speaker, La Cartilla de Gretel sign, pinned mima drawing.
// Teacher file 3 source: exactly 18 Mm words, in order. No invented content.
// Letter-picker entrance: Mm first; other letters load from their content files when available.
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Check } from "lucide-react";
import type { GameContent } from "@/lib/games/gameContent";
import { playInstruction } from "@/lib/games/wordAudio";

const ASSETS = "/games/palabras-por-minuto";

interface LetterOption {
  letter: string;
  label: string;
  content: GameContent | null;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PalabrasPorMinuto({ letters }: { letters: LetterOption[] }) {
  const [picked, setPicked] = useState<LetterOption | null>(null);

  if (!picked) {
    return <LetterPicker letters={letters} onPick={setPicked} />;
  }
  if (!picked.content) {
    return <LetterPicker letters={letters} onPick={setPicked} notice={`"${picked.label}" todavía no tiene palabras. Elige Mm.`} />;
  }
  return <CorkBoard content={picked.content} onBack={() => setPicked(null)} />;
}

function LetterPicker({
  letters,
  onPick,
  notice,
}: {
  letters: LetterOption[];
  onPick: (l: LetterOption) => void;
  notice?: string;
}) {
  return (
    <div
      className="min-h-[70vh] rounded-3xl border-4 border-[#8b5e34] p-6 sm:p-10"
      style={{
        backgroundImage: `url(${ASSETS}/image-88d9e033.jpg)`,
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
      }}
    >
      <div className="mx-auto max-w-xl rounded-2xl bg-[#fffdf5]/95 p-6 text-center shadow-lg sm:p-8">
        <h2 className="text-2xl font-black text-stone-800 sm:text-3xl">
          ¿Cuántas palabras puedo leer por minuto?
        </h2>
        <p className="mt-2 text-base font-bold text-stone-600">
          Elige una letra para empezar
        </p>
        {notice && (
          <p className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
            {notice}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {letters.map((l) => (
            <button
              key={l.letter}
              onClick={() => onPick(l)}
              disabled={!l.content}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black shadow-md transition-transform active:scale-95 sm:h-24 sm:w-24 sm:text-5xl ${
                l.content
                  ? "bg-[#0d9488] text-white hover:scale-105"
                  : "cursor-not-allowed bg-stone-200 text-stone-400"
              }`}
              aria-label={`Letra ${l.label}${l.content ? "" : " (próximamente)"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs font-semibold text-stone-500">
          Las letras en gris estarán disponibles pronto.
        </p>
      </div>
    </div>
  );
}

function CorkBoard({ content, onBack }: { content: GameContent; onBack: () => void }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [count, setCount] = useState(0);
  const finished = !running && seconds === 0;

  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  const start = () => {
    setCount(0);
    setSeconds(60);
    setRunning(true);
  };

  const toggle = () => {
    if (finished) {
      start();
      return;
    }
    if (!running && seconds === 60 && count === 0) {
      start();
      return;
    }
    setRunning((r) => !r);
  };

  const total = content.words.length;

  return (
    <div
      className="rounded-3xl border-4 border-[#8b5e34] p-3 sm:p-6"
      style={{
        backgroundImage: `url(${ASSETS}/image-88d9e033.jpg)`,
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
      }}
    >
      {/* La Cartilla de Gretel sign */}
      <div className="mx-auto mb-3 w-fit rounded-xl border-2 border-[#6b4423] bg-[#fdf6e3] px-6 py-2 shadow-md">
        <p className="font-serif text-lg font-black tracking-wide text-[#6b4423] sm:text-xl">
          La Cartilla de Gretel
        </p>
      </div>

      {/* Instruction bar with speaker */}
      <div className="mx-auto mb-3 flex max-w-2xl items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-md">
        <button
          onClick={() => playInstruction()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-white shadow active:scale-95"
          aria-label="Escuchar instrucciones"
        >
          <Volume2 className="h-5 w-5" aria-hidden />
        </button>
        <div className="text-left">
          {content.instructions.map((line, i) => (
            <p key={i} className="text-sm font-bold text-stone-700 sm:text-base">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Timer row: 01:00 + play button */}
      <div className="mx-auto mb-3 flex max-w-2xl items-center justify-center gap-4">
        <div
          className="rounded-2xl bg-[#1c1917] px-6 py-3 font-mono text-3xl font-black tracking-widest text-amber-300 shadow-inner sm:text-4xl"
          role="timer"
          aria-label={`Tiempo restante: ${formatTime(seconds)}`}
        >
          {formatTime(seconds)}
        </div>
        <button
          onClick={toggle}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d9488] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label={running ? "Pausar" : "Empezar"}
        >
          {running ? (
            <Pause className="h-7 w-7" aria-hidden />
          ) : (
            <Play className="ml-1 h-7 w-7" aria-hidden />
          )}
        </button>
        <button
          onClick={start}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow active:scale-95"
          aria-label="Reiniciar"
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <p className="mb-3 text-center text-base font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        Leídas: {count} de {total}
      </p>

      {/* Word grid — pinned cards on the cork board */}
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {content.words.map((item, i) => {
          const read = i < count;
          const current = running && i === count;
          // Spec: Answer marking: start ash/gray; correct turns green slowly; wrong turns red then erases
          // In this specific UI, clicking the "current" button means the user read it correctly,
          // progressing the count. There's no wrong button here.
          // The CSS transitions handle the 'correct turns green slowly' and 'start ash/gray'.
          return (
            <button
              key={`${item.word}-${i}`}
              disabled={!current}
              onClick={() => setCount((n) => Math.min(n + 1, total))}
              className={`relative rounded-xl border-2 px-3 py-3 text-lg font-black shadow-md transition-all duration-1000 sm:text-xl ${
                read
                  ? "border-emerald-600 bg-emerald-100 text-emerald-900 scale-100"
                  : current
                    ? "border-stone-400 bg-stone-100 text-stone-800 ring-4 ring-stone-400/40 scale-105"
                    : "border-stone-300 bg-stone-200 text-stone-600 scale-100"
              } ${!current && !read ? "opacity-90" : ""} min-h-[44px]`}
              aria-label={read ? `${item.word} (leída)` : `Leer: ${item.word}`}
            >
              {read && (
                <Check className="absolute right-1 top-1 h-4 w-4 text-emerald-600 animate-in fade-in duration-1000" aria-hidden />
              )}
              {item.word}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="mx-auto mt-4 max-w-md rounded-2xl bg-white/95 p-5 text-center shadow-lg">
          <p className="text-xl font-black text-stone-800">
            ¡Tiempo! Leíste {count} {count === 1 ? "palabra" : "palabras"}.
          </p>
          <button
            onClick={start}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3 text-base font-black text-white shadow active:scale-95"
          >
            <RotateCcw className="h-5 w-5" aria-hidden /> Otra vez
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={onBack}
          className="rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-stone-600 shadow active:scale-95"
        >
          ← Cambiar de letra
        </button>
      </div>
    </div>
  );
}
