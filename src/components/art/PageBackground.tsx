import React from "react";

/* ------------------------------------------------------------------ */
/*  PageBackground – pastel wash + decorative motifs per letter        */
/* ------------------------------------------------------------------ */

interface PageBackgroundProps extends React.SVGProps<SVGSVGElement> {
  letter: string;
}

/* Colour families keyed by letter category */
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

const WARM: readonly [string, string, string] = ["#fde8d0", "#fceabb", "#fdd6b5"];
const COOL: readonly [string, string, string] = ["#d0e8fd", "#d5eadb", "#ddd6fd"];

function palette(letter: string): readonly [string, string, string] {
  return VOWELS.has(letter.toLowerCase()) ? WARM : COOL;
}

/* Deterministic pseudo-random from letter code-point */
function scatter(letter: string) {
  const seed = letter.toLowerCase().charCodeAt(0);
  const positions: Array<{ cx: number; cy: number; r: number }> = [];
  for (let i = 0; i < 14; i++) {
    const s = (seed * (i + 3) * 17) % 100;
    positions.push({
      cx: 40 + ((s * 7 + i * 53) % 720),
      cy: 30 + ((s * 11 + i * 37) % 540),
      r: 3 + (s % 5),
    });
  }
  return positions;
}

export function PageBackground({ letter, className, ...rest }: PageBackgroundProps) {
  const [c0, c1, c2] = palette(letter);
  const dots = scatter(letter);
  const gradId = `pg-bg-grad-${letter}`;
  const baseClass = ["art-page-background", className].filter(Boolean).join(" ");

  return (
    <svg
      viewBox="0 0 800 600"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c0} />
          <stop offset="50%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>

      {/* Full background wash */}
      <rect width="800" height="600" fill={`url(#${gradId})`} />

      {/* Decorative scattered dots */}
      {dots.map((d, i) => (
        <circle
          key={`d${i}`}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="var(--art-accent, #d4a76a)"
          opacity={0.15 + (i % 4) * 0.05}
        />
      ))}

      {/* Gentle wave curves */}
      <path
        d="M0 500 Q200 460 400 490 T800 470"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        opacity="0.12"
      />
      <path
        d="M0 530 Q250 500 500 520 T800 510"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1.5"
        opacity="0.08"
      />

      {/* Leaf shapes in corners */}
      <path
        d="M30 30 Q50 10 70 30 Q50 50 30 30 Z"
        fill="var(--art-accent, #d4a76a)"
        opacity="0.1"
      />
      <path
        d="M730 560 Q750 540 770 560 Q750 580 730 560 Z"
        fill="var(--art-accent, #d4a76a)"
        opacity="0.1"
      />
      <path
        d="M720 30 Q740 10 760 30 Q740 50 720 30 Z"
        fill="var(--art-primary, #c98c4f)"
        opacity="0.08"
      />
      <path
        d="M30 560 Q50 540 70 560 Q50 580 30 560 Z"
        fill="var(--art-primary, #c98c4f)"
        opacity="0.08"
      />
    </svg>
  );
}
