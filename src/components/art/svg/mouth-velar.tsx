import React from "react";

interface MouthVelarProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const SKIN = "#d4a76a";
const TONGUE = "#e8a0a0";
const TEETH = "#f5f5f0";
const PALATE = "#f0c4c4";
const LIPS = "#e07070";
const AIRFLOW = "#90cdf4";
const CAVITY = "#fdf0f0";
const THROAT = "#f5dada";

export function MouthVelar({ size, className, animated = false }: MouthVelarProps) {
  const sizeProps: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;

  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mouth diagram: velar position for k, g sounds"
      className={className}
      style={sizeProps}
    >
      {animated && (
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .velar-contact-glow {
                animation: velarGlow 1.4s ease-in-out infinite;
              }
              @keyframes velarGlow {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
            }
          `}</style>
        </defs>
      )}

      {/* Face profile outline */}
      <path
        d="M30 10 Q28 20 25 30 Q22 35 20 40 L18 45 Q16 48 18 50
           L22 52 Q24 54 24 58 L24 62 Q24 66 22 68
           L20 72 Q18 74 18 76 Q18 80 20 84
           L24 90 Q28 96 32 100
           L38 108 Q46 115 55 120 L65 126
           Q75 132 88 136 Q100 138 115 136
           L130 132 Q142 126 150 118
           L158 108 Q164 98 167 88 L170 75
           Q172 60 170 48 L167 38
           Q164 28 160 20 Q156 14 150 10"
        fill="none"
        stroke={SKIN}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nasal cavity */}
      <path
        d="M30 20 Q42 18 56 22 Q66 26 72 34 L70 44 Q62 40 52 38 Q42 37 34 38 L30 20"
        fill={CAVITY}
        stroke={SKIN}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Hard palate */}
      <path
        d="M56 48 Q78 38 102 36 Q122 35 142 40 Q150 43 152 48"
        fill="none"
        stroke={PALATE}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Soft palate (velum) — contact zone emphasized */}
      <path
        d="M152 48 Q158 52 160 60 Q162 68 158 74 Q156 78 152 80"
        fill={PALATE}
        stroke={PALATE}
        strokeWidth="2.5"
        fillOpacity="0.7"
      />

      {/* Uvula */}
      <path
        d="M152 80 Q150 86 152 90 Q154 86 152 80"
        fill={PALATE}
        stroke={PALATE}
        strokeWidth="1.5"
      />

      {/* Oral cavity interior */}
      <path
        d="M56 52 Q82 46 112 44 Q138 43 152 48
           L160 60 Q162 68 158 74 L152 80
           Q142 72 132 70 Q120 68 108 72
           Q90 78 75 84 Q65 88 58 90
           Q52 85 50 76 Q48 66 52 56 Z"
        fill={CAVITY}
        opacity="0.35"
      />

      {/* Upper teeth row */}
      <path
        d="M44 58 L46 66 L52 66 L54 58 L58 58 L60 66 L66 66 L68 58"
        fill={TEETH}
        stroke="#e8e8e0"
        strokeWidth="1"
      />

      {/* Lower teeth row */}
      <path
        d="M44 100 L46 93 L52 93 L54 100 L58 100 L60 93 L66 93 L68 100"
        fill={TEETH}
        stroke="#e8e8e0"
        strokeWidth="1"
      />

      {/* Tongue — front low, back raised to velum */}
      <path
        d="M60 98 Q65 94 72 92 Q80 90 90 88
           Q100 86 112 80 Q125 72 138 64
           Q148 58 155 54 Q158 52 158 56
           Q158 62 156 68 Q154 74 150 78
           Q145 84 138 90 Q130 96 120 102
           Q108 108 95 110 Q80 112 68 108
           Q62 104 60 98"
        fill={TONGUE}
        stroke="#d08888"
        strokeWidth="1.5"
      />

      {/* Tongue-velum contact highlight */}
      <ellipse
        cx="155"
        cy="56"
        rx="6"
        ry="4"
        fill="#d08888"
        opacity={animated ? undefined : "0.6"}
        className={animated ? "velar-contact-glow" : undefined}
      />

      {/* Upper lip — open */}
      <path
        d="M20 68 Q28 62 36 60 Q42 58 46 60
           Q44 64 42 68 Q40 72 36 74 L20 68"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
      />

      {/* Lower lip — open */}
      <path
        d="M20 82 L36 86 Q40 88 42 92
           Q44 96 46 100 Q42 102 36 100
           Q28 96 20 88 Z"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
      />

      {/* Lip opening gap */}
      <path
        d="M20 70 Q30 74 40 76 Q44 77 46 78"
        fill="none"
        stroke={CAVITY}
        strokeWidth="3"
        opacity="0.6"
      />

      {/* Throat / pharynx */}
      <path
        d="M152 90 Q160 100 164 112 Q166 122 164 132
           L160 140 Q158 145 154 148"
        fill="none"
        stroke={THROAT}
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Airflow — blocked at velar closure, builds behind */}
      <g stroke={AIRFLOW} strokeWidth="1.5" opacity="0.5" fill="none">
        <path d="M162 135 Q158 120 155 105 Q152 95 152 85" strokeDasharray="4 3" />
        {/* Blocked indicator */}
        <line x1="150" y1="56" x2="156" y2="62" />
        <line x1="156" y1="56" x2="150" y2="62" />
      </g>
    </svg>
  );
}
