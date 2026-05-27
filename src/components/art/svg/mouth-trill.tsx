import React from "react";

interface MouthTrillProps {
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

export function MouthTrill({
  size,
  className,
  animated = false,
}: MouthTrillProps) {
  const sizeProps: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;

  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mouth diagram: trill position for rr sound"
      className={className}
      style={sizeProps}
    >
      {animated && (
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .trill-vibrate {
                animation: trillVibrate 0.3s ease-in-out infinite alternate;
              }
              @keyframes trillVibrate {
                0% { transform: translateY(0px); }
                100% { transform: translateY(2px); }
              }
              .trill-wave {
                animation: trillWave 0.6s ease-in-out infinite alternate;
              }
              @keyframes trillWave {
                0% { opacity: 0.3; }
                100% { opacity: 0.8; }
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

      {/* Alveolar ridge — emphasized */}
      <path
        d="M56 48 Q52 50 50 54 Q48 58 50 60"
        fill="none"
        stroke={PALATE}
        strokeWidth="3"
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

      {/* Tongue body — main position */}
      <g className={animated ? "trill-vibrate" : undefined}>
        <path
          d="M55 58 Q54 60 56 64
             Q60 72 75 80 Q90 86 110 88
             Q130 90 145 92 Q155 94 158 98
             Q155 104 142 108 Q125 112 105 110
             Q85 108 70 104 Q58 100 55 94
             Q52 88 52 80 Q52 70 55 62"
          fill={TONGUE}
          stroke="#d08888"
          strokeWidth="1.5"
        />
      </g>

      {/* Ghost tongue position 1 — slightly lower (vibration position) */}
      <path
        d="M55 62 Q56 66 60 72 Q65 78 78 84"
        fill="none"
        stroke={TONGUE}
        strokeWidth="2"
        opacity="0.35"
        strokeDasharray="3 3"
      />

      {/* Ghost tongue position 2 — slightly higher (vibration position) */}
      <path
        d="M54 54 Q53 56 54 58 Q56 64 68 72"
        fill="none"
        stroke={TONGUE}
        strokeWidth="2"
        opacity="0.35"
        strokeDasharray="3 3"
      />

      {/* Vibration wavy lines at tongue tip / alveolar ridge contact */}
      <g
        stroke="#d08888"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        className={animated ? "trill-wave" : undefined}
      >
        <path d="M48 56 Q50 53 52 56 Q54 59 56 56" />
        <path d="M46 60 Q48 57 50 60 Q52 63 54 60" />
        <path d="M50 52 Q52 49 54 52 Q56 55 58 52" />
      </g>

      {/* Vibration motion arrows (rapid up/down) */}
      <g stroke="#d08888" strokeWidth="1" fill="none" opacity="0.5">
        {/* Up arrow */}
        <path d="M60 55 L58 50" />
        <path d="M56 50 L58 50 L60 50" />
        {/* Down arrow */}
        <path d="M62 55 L64 60" />
        <path d="M62 60 L64 60 L66 60" />
      </g>

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

      {/* Airflow arrows — pulsing through trill */}
      <g
        stroke={AIRFLOW}
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        className={animated ? "trill-wave" : undefined}
      >
        <path
          d="M160 130 Q155 115 150 100 Q140 92 120 88
             Q100 84 80 78 Q65 70 55 62"
          strokeDasharray="4 3"
        />
        {/* Arrow at exit */}
        <path d="M32 72 L26 70 L30 66" />
      </g>
    </svg>
  );
}
