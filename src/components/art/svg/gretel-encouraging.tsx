import React from "react";

interface GretelEncouragingProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function GretelEncouraging({ animated = false, ...props }: GretelEncouragingProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gretel leaning forward encouragingly"
      {...props}
    >
      <defs>
        {/* Soft shadow filter */}
        <filter id="encouraging-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000020" />
        </filter>
        {/* Hair gradient */}
        <linearGradient id="encouraging-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B6E4A" />
          <stop offset="100%" stopColor="#8B5E3C" />
        </linearGradient>
        {/* Tunic gradient */}
        <linearGradient id="encouraging-tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf3e8" />
          <stop offset="100%" stopColor="#f5eadb" />
        </linearGradient>
      </defs>

      {/* === SHOES === */}
      <ellipse cx="80" cy="282" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="120" cy="282" rx="14" ry="8" fill="#7a5230" />
      <ellipse cx="80" cy="280" rx="12" ry="6" fill="#8B6640" />
      <ellipse cx="120" cy="280" rx="12" ry="6" fill="#8B6640" />

      {/* === LEGS === */}
      <rect x="76" y="250" width="12" height="34" rx="6" fill="#f5d0a9" />
      <rect x="112" y="250" width="12" height="34" rx="6" fill="#f5d0a9" />

      {/* === BODY / TUNIC (leaning forward slightly) === */}
      <path
        d="M68 152 Q66 164 64 204 Q63 234 70 256 L130 256 Q137 234 136 204 Q134 164 132 152 Z"
        fill="url(#encouraging-tunic)"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1.5"
        filter="url(#encouraging-shadow)"
      />
      {/* Collar trim */}
      <path
        d="M80 152 Q100 162 120 152"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Hem trim */}
      <path
        d="M70 254 Q100 260 130 254"
        fill="none"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center seam detail */}
      <line
        x1="100"
        y1="162"
        x2="100"
        y2="249"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* === ARMS (extended forward in encouragement) === */}
      {/* Left arm */}
      <path
        d="M70 165 Q45 180 42 200"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Left hand */}
      <circle cx="42" cy="200" r="8" fill="#f5d0a9" />

      {/* Right arm */}
      <path
        d="M130 165 Q155 180 158 200"
        fill="none"
        stroke="#f5d0a9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Right hand */}
      <circle cx="158" cy="200" r="8" fill="#f5d0a9" />

      {/* === NECK === */}
      <rect x="92" y="132" width="16" height="22" rx="8" fill="#f5d0a9" />

      {/* === HAIR BACK (behind head) === */}
      <ellipse cx="100" cy="77" rx="42" ry="40" fill="url(#encouraging-hair)" />

      {/* === PIGTAILS === */}
      {/* Left pigtail */}
      <path
        d="M60 72 Q40 77 35 97 Q32 112 38 127 Q42 134 50 132 Q55 127 52 112 Q50 97 55 82"
        fill="#8B5E3C"
        stroke="#7A4E2E"
        strokeWidth="1"
      />
      {/* Right pigtail */}
      <path
        d="M140 72 Q160 77 165 97 Q168 112 162 127 Q158 134 150 132 Q145 127 148 112 Q150 97 145 82"
        fill="#8B5E3C"
        stroke="#7A4E2E"
        strokeWidth="1"
      />
      {/* Left ribbon bow */}
      <path d="M55 74 Q45 64 50 57 Q55 62 60 70 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M55 74 Q45 84 50 90 Q55 84 60 77 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="56" cy="74" r="3" fill="var(--art-accent, #d4a76a)" />
      {/* Right ribbon bow */}
      <path d="M145 74 Q155 64 150 57 Q145 62 140 70 Z" fill="var(--art-primary, #c98c4f)" />
      <path d="M145 74 Q155 84 150 90 Q145 84 140 77 Z" fill="var(--art-primary, #c98c4f)" />
      <circle cx="144" cy="74" r="3" fill="var(--art-accent, #d4a76a)" />

      {/* === HEAD (slightly forward, Y at 92 instead of 90) === */}
      <ellipse cx="100" cy="92" rx="38" ry="42" fill="#f5d0a9" filter="url(#encouraging-shadow)" />

      {/* === HAIR BANGS === */}
      <path
        d="M62 74 Q70 52 100 47 Q130 52 138 74 Q130 64 100 60 Q70 64 62 74 Z"
        fill="url(#encouraging-hair)"
      />
      {/* Side hair wisps */}
      <path
        d="M64 77 Q60 87 63 97"
        fill="none"
        stroke="#8B5E3C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M136 77 Q140 87 137 97"
        fill="none"
        stroke="#8B5E3C"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* === EYES (Warm squint / smile) === */}
      {/* Left eye */}
      <path
        d="M76 90 Q84 82 92 90"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Right eye */}
      <path
        d="M108 90 Q116 82 124 90"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* === EYEBROWS (raised happily) === */}
      <path
        d="M76 78 Q84 72 92 76"
        fill="none"
        stroke="#7A4E2E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M108 76 Q116 72 124 78"
        fill="none"
        stroke="#7A4E2E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* === NOSE === */}
      <ellipse cx="100" cy="101" rx="3" ry="2.5" fill="#e8bf94" />

      {/* === FRECKLES === */}
      <circle cx="78" cy="99" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="82" cy="102" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="75" cy="102" r="1.1" fill="#d4a076" opacity="0.55" />
      <circle cx="122" cy="99" r="1.2" fill="#d4a076" opacity="0.6" />
      <circle cx="118" cy="102" r="1" fill="#d4a076" opacity="0.5" />
      <circle cx="125" cy="102" r="1.1" fill="#d4a076" opacity="0.55" />

      {/* === ROSY CHEEKS === */}
      <ellipse cx="74" cy="101" rx="8" ry="5" fill="#f0b4b4" opacity="0.35" />
      <ellipse cx="126" cy="101" rx="8" ry="5" fill="#f0b4b4" opacity="0.35" />

      {/* === MOUTH - open encouraging smile === */}
      <path
        d="M88 108 Q100 120 112 108 Q100 126 88 108"
        fill="#e07070"
        stroke="#c17c5a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Tongue detail */}
      <path d="M92 115 Q100 112 108 115 Q100 124 92 115" fill="#e8a0a0" />

      {/* === EARS === */}
      <ellipse cx="62" cy="92" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="62" cy="92" rx="3" ry="4.5" fill="#e8bf94" />
      <ellipse cx="138" cy="92" rx="5" ry="7" fill="#f5d0a9" />
      <ellipse cx="138" cy="92" rx="3" ry="4.5" fill="#e8bf94" />

      {/* === ANIMATION === */}
      {animated && (
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="0,0;0,-1.5;0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      )}
    </svg>
  );
}
