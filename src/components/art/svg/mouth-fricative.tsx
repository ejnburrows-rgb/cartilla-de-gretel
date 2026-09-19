import React from "react";

interface MouthFricativeProps {
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

export function MouthFricative({ size, className, animated = false }: MouthFricativeProps) {
  const sizeProps: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;

  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mouth diagram: fricative position for f, v sounds"
      className={className}
      style={sizeProps}
    >
      {animated && (
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .fricative-flow {
                animation: fricativeFlow 2s linear infinite;
              }
              @keyframes fricativeFlow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -28; }
              }
              .fricative-turbulence {
                animation: fricativeTurb 0.8s ease-in-out infinite alternate;
              }
              @keyframes fricativeTurb {
                0% { opacity: 0.4; }
                100% { opacity: 0.9; }
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

      {/* Soft palate (velum) */}
      <path
        d="M152 48 Q158 52 160 60 Q162 68 158 74 Q156 78 152 80"
        fill={PALATE}
        stroke={PALATE}
        strokeWidth="2"
        fillOpacity="0.6"
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
           Q142 82 122 80 Q102 78 82 80 Q65 82 58 85
           Q52 80 50 72 Q48 64 52 56 Z"
        fill={CAVITY}
        opacity="0.4"
      />

      {/* Upper teeth row — slightly forward / visible */}
      <path
        d="M42 56 L44 64 L50 64 L52 56 L56 56 L58 64 L64 64 L66 56"
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

      {/* Tongue — relaxed, slightly raised in middle */}
      <path
        d="M62 100 Q68 88 80 84 Q95 78 115 78
           Q132 80 145 84 Q155 88 158 96
           Q150 102 135 106 Q115 110 95 108
           Q78 106 68 102 Q62 100 62 100"
        fill={TONGUE}
        stroke="#d08888"
        strokeWidth="1.5"
      />

      {/* Upper lip — slightly open, forward */}
      <path
        d="M20 66 Q28 60 36 58 Q42 56 44 58
           Q42 62 40 66 Q38 70 34 72 L20 66"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
      />

      {/* Lower lip — raised to contact upper teeth (f/v position) */}
      <path
        d="M20 76 L34 74 Q40 72 44 68
           Q46 66 46 64"
        fill="none"
        stroke={LIPS}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 76 L34 80 Q40 84 44 88
           Q46 92 46 96 Q42 98 36 96
           Q28 92 20 82 Z"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
      />

      {/* Lip-teeth constriction point */}
      <circle cx="44" cy="65" r="3" fill="#c05858" opacity="0.4" />

      {/* Throat / pharynx */}
      <path
        d="M152 90 Q160 100 164 112 Q166 122 164 132
           L160 140 Q158 145 154 148"
        fill="none"
        stroke={THROAT}
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Turbulent airflow — dashed arrows through constriction */}
      <g
        stroke={AIRFLOW}
        strokeWidth="1.5"
        fill="none"
        className={animated ? "fricative-flow" : undefined}
      >
        {/* Main airflow path from throat through mouth out through constriction */}
        <path
          d="M160 130 Q155 115 150 100 Q140 90 120 85
             Q100 82 80 80 Q65 74 52 68 Q46 65 38 64"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        {/* Second turbulent stream */}
        <path d="M55 70 Q48 66 42 64 Q36 62 28 60" strokeDasharray="3 2" opacity="0.6" />
      </g>

      {/* Turbulence swirls at constriction exit */}
      <g
        stroke={AIRFLOW}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
        className={animated ? "fricative-turbulence" : undefined}
      >
        <path d="M30 58 Q26 56 24 58 Q22 60 24 62" />
        <path d="M22 54 Q18 52 16 54 Q14 56 16 58" />
        <path d="M26 64 Q22 62 20 64 Q18 66 20 68" />
        {/* Arrow tips */}
        <path d="M16 58 L12 56 L14 60" />
        <path d="M10 54 L6 52 L8 56" />
      </g>
    </svg>
  );
}
