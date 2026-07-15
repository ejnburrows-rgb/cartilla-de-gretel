import React from "react";

interface MouthBilabialProps {
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

export function MouthBilabial({ size, className, animated = false }: MouthBilabialProps) {
  const sizeProps: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;

  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mouth diagram: bilabial position for m, p, b sounds"
      className={className}
      style={sizeProps}
    >
      {/* Defs for animations */}
      {animated && (
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .bilabial-pulse {
                animation: bilabialPulse 1.2s ease-in-out infinite;
              }
              @keyframes bilabialPulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
              }
            }
          `}</style>
        </defs>
      )}

      {/* Face profile outline — nose, upper face, chin, throat */}
      <path
        d="M30 10 Q28 20 25 30 Q22 35 20 40 L18 45 Q16 48 18 50
           L22 52 Q24 54 24 58 L24 62 Q24 66 22 68
           L20 72 Q16 78 18 85 Q20 90 24 95
           L30 105 Q38 115 45 120 L55 128
           Q65 135 75 138 Q90 142 105 140
           L120 136 Q135 130 145 120
           L155 108 Q162 98 165 88 L168 75
           Q170 60 168 50 L165 40
           Q162 30 158 22 Q154 15 148 10"
        fill="none"
        stroke={SKIN}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nasal cavity area */}
      <path
        d="M30 20 Q40 18 55 22 Q65 25 70 32 L68 42 Q60 38 50 38 Q40 36 32 38 L30 20"
        fill={CAVITY}
        stroke={SKIN}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Hard palate */}
      <path
        d="M55 48 Q75 38 100 36 Q120 35 140 40 Q148 43 150 48"
        fill="none"
        stroke={PALATE}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Soft palate (velum) */}
      <path
        d="M150 48 Q156 52 158 60 Q160 68 156 74 Q154 78 150 80"
        fill={PALATE}
        stroke={PALATE}
        strokeWidth="2"
        fillOpacity="0.6"
      />

      {/* Uvula */}
      <path
        d="M150 80 Q148 86 150 90 Q152 86 150 80"
        fill={PALATE}
        stroke={PALATE}
        strokeWidth="1.5"
      />

      {/* Oral cavity — interior space */}
      <path
        d="M55 52 Q80 46 110 44 Q135 43 150 48
           L158 60 Q160 68 156 74 L150 80
           Q140 82 120 80 Q100 78 80 80 Q65 82 55 85
           Q50 80 48 72 Q46 64 50 56 Z"
        fill={CAVITY}
        opacity="0.4"
      />

      {/* Upper teeth row */}
      <path
        d="M48 55 L50 62 L56 62 L58 55 L62 55 L64 62 L70 62 L72 55"
        fill={TEETH}
        stroke="#e8e8e0"
        strokeWidth="1"
      />

      {/* Lower teeth row */}
      <path
        d="M48 96 L50 89 L56 89 L58 96 L62 96 L64 89 L70 89 L72 96"
        fill={TEETH}
        stroke="#e8e8e0"
        strokeWidth="1"
      />

      {/* Tongue — resting position on floor of mouth */}
      <path
        d="M60 100 Q65 85 80 82 Q100 78 125 80
           Q140 82 150 88 Q155 92 155 98
           Q145 102 130 104 Q110 106 90 105 Q75 104 60 100"
        fill={TONGUE}
        stroke="#d08888"
        strokeWidth="1.5"
      />

      {/* Upper lip — pressed closed */}
      <path
        d="M20 72 Q28 65 38 62 Q45 60 48 62
           Q46 68 44 72 Q42 76 38 78 L20 72"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
        className={animated ? "bilabial-pulse" : undefined}
      />

      {/* Lower lip — pressed against upper lip */}
      <path
        d="M20 72 L38 78 Q42 80 44 84
           Q46 88 48 92 Q45 94 38 92
           Q28 88 20 78 Z"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
        className={animated ? "bilabial-pulse" : undefined}
      />

      {/* Lip closure emphasis line */}
      <path
        d="M18 74 Q30 72 42 76 Q46 78 48 78"
        fill="none"
        stroke="#c05858"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Throat / pharynx area */}
      <path
        d="M150 90 Q158 100 162 112 Q164 122 162 132
           L158 140 Q155 145 150 148"
        fill="none"
        stroke={THROAT}
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Airflow blocked indicator — small X marks at lip closure */}
      <g stroke={AIRFLOW} strokeWidth="1.5" opacity="0.7">
        <line x1="10" y1="70" x2="16" y2="76" />
        <line x1="16" y1="70" x2="10" y2="76" />
        <line x1="4" y1="73" x2="10" y2="73" strokeDasharray="2 2" />
      </g>

      {/* Airflow arrow from lungs to closed lips (blocked) */}
      <path
        d="M160 135 Q155 120 150 105 Q140 95 120 90
           Q100 88 80 88 Q60 88 48 82"
        fill="none"
        stroke={AIRFLOW}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.5"
      />
    </svg>
  );
}
