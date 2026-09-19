import React from "react";

/* ------------------------------------------------------------------ */
/*  LetterMonogram – decorative oversized letter with sparkles         */
/* ------------------------------------------------------------------ */

interface LetterMonogramProps extends React.SVGProps<SVGSVGElement> {
  letter: string;
  color?: string;
}

/* Small 4-pointed star path centred at origin */
function starAt(cx: number, cy: number, size: number) {
  const s = size;
  return `M${cx} ${cy - s} L${cx + s * 0.3} ${cy} L${cx} ${cy + s} L${cx - s * 0.3} ${cy} Z`;
}

export function LetterMonogram({
  letter,
  color = "var(--art-primary, #c98c4f)",
  className,
  ...rest
}: LetterMonogramProps) {
  const filterId = `lm-shadow-${letter}`;
  const baseClass = ["art-letter-monogram", className].filter(Boolean).join(" ");

  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      role="img"
      aria-label={`Letra ${letter.toUpperCase()}`}
      {...rest}
    >
      <defs>
        {/* Subtle bevel / drop-shadow */}
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#00000030" />
        </filter>
      </defs>

      {/* Background circle wash */}
      <circle cx="100" cy="100" r="90" fill={color} opacity="0.08" />

      {/* Main letter */}
      <text
        x="100"
        y="125"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="120"
        fontWeight="800"
        fontFamily="'Outfit', 'Inter', system-ui, sans-serif"
        filter={`url(#${filterId})`}
      >
        {letter.toUpperCase()}
      </text>

      {/* Sparkle accents – 5 small stars around the letter */}
      {[
        { cx: 30, cy: 30, s: 8 },
        { cx: 170, cy: 25, s: 6 },
        { cx: 25, cy: 160, s: 5 },
        { cx: 175, cy: 155, s: 7 },
        { cx: 160, cy: 80, s: 5 },
      ].map((sp, i) => (
        <path key={i} d={starAt(sp.cx, sp.cy, sp.s)} fill={color} opacity={0.35 + (i % 3) * 0.1} />
      ))}
    </svg>
  );
}
