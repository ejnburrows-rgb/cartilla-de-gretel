import React from "react";

interface GretelCheerProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function GretelCheer({ animated = false, ...props }: GretelCheerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gretel cheering with arms raised"
      {...props}
    >
      <defs>
        <filter id="cheer-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
        </filter>
        <linearGradient id="cheer-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B6E4A" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        <linearGradient id="cheer-tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf3e8" />
          <stop offset="100%" stopColor="#f5eadb" />
        </linearGradient>
        {/* Sparkle glow */}
        <filter id="cheer-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === SHOES === */}
      <ellipse cx="82" cy="280" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="118" cy="280" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="82" cy="278" rx="12" ry="6" fill="#8B6640" />
      <ellipse cx="118" cy="278" rx="12" ry="6" fill="#8B6640" />

      {/* === LEGS (slightly apart for dynamic stance) === */}
      <rect x="76" y="248" width="12" height="34" rx="6" fill="#f5d0a9" />
      <rect x="112" y="248" width="12" height="34" rx="6" fill="#f5d0a9" />

      {/* === BODY / TUNIC === */}
      <path
        d="M70 148 Q68 160 66 200 Q65 230 72 252 L128 252 Q135 230 134 200 Q132 160 130 148 Z"
        fill="url(#cheer-tunic)"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1.5"
        filter="url(#cheer-shadow)"
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
      <line x1="100" y1="158" x2="100" y2="245" stroke="var(--art-primary, #c98c4f)" strokeWidth="0.8" opacity="0.4" />

      {/* === LEFT ARM (raised up triumphantly) === */}
      <path
        d="M70 155 Q50 135 38 105 Q32 88 36 82"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="35" cy="80" r="8" fill="#f5d0a9" />

      {/* === RIGHT ARM (raised up triumphantly) === */}
      <path
        d="M130 155 Q150 135 162 105 Q168 88 164 82"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="165" cy="80" r="8" fill="#f5d0a9" />

      {/* === SPARKLE EFFECTS near hands === */}
      {/* Left sparkles */}
      <g filter="url(#cheer-glow)">
        <path d="M22 70 L25 62 L28 70 L25 78 Z" fill="var(--art-primary, #c98c4f)" opacity="0.9">
          {animated && (
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite" />
          )}
        </path>
        <path d="M18 75 L22 72 L26 75 L22 78 Z" fill="var(--art-accent, #d4a76a)" opacity="0.7">
          {animated && (
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.9s" repeatCount="indefinite" />
          )}
        </path>
        <circle cx="30" cy="65" r="2" fill="var(--art-primary, #c98c4f)" opacity="0.8">
          {animated && (
            <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite" />
          )}
        </circle>
      </g>
      {/* Right sparkles */}
      <g filter="url(#cheer-glow)">
        <path d="M172 70 L175 62 L178 70 L175 78 Z" fill="var(--art-primary, #c98c4f)" opacity="0.9">
          {animated && (
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.1s" repeatCount="indefinite" />
          )}
        </path>
        <path d="M174 75 L178 72 L182 75 L178 78 Z" fill="var(--art-accent, #d4a76a)" opacity="0.7">
          {animated && (
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.8s" repeatCount="indefinite" />
          )}
        </path>
        <circle cx="170" cy="65" r="2" fill="var(--art-primary, #c98c4f)" opacity="0.8">
          {animated && (
            <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite" />
          )}
        </circle>
      </g>

      {/* === NECK === */}
      <rect x="92" y="130" width="16" height="20" rx="8" fill="#f5d0a9" />

      {/* === HAIR BACK === */}
      <ellipse cx="100" cy="75" rx="42" ry="40" fill="url(#cheer-hair)" />

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
      {/* Left ribbon bow */}
      <path d="M55 72 Q45 62 50 55 Q55 60 60 68 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M55 72 Q45 82 50 88 Q55 82 60 75 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="56" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />
      {/* Right ribbon bow */}
      <path d="M145 72 Q155 62 150 55 Q145 60 140 68 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M145 72 Q155 82 150 88 Q145 82 140 75 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="144" cy="72" r="3" fill="var(--art-accent, #d4a76a)" />

      {/* === HEAD === */}
      <ellipse cx="100" cy="90" rx="38" ry="42" fill="#f5d0a9" filter="url(#cheer-shadow)" />

      {/* === HAIR BANGS === */}
      <path
        d="M62 72 Q70 50 100 45 Q130 50 138 72 Q130 62 100 58 Q70 62 62 72 Z"
        fill="url(#cheer-hair)"
      />
      <path d="M64 75 Q60 85 63 95" fill="none" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" />
      <path d="M136 75 Q140 85 137 95" fill="none" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" />

      {/* === EYES (squinted with joy) === */}
      <path
        d="M76 86 Q84 79 92 86"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M76 85 L74 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M92 85 L94 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M108 86 Q116 79 124 86"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M108 85 L106 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M124 85 L126 82" stroke="#5c3d2e" strokeWidth="1.5" strokeLinecap="round" />

      {/* === EYEBROWS (raised high) === */}
      <path d="M76 72 Q84 67 92 71" fill="none" stroke="#7A4E2E" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M108 71 Q116 67 124 72" fill="none" stroke="#7A4E2E" strokeWidth="1.8" strokeLinecap="round" />

      {/* === NOSE === */}
      <ellipse cx="100" cy="100" rx="3" ry="2.5" fill="#e8bf94" />

      {/* === FRECKLES === */}
      <circle cx="78" cy="98" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="82" cy="101" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="75" cy="101" r="1.1" fill="#d4a076" opacity="0.55" />
      <circle cx="122" cy="98" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="118" cy="101" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="125" cy="101" r="1.1" fill="#d4a076" opacity="0.55" />

      {/* === ROSY CHEEKS (extra rosy from excitement) === */}
      <ellipse cx="74" cy="100" rx="9" ry="6" fill="#f0b4b4" opacity="0.5" />
      <ellipse cx="126" cy="100" rx="9" ry="6" fill="#f0b4b4" opacity="0.5" />

      {/* === MOUTH - huge open grin === */}
      <path
        d="M84 106 Q100 126 116 106"
        fill="#c45c5c"
        stroke="#b04848"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Teeth hint */}
      <path d="M90 106 L110 106" stroke="white" strokeWidth="2" opacity="0.5" />
      {/* Tongue hint */}
      <ellipse cx="100" cy="116" rx="6" ry="4" fill="#d46b6b" />

      {/* === EARS === */}
      <ellipse cx="62" cy="90" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="62" cy="90" rx="3" ry="4.5" fill="#e8bf94" />
      <ellipse cx="138" cy="90" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="138" cy="90" rx="3" ry="4.5" fill="#e8bf94" />

      {/* === OVERALL BOUNCE ANIMATION === */}
      {animated && (
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="0,0;0,-4;0,0"
          dur="0.8s"
          repeatCount="3"
        />
      )}
    </svg>
  );
}
