import React from "react";

interface GretelThinkingProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function GretelThinking({ animated = false, ...props }: GretelThinkingProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gretel thinking"
      {...props}
    >
      <defs>
        <filter id="think-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
        </filter>
        <linearGradient id="think-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B6E4A" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        <linearGradient id="think-tunic" x1="0" y1="0" x2="0" y2="1">
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
        fill="url(#think-tunic)"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1.5"
        filter="url(#think-shadow)"
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
      <line
        x1="100"
        y1="158"
        x2="100"
        y2="245"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* === RIGHT ARM (at side relaxed) === */}
      <path
        d="M130 155 Q142 185 144 215 Q145 225 142 228"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="142" cy="228" r="8" fill="#f5d0a9" />

      {/* === LEFT ARM (hand on chin - thinking) === */}
      <path
        d="M70 155 Q60 165 62 175 Q65 180 72 170 Q80 150 86 125"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Hand touching chin */}
      <circle cx="86" cy="122" r="7" fill="#f5d0a9" />
      {/* Finger detail on chin */}
      <path d="M84 118 L82 112" stroke="#f5d0a9" strokeWidth="3.5" strokeLinecap="round" />

      {/* === NECK === */}
      <rect x="92" y="130" width="16" height="20" rx="8" fill="#f5d0a9" />

      {/* === HEAD (tilted slightly) === */}
      <g transform="rotate(-5, 100, 90)">
        {/* === HAIR BACK === */}
        <ellipse cx="100" cy="75" rx="42" ry="40" fill="url(#think-hair)" />

        {/* === PIGTAILS === */}
        <path
          d="M60 70 Q40 75 35 95 Q32 110 38 125 Q42 132 50 130 Q55 125 52 110 Q50 95 55 80"
          fill="#8B5E3C"
          stroke="#7A4E2E"
          strokeWidth="1"
        />
        <path
          d="M140 70 Q160 75 165 95 Q168 110 162 125 Q158 132 150 130 Q145 125 148 110 Q150 95 145 80"
          fill="#8B5E3C"
          stroke="#7A4E2E"
          strokeWidth="1"
        />
        {/* Left ribbon */}
        <path d="M55 72 Q45 62 50 55 Q55 60 60 68 Z" fill="var(--art-primary, #c98c4f)" />
        <path d="M55 72 Q45 82 50 88 Q55 82 60 75 Z" fill="var(--art-primary, #c98c4f)" />
        <circle cx="56" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />
        {/* Right ribbon */}
        <path d="M145 72 Q155 62 150 55 Q145 60 140 68 Z" fill="var(--art-primary, #c98c4f)" />
        <path d="M145 72 Q155 82 150 88 Q145 82 140 75 Z" fill="var(--art-primary, #c98c4f)" />
        <circle cx="144" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />

        {/* === FACE === */}
        <ellipse cx="100" cy="90" rx="38" ry="42" fill="#f5d0a9" filter="url(#think-shadow)" />

        {/* === HAIR BANGS === */}
        <path
          d="M62 72 Q70 50 100 45 Q130 50 138 72 Q130 62 100 58 Q70 62 62 72 Z"
          fill="url(#think-hair)"
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

        {/* === EYES (looking upward) === */}
        {/* Left eye */}
        <ellipse cx="84" cy="88" rx="9" ry="10" fill="white" />
        <circle cx="84" cy="84" r="6" fill="#5c3d2e" />
        <circle cx="84" cy="84" r="3" fill="#2d1f17" />
        <circle cx="86" cy="82" r="2" fill="white" opacity="0.9" />
        <path
          d="M75 82 Q80 78 84 79 Q88 78 93 82"
          fill="none"
          stroke="#5c3d2e"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right eye */}
        <ellipse cx="116" cy="88" rx="9" ry="10" fill="white" />
        <circle cx="116" cy="84" r="6" fill="#5c3d2e" />
        <circle cx="116" cy="84" r="3" fill="#2d1f17" />
        <circle cx="118" cy="82" r="2" fill="white" opacity="0.9" />
        <path
          d="M107 82 Q112 78 116 79 Q120 78 125 82"
          fill="none"
          stroke="#5c3d2e"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* === EYEBROWS (one raised thoughtfully) === */}
        <path
          d="M76 74 Q84 72 92 75"
          fill="none"
          stroke="#7A4E2E"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M108 73 Q116 69 124 74"
          fill="none"
          stroke="#7A4E2E"
          strokeWidth="2"
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
        <ellipse cx="74" cy="100" rx="8" ry="5" fill="#f0b4b4" opacity="0.35" />
        <ellipse cx="126" cy="100" rx="8" ry="5" fill="#f0b4b4" opacity="0.35" />

        {/* === MOUTH - slight thoughtful pout === */}
        <path
          d="M94 110 Q100 114 106 110"
          fill="none"
          stroke="#c17c5a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Small lip detail */}
        <ellipse cx="100" cy="112" rx="4" ry="1.5" fill="#d49a7a" opacity="0.3" />

        {/* === EARS === */}
        <ellipse cx="62" cy="90" rx="5" ry="7" fill="#f5d0a9" />
        <ellipse cx="62" cy="90" rx="3" ry="4.5" fill="#e8bf94" />
        <ellipse cx="138" cy="90" rx="5" ry="7" fill="#f5d0a9" />
        <ellipse cx="138" cy="90" rx="3" ry="4.5" fill="#e8bf94" />
      </g>

      {/* === THOUGHT BUBBLES (floating above) === */}
      <g opacity="0.6">
        <circle cx="140" cy="48" r="4" fill="var(--art-accent, #d4a76a)">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.6;0.2;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="150" cy="35" r="6" fill="var(--art-accent, #d4a76a)">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.5;0.15;0.5"
              dur="2.3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="162" cy="20" r="9" fill="var(--art-accent, #d4a76a)">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.4;0.1;0.4"
              dur="2.6s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </g>
    </svg>
  );
}
