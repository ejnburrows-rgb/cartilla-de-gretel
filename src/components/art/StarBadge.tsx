import React from "react";

/* ------------------------------------------------------------------ */
/*  StarBadge – 5-pointed star with gradient shine / empty outline     */
/* ------------------------------------------------------------------ */

interface StarBadgeProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
  size?: number;
  color?: string;
}

/* 5-pointed star centred at (50,50) r=42 */
const STAR_PATH = "M50 8 L61 36 L92 36 L67 56 L76 86 L50 68 L24 86 L33 56 L8 36 L39 36 Z";

export function StarBadge({
  filled = false,
  size = 48,
  color = "#d4a76a",
  className,
  ...rest
}: StarBadgeProps) {
  const gradId = "sb-gold-grad";
  const sheenId = "sb-sheen";
  const baseClass = [
    "art-star-badge",
    filled ? "art-star-badge--filled" : "art-star-badge--empty",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const sizeStyle: React.CSSProperties = { width: size, height: size };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      style={sizeStyle}
      role="img"
      aria-label={filled ? "Estrella completa" : "Estrella vacía"}
      {...rest}
    >
      <defs>
        {/* Golden gradient */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>

        {/* Top-left shine overlay */}
        <radialGradient id={sheenId} cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {filled ? (
        <>
          {/* Filled golden star */}
          <path d={STAR_PATH} fill={`url(#${gradId})`} />
          {/* Shine bevel */}
          <path d={STAR_PATH} fill={`url(#${sheenId})`} />
        </>
      ) : (
        /* Empty outline star */
        <path d={STAR_PATH} fill="none" stroke="#b0b0b0" strokeWidth="2.5" strokeLinejoin="round" />
      )}
    </svg>
  );
}
