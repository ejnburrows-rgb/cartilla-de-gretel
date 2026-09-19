import React from "react";

interface GretelHappyProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function GretelHappy({ animated = false, ...props }: GretelHappyProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gretel happy and waving"
      {...props}
    >
      <defs>
        <filter id="happy-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
        </filter>
        <linearGradient id="happy-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B6E4A" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        <linearGradient id="happy-tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf3e8" />
          <stop offset="100%" stopColor="#f5eadb" />
        </linearGradient>
      </defs>

      {/* === SHOES === */}
      <ellipse cx="82" cy="280" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="118" cy="280" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="82" cy="278" rx="12" ry="6" fill="#8B6640" />
      <ellipse cx="118" cy="278" rx="12" ry="6" fill="#8B6640" />

      {/* === LEGS === */}
      <rect x="78" y="248" width="12" height="34" rx="6" fill="#f5d0a9" />
      <rect x="110" y="248" width="12" height="34" rx="6" fill="#f5d0a9" />

      {/* === BODY / TUNIC === */}
      <path
        d="M70 148 Q68 160 66 200 Q65 230 72 252 L128 252 Q135 230 134 200 Q132 160 130 148 Z"
        fill="url(#happy-tunic)"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1.5"
        filter="url(#happy-shadow)"
      />
      {/* Collar trim */}
      <path
        d="M82 148 Q100 158 118 148"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Hem trim */}
      <path
        d="M72 250 Q100 256 128 250"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center seam */}
      <line
        x1="100"
        y1="158"
        x2="100"
        y2="245"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* === LEFT ARM (at side) === */}
      <path
        d="M70 155 Q58 185 56 215 Q55 225 58 228"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="58" cy="228" r="8" fill="#f5d0a9" />

      {/* === RIGHT ARM (waving up) === */}
      <path
        d="M130 155 Q145 145 155 125 Q162 110 158 105"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Waving hand */}
      <g>
        <circle cx="158" cy="102" r="8" fill="#f5d0a9" />
        {/* Fingers spread for wave */}
        <path d="M154 96 L150 88" stroke="#f5d0a9" strokeWidth="3" strokeLinecap="round" />
        <path d="M158 94 L158 86" stroke="#f5d0a9" strokeWidth="3" strokeLinecap="round" />
        <path d="M162 96 L166 88" stroke="#f5d0a9" strokeWidth="3" strokeLinecap="round" />
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-8 158 102;8 158 102;-8 158 102"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </g>

      {/* === NECK === */}
      <rect x="92" y="130" width="16" height="20" rx="8" fill="#f5d0a9" />

      {/* === HAIR BACK === */}
      <ellipse cx="100" cy="75" rx="42" ry="40" fill="url(#happy-hair)" />

      {/* === PIGTAILS === */}
      {/* Left pigtail */}
      <path
        d="M60 70 Q40 75 35 95 Q32 110 38 125 Q42 132 50 130 Q55 125 52 110 Q50 95 55 80"
        fill="#8B5E3C"
        stroke="#7A4E2E"
        strokeWidth="1"
      />
      {/* Right pigtail */}
      <path
        d="M140 70 Q160 75 165 95 Q168 110 162 125 Q158 132 150 130 Q145 125 148 110 Q150 95 145 80"
        fill="#8B5E3C"
        stroke="#7A4E2E"
        strokeWidth="1"
      />
      {/* Left ribbon bow */}
      <path d="M55 72 Q45 62 50 55 Q55 60 60 68 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M55 72 Q45 82 50 88 Q55 82 60 75 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="56" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />
      {/* Right ribbon bow */}
      <path d="M145 72 Q155 62 150 55 Q145 60 140 68 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M145 72 Q155 82 150 88 Q145 82 140 75 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="144" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />

      {/* === HEAD === */}
      <ellipse cx="100" cy="90" rx="38" ry="42" fill="#f5d0a9" filter="url(#happy-shadow)" />

      {/* === HAIR BANGS === */}
      <path
        d="M62 72 Q70 50 100 45 Q130 50 138 72 Q130 62 100 58 Q70 62 62 72 Z"
        fill="url(#happy-hair)"
      />
      <path
        d="M64 75 Q60 85 63 95"
        fill="none"
        stroke="#8B5E3C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M136 75 Q140 85 137 95"
        fill="none"
        stroke="#8B5E3C"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* === EYES (squinted happy) === */}
      {/* Left eye - happy squint arc */}
      <path
        d="M76 86 Q84 80 92 86"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tiny lash accents on squint */}
      <path d="M76 85 L74 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M92 85 L94 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right eye - happy squint arc */}
      <path
        d="M108 86 Q116 80 124 86"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M108 85 L106 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M124 85 L126 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />

      {/* === EYEBROWS (raised joyfully) === */}
      <path
        d="M76 74 Q84 69 92 73"
        fill="none"
        stroke="#7A4E2E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M108 73 Q116 69 124 74"
        fill="none"
        stroke="#7A4E2E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* === NOSE === */}
      <ellipse cx="100" cy="100" rx="3" ry="2.5" fill="#e8bf94" />

      {/* === FRECKLES === */}
      <circle cx="78" cy="98" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="82" cy="101" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="75" cy="101" r="1.1" fill="#d4a076" opacity="0.55" />
      <circle cx="122" cy="98" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="118" cy="101" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="125" cy="101" r="1.1" fill="#d4a076" opacity="0.55" />

      {/* === ROSY CHEEKS === */}
      <ellipse cx="74" cy="100" rx="8" ry="5" fill="#f0b4b4" opacity="0.45" />
      <ellipse cx="126" cy="100" rx="8" ry="5" fill="#f0b4b4" opacity="0.45" />

      {/* === MOUTH - big happy smile === */}
      <path
        d="M88 108 Q100 122 112 108"
        fill="#c45c5c"
        stroke="#c17c5a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Smile highlight */}
      <path d="M92 108 Q100 114 108 108" fill="white" opacity="0.3" />

      {/* === EARS === */}
      <ellipse cx="62" cy="90" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="62" cy="90" rx="3" ry="4.5" fill="#e8bf94" />
      <ellipse cx="138" cy="90" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="138" cy="90" rx="3" ry="4.5" fill="#e8bf94" />
    </svg>
  );
}
