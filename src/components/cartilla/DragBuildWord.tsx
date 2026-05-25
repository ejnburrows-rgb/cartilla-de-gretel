import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CatalogEntry } from "@/types/cartilla";
import { GretelFeedback } from "./GretelFeedback";

interface DragBuildWordProps {
  entry: CatalogEntry;
  accent: string;
}

interface BuildTarget {
  word: string;
  pieces: string[];
}

const pieceWhileDrag = { scale: 1.15, zIndex: 10 };
const pieceWhileTap = { scale: 0.96 };

function labelStyle(accent: string): CSSProperties {
  return { color: accent, opacity: 0.7 };
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
    fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif",
  };
}

function slotStyle(filled: boolean, accent: string): CSSProperties {
  return {
    borderColor: filled ? accent : "rgba(120,53,15,0.3)",
    backgroundColor: filled ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
    color: filled ? accent : "rgba(120,53,15,0.3)",
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
  const [feedback, setFeedback] = useState<"ok" | "x" | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (target) {
      setSlots(new Array(target.pieces.length).fill(null));
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
    <div className="space-y-5">
      <div className="text-center">
        <div
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3"
          style={labelStyle(accent)}
        >
          Arrastra las piezas para formar la palabra
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {slots.map((s, i) => (
            <DropSlot key={i} index={i} value={s} accent={accent} onDrop={handleDrop} />
          ))}
        </div>
        <div
          className="text-xl sm:text-2xl font-bold mt-3 opacity-30"
          style={targetWordStyle(accent)}
        >
          → {target.word}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
        {palette.map((piece, i) => (
          <DragPiece key={`${piece}-${i}-${round}`} piece={piece} accent={accent} />
        ))}
      </div>

      <GretelFeedback state={feedback} onRetry={reset} />
    </div>
  );
}

function DragPiece({ piece, accent }: { piece: string; accent: string }) {
  return (
    <motion.div
      drag
      dragSnapToOrigin
      whileDrag={pieceWhileDrag}
      whileTap={pieceWhileTap}
      onDragEnd={(_, info) => {
        const event = new CustomEvent("cartilla:piece-drop", {
          detail: { piece, x: info.point.x, y: info.point.y },
        });
        window.dispatchEvent(event);
      }}
      className="px-6 py-4 sm:px-8 sm:py-5 rounded-3xl text-white text-2xl sm:text-4xl font-extrabold shadow-lg cursor-grab active:cursor-grabbing select-none touch-none hover:scale-105 active:scale-95 transition-transform"
      style={pieceStyle(accent)}
      role="button"
      aria-label={`Pieza ${piece}`}
    >
      {piece}
    </motion.div>
  );
}

function DropSlot({
  index,
  value,
  accent,
  onDrop,
}: {
  index: number;
  value: string | null;
  accent: string;
  onDrop: (index: number, piece: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={ref}
      className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl border-[5px] border-dashed flex items-center justify-center text-3xl sm:text-5xl font-extrabold transition-colors shadow-inner"
      style={slotStyle(filled, accent)}
    >
      {value ?? "_"}
    </div>
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
