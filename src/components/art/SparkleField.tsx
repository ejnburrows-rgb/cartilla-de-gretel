import React from "react";

/* ------------------------------------------------------------------ */
/*  SparkleField – ambient floating sparkle particles                  */
/* ------------------------------------------------------------------ */

interface SparkleFieldProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

/* 4-pointed diamond star path centred at (0,0) */
function diamondPath(cx: number, cy: number, s: number) {
  return `M${cx} ${cy - s} L${cx + s * 0.35} ${cy} L${cx} ${cy + s} L${cx - s * 0.35} ${cy} Z`;
}

/* Deterministic sparkle positions (10 particles) */
const SPARKLES = [
  { cx: 25, cy: 30, s: 5, delay: 0 },
  { cx: 85, cy: 18, s: 4, delay: 0.4 },
  { cx: 150, cy: 55, s: 6, delay: 0.8 },
  { cx: 210, cy: 25, s: 3, delay: 1.2 },
  { cx: 260, cy: 80, s: 5, delay: 0.2 },
  { cx: 45, cy: 140, s: 4, delay: 1.6 },
  { cx: 120, cy: 160, s: 5, delay: 0.6 },
  { cx: 190, cy: 130, s: 3, delay: 1.0 },
  { cx: 70, cy: 90, s: 4, delay: 1.4 },
  { cx: 240, cy: 150, s: 6, delay: 0.3 },
] as const;

/* Colour rotation for variety */
const COLORS = [
  "var(--art-primary, #c98c4f)",
  "var(--art-accent, #d4a76a)",
  "#e8c170",
  "#f0d48a",
] as const;

export function SparkleField({ animated = false, className, ...rest }: SparkleFieldProps) {
  const baseClass = ["art-sparkle-field", animated ? "art-sparkle-field--animated" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      aria-hidden="true"
      {...rest}
    >
      {SPARKLES.map((sp, i) => (
        <path
          key={i}
          className={animated ? "art-sparkle-particle" : undefined}
          d={diamondPath(sp.cx, sp.cy, sp.s)}
          fill={COLORS[i % COLORS.length]}
          opacity={0.5 + (i % 4) * 0.1}
          style={
            animated ? ({ "--sparkle-delay": `${sp.delay}s` } as React.CSSProperties) : undefined
          }
        />
      ))}
    </svg>
  );
}
