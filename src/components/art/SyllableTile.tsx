import React from "react";

/* ------------------------------------------------------------------ */
/*  SyllableTile – rounded card with paper texture + active glow       */
/* ------------------------------------------------------------------ */

interface SyllableTileProps extends React.SVGProps<SVGSVGElement> {
  syllable: string;
  onPress?: () => void;
  active?: boolean;
}

const FILTER_ID = "st-paper-noise";
const GLOW_ID = "st-active-glow";

export function SyllableTile({
  syllable,
  onPress,
  active = false,
  className,
  ...rest
}: SyllableTileProps) {
  const baseClass = ["art-syllable-tile", active ? "art-syllable-tile--active" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox="0 0 120 80"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      role="button"
      tabIndex={0}
      aria-label={`Sílaba ${syllable}`}
      aria-pressed={active}
      onClick={onPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPress?.();
        }
      }}
      {...rest}
    >
      <defs>
        {/* Paper-texture noise filter */}
        <filter id={FILTER_ID}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
        </filter>

        {/* Active glow */}
        <filter id={GLOW_ID}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Card shadow */}
      <rect x="4" y="6" width="112" height="70" rx="14" ry="14" fill="#00000012" />

      {/* Main card body */}
      <rect
        x="2"
        y="2"
        width="112"
        height="70"
        rx="14"
        ry="14"
        fill="var(--art-bg, #fdfcfa)"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        filter={active ? `url(#${GLOW_ID})` : `url(#${FILTER_ID})`}
      />

      {/* Syllable text */}
      <text
        x="60"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--art-primary, #c98c4f)"
        fontSize="28"
        fontWeight="700"
        fontFamily="'Outfit', 'Inter', system-ui, sans-serif"
      >
        {syllable}
      </text>
    </svg>
  );
}
