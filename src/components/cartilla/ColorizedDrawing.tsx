import type { CSSProperties } from "react";

import { MonochromeDrawing } from "./MonochromeDrawings";

interface DrawingPalette {
  accent: string;
  bg: string;
  glow: string;
}

interface ColorizedDrawingProps {
  word: string;
  size?: number;
  selected?: boolean;
  muted?: boolean;
  className?: string;
}

const fallbackPalette: DrawingPalette = {
  accent: "#3b82f6",
  bg: "linear-gradient(180deg, #ffffff, #eef6ff)",
  glow: "0 18px 35px rgba(59, 130, 246, 0.16)",
};

const paletteByInitial: Record<string, DrawingPalette> = {
  a: {
    accent: "#ef476f",
    bg: "linear-gradient(180deg, #fff5f7, #ffe6ec)",
    glow: "0 18px 35px rgba(239, 71, 111, 0.18)",
  },
  e: {
    accent: "#f9844a",
    bg: "linear-gradient(180deg, #fff8ed, #ffe4c8)",
    glow: "0 18px 35px rgba(249, 132, 74, 0.18)",
  },
  i: {
    accent: "#118ab2",
    bg: "linear-gradient(180deg, #f0fbff, #d9f4ff)",
    glow: "0 18px 35px rgba(17, 138, 178, 0.16)",
  },
  o: {
    accent: "#2a9d6f",
    bg: "linear-gradient(180deg, #f2fff8, #dff7eb)",
    glow: "0 18px 35px rgba(42, 157, 111, 0.17)",
  },
  u: {
    accent: "#9b5de5",
    bg: "linear-gradient(180deg, #fbf7ff, #eadcff)",
    glow: "0 18px 35px rgba(155, 93, 229, 0.17)",
  },
  m: {
    accent: "#2f6fed",
    bg: "linear-gradient(180deg, #f5f8ff, #e3ecff)",
    glow: "0 18px 35px rgba(47, 111, 237, 0.16)",
  },
};

function getPalette(word: string): DrawingPalette {
  const initial = word.trim().charAt(0).toLowerCase();
  return paletteByInitial[initial] ?? fallbackPalette;
}

export function ColorizedDrawing({
  word,
  size = 58,
  selected = false,
  muted = false,
  className = "",
}: ColorizedDrawingProps) {
  const palette = getPalette(word);

  const shellStyle: CSSProperties = {
    background: palette.bg,
    borderColor: selected ? palette.accent : "rgba(28, 25, 23, 0.1)",
    boxShadow: selected ? palette.glow : "0 10px 22px rgba(28, 25, 23, 0.08)",
    opacity: muted ? 0.48 : 1,
  };

  const accentStyle: CSSProperties = {
    backgroundColor: palette.accent,
  };

  return (
    <span
      className={`relative inline-flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border bg-white p-1 transition duration-200 ${className}`}
      style={shellStyle}
    >
      <span
        className="pointer-events-none absolute left-2 top-2 h-2.5 w-2.5 rounded-full"
        style={accentStyle}
      />
      <span className="pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/80" />
      <span className="flex items-center justify-center rounded-xl bg-white/58 p-1.5 backdrop-blur-sm">
        <MonochromeDrawing word={word} size={size} />
      </span>
      <span className="mt-1 max-w-full truncate text-[10px] font-black uppercase tracking-wide text-stone-700">
        {word}
      </span>
    </span>
  );
}
