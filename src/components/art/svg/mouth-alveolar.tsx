import React from "react";

interface MouthAlveolarProps {
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

export function MouthAlveolar({ size, className, animated = false }: MouthAlveolarProps) {
  const sizeProps: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;

  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mouth diagram: alveolar position for t, d, n, s, l sounds"
      className={className}
      style={sizeProps}
    >
      {animated && (
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .alveolar-tongue-glow {
                animation: alveolarGlow 1.5s ease-in-out infinite;
              }
              @keyframes alveolarGlow {
                0%, 100% { opacity: 0.6; }
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

      {/* Alveolar ridge — emphasized bump behind teeth */}
      <path
        d="M56 48 Q52 50 50 54 Q48 58 50 60"
        fill="none"
        stroke={PALATE}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Alveolar ridge highlight */}
      <circle
        cx="53"
        cy="54"
        r="4"
        fill={PALATE}
        opacity={animated ? undefined : "0.5"}
        className={animated ? "alveolar-tongue-glow" : undefined}
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
           Q142 82 122 80 Q102 78 82 80 Q68 82 58 85
           Q52 80 50 72 Q48 64 52 56 Z"
        fill={CAVITY}
        opacity="0.4"
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

      {/* Tongue — tip raised to alveolar ridge */}
      <path
        d="M55 56 Q54 58 55 60
           Q58 68 70 75 Q85 82 105 84
           Q125 86 142 88 Q152 90 158 96
           Q155 102 142 106 Q125 110 105 108
           Q85 106 70 102 Q58 98 55 92
           Q52 86 52 78 Q52 68 55 60"
        fill={TONGUE}
        stroke="#d08888"
        strokeWidth="1.5"
      />

      {/* Tongue-to-ridge contact indicator */}
      <circle
        cx="54"
        cy="57"
        r="3"
        fill="#d08888"
        opacity={animated ? undefined : "0.7"}
        className={animated ? "alveolar-tongue-glow" : undefined}
      />

      {/* Upper lip — slightly open */}
      <path
        d="M20 68 Q28 62 36 60 Q42 58 46 60
           Q44 64 42 68 Q40 72 36 74 L20 68"
        fill={LIPS}
        stroke="#c05858"
        strokeWidth="1.5"
      />

      {/* Lower lip — slightly open */}
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

      {/* Airflow arrows — through the small gap between tongue and alveolar ridge */}
      <g stroke={AIRFLOW} strokeWidth="1.5" opacity="0.6" fill="none">
        <path
          d="M160 130 Q155 115 148 100 Q138 90 120 85
             Q100 82 80 78 Q65 72 56 62"
          strokeDasharray="4 3"
        />
        {/* Arrow tip at exit */}
        <path d="M32 72 L26 70 L30 66" />
      </g>
    </svg>
  );
}
