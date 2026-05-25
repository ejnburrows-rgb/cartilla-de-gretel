import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Hand, RotateCcw } from "lucide-react";
import type { CatalogEntry } from "@/types/cartilla";
import { GretelFeedback } from "./GretelFeedback";
import { cn } from "@/lib/utils";

interface DragBuildWordProps {
  entry: CatalogEntry;
  accent: string;
}

interface BuildTarget {
  word: string;
  pieces: string[];
}

const pieceWhileDrag = { scale: 1.12, zIndex: 10, rotate: -2 };
const pieceWhileTap = { scale: 0.95 };
const activityCompleteMotion = {
  ok: { scale: [1, 1.015, 1], boxShadow: "0 22px 42px rgba(5,150,105,0.18)" },
  x: { x: [0, -6, 6, -3, 0], boxShadow: "0 22px 42px rgba(225,29,72,0.14)" },
};

function labelStyle(accent: string): CSSProperties {
  return { color: accent, opacity: 0.75 };
}

function targetWordStyle(accent: string): CSSProperties {
  return {
    color: accent,
    fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif",
  };
}

function pieceStyle(accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    borderBottom: "4px solid rgba(0,0,0,0.24)",
    fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif",
  };
}

function slotStyle(filled: boolean, accent: string): CSSProperties {
  return {
    borderColor: filled ? accent : "rgba(120,53,15,0.22)",
    backgroundColor: filled ? "#fffdfa" : "#faf5e8",
    color: filled ? accent : "rgba(120,53,15,0.25)",
    boxShadow: filled ? "none" : "inset 0 4px 8px rgba(44,30,22,0.12)",
    fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif",
  };
}

function buildTarget(entry: CatalogEntry): BuildTarget | null {
  if (entry.kind === "vowel") {
    const lesson = (entry as { lesson?: { vocab?: Array<{ word: string }> } }).lesson;
    const word = lesson?.vocab?.[0]?.word;
    if (!word) return null;
    return { word, pieces: word.toLowerCase().split("") };
  }
  if (entry.kind === "consonant") {
    const data = (entry as { data?: { syllables?: string[] } }).data;
    const syllables = data?.syllables ?? [];
    if (syllables.length === 0) return null;
    const first = syllables[0];
    const known: Record<string, string> = {
      ma: "mamá",
      pa: "papá",
      sa: "sapo",
      ta: "taza",
      da: "dado",
      la: "lana",
      na: "nada",
      ba: "bata",
      va: "vaca",
      ra: "rata",
      ga: "gato",
      fa: "fama",
      ja: "jaca",
      ca: "casa",
      ya: "yate",
      za: "zapato",
    };
    if (known[first]) {
      const w = known[first];
      const mid = Math.ceil(w.length / 2);
      return { word: w, pieces: [w.slice(0, mid), w.slice(mid)] };
    }
    if (syllables.length >= 2) {
      return { word: syllables[0] + syllables[1], pieces: [syllables[0], syllables[1]] };
    }
    return { word: first + first, pieces: [first, first] };
  }
  return { word: "oa", pieces: ["o", "a"] };
}

export function DragBuildWord({ entry, accent }: DragBuildWordProps) {
  const target = useMemo(() => buildTarget(entry), [entry]);
  const [slots, setSlots] = useState<Array<string | null>>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "x" | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (target) {
      setSlots(new Array(target.pieces.length).fill(null));
      setSelectedPiece(null);
      setFeedback(null);
    }
  }, [target, round]);

  const palette = useMemo(() => {
    if (!target) return [];
    const all = [...target.pieces];
    const pool = ["la", "lo", "su", "ti", "po", "mu"];
    const distractors = pool.filter((d) => !all.includes(d)).slice(0, 2);
    const combined = [...all, ...distractors];
    return combined
      .map((v, i) => ({ v, k: (i + round * 7) % combined.length }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.v);
  }, [target, round]);

  const filledCount = slots.filter((s) => s !== null).length;
  const isComplete = !!target && filledCount === target.pieces.length;
  const isCorrect =
    isComplete && !!target && slots.every((s, i) => s === target.pieces[i]);

  useEffect(() => {
    if (!isComplete) return;
    if (isCorrect) {
      setFeedback("ok");
      playSound("ok");
    } else {
      setFeedback("x");
      playSound("x");
    }
  }, [isComplete, isCorrect]);

  const handleDrop = (slotIndex: number, piece: string) => {
    setSlots((prev) => {
      if (prev[slotIndex] !== null) return prev;
      const next = [...prev];
      next[slotIndex] = piece;
      return next;
    });
    setSelectedPiece(null);
  };

  const reset = () => setRound((r) => r + 1);

  if (!target) {
    return (
      <div className="rounded-2xl bg-white/60 border-2 border-dashed border-amber-900/20 p-6 text-center text-amber-900/60 italic">
        Ejercicio próximamente para esta lección.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,rgba(255,248,235,0.92))] p-5 sm:p-6 shadow-[0_20px_50px_rgba(50,30,10,0.06)] relative overflow-hidden"
      animate={feedback ? activityCompleteMotion[feedback] : { x: 0, scale: 1, boxShadow: "0 20px 50px rgba(50,30,10,0.06)" }}
      transition={{ duration: feedback === "x" ? 0.34 : 0.5, ease: "easeOut" }}
    >
      <div className="text-center">
        <div
          className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2"
          style={labelStyle(accent)}
        >
          Forma la palabra
        </div>
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-950/5 px-3.5 py-1 text-[11px] font-black text-amber-900/70">
          <Hand className="h-3.5 w-3.5" />
          Arrastra una pieza, o tócala y luego toca un espacio.
        </p>
        {selectedPiece && (
          <motion.div
            className="mx-auto mb-4 flex max-w-sm items-center justify-center gap-2 rounded-2xl border-2 border-amber-900/15 bg-amber-50 px-4 py-3 text-sm font-black text-amber-950 shadow-inner"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-white px-3 text-xl shadow-sm" style={targetWordStyle(accent)}>
              {selectedPiece}
            </span>
            <span>Toca un espacio brillante para colocarla.</span>
          </motion.div>
        )}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap my-4">
          {slots.map((s, i) => (
            <DropSlot
              key={i}
              index={i}
              value={s}
              accent={accent}
              selectedPiece={selectedPiece}
              onDrop={handleDrop}
            />
          ))}
        </div>
        <div
          className="text-xl sm:text-2xl font-bold mt-4 opacity-40 select-none"
          style={targetWordStyle(accent)}
        >
          → {target.word}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
        {palette.map((piece, i) => (
          <DragPiece
            key={`${piece}-${i}-${round}`}
            piece={piece}
            accent={accent}
            selected={selectedPiece === piece}
            onSelect={() => setSelectedPiece((current) => (current === piece ? null : piece))}
          />
        ))}
      </div>

      {isComplete && feedback === "x" && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-center text-sm font-black text-rose-800 animate-bounce">
          Casi. Revisa el orden de las piezas y prueba otra vez.
        </div>
      )}
      {isComplete && feedback === "ok" && (
        <div className="rounded-3xl border border-emerald-250 bg-emerald-50/80 px-4 py-3 text-center text-sm font-black text-emerald-800">
          <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />
          ¡Gran trabajo! Formaste {target.word}.
        </div>
      )}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-900/15 bg-white px-5 py-2 text-sm font-black text-amber-950 transition hover:bg-stone-50 active:scale-95"
        >
          <RotateCcw className="h-4 w-4 text-amber-900" />
          Intentar de nuevo
        </button>
      </div>

      <GretelFeedback state={feedback} onRetry={reset} />
    </motion.div>
  );
}

function DragPiece({
  piece,
  accent,
  selected,
  onSelect,
}: {
  piece: string;
  accent: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      drag
      dragSnapToOrigin
      whileDrag={pieceWhileDrag}
      whileTap={pieceWhileTap}
      whileHover={{ scale: 1.04, rotate: -0.5 }}
      onClick={onSelect}
      onDragEnd={(_, info) => {
        const event = new CustomEvent("cartilla:piece-drop", {
          detail: { piece, x: info.point.x, y: info.point.y },
        });
        window.dispatchEvent(event);
      }}
      className={cn(
        "relative min-h-16 px-6 py-4 sm:px-8 sm:py-5 rounded-3xl text-white text-2xl sm:text-4xl font-black shadow-md cursor-grab active:cursor-grabbing select-none touch-none hover:shadow-lg active:translate-y-px active:border-b-2 transition-all duration-200 overflow-hidden",
        selected && "ring-4 ring-offset-2 ring-offset-background ring-amber-500/30 scale-105 shadow-2xl",
      )}
      style={pieceStyle(accent)}
      aria-label={`Pieza ${piece}`}
      aria-pressed={selected}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.5),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.22),transparent)]" />
      <span className="relative z-10">{piece}</span>
    </motion.button>
  );
}

function DropSlot({
  index,
  value,
  accent,
  selectedPiece,
  onDrop,
}: {
  index: number;
  value: string | null;
  accent: string;
  selectedPiece: string | null;
  onDrop: (index: number, piece: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handler(e: Event) {
      if (!ref.current || value !== null) return;
      const ce = e as CustomEvent<{ piece: string; x: number; y: number }>;
      const rect = ref.current.getBoundingClientRect();
      const { x, y, piece } = ce.detail;
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        onDrop(index, piece);
      }
    }
    window.addEventListener("cartilla:piece-drop", handler);
    return () => window.removeEventListener("cartilla:piece-drop", handler);
  }, [index, value, onDrop]);

  const filled = value !== null;
  const canTapPlace = !filled && selectedPiece !== null;

  return (
    <motion.button
      type="button"
      ref={ref}
      onClick={() => {
        if (selectedPiece) onDrop(index, selectedPiece);
      }}
      className={cn(
        "relative w-20 h-20 sm:w-28 sm:h-28 rounded-3xl border-4 border-dashed flex items-center justify-center text-3xl sm:text-5xl font-black transition-all duration-200 shadow-inner overflow-hidden",
        canTapPlace && "scale-105 ring-4 ring-amber-500/20 bg-amber-50/60 border-amber-900/40 shadow-[0_0_0_8px_rgba(251,191,36,0.14)]",
      )}
      style={slotStyle(filled, accent)}
      animate={canTapPlace ? { y: [0, -3, 0] } : { y: 0 }}
      transition={{ duration: 0.7, repeat: canTapPlace ? Infinity : 0, ease: "easeInOut" }}
      aria-label={filled ? `Espacio ${index + 1}: ${value}` : `Espacio ${index + 1}`}
    >
      {canTapPlace && <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.95),transparent_58%)]" />}
      <span className="relative z-10">{value ?? "_"}</span>
    </motion.button>
  );
}

function playSound(kind: "ok" | "x") {
  try {
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    if (kind === "ok") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else {
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // no-op
  }
}
