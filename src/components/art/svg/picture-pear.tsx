import React from "react";

interface PicturePearProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PicturePear({ animated = false, ...props }: PicturePearProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A ripe pear on a branch with green leaves"
      {...props}
    >
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .pp-leaf1 { animation: ppSway 4s ease-in-out infinite; transform-origin: 130px 55px; }
            .pp-leaf2 { animation: ppSway 4.5s ease-in-out 1s infinite; transform-origin: 108px 50px; }
            .pp-pear { animation: ppBob 5s ease-in-out infinite; }
            @keyframes ppSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(5deg); }
            }
            @keyframes ppBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(2px); }
            }
          }
        `}</style>
      )}

      <defs>
        {/* Soft warm background gradient */}
        <linearGradient id="ppBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f5e9" />
          <stop offset="50%" stopColor="#f1f8e9" />
          <stop offset="100%" stopColor="#fff8e1" />
        </linearGradient>
        {/* Pear body gradient */}
        <radialGradient id="ppPearGrad" cx="0.45" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#e6e87a" />
          <stop offset="50%" stopColor="#c8cc42" />
          <stop offset="100%" stopColor="#a8b030" />
        </radialGradient>
        {/* Pear blush */}
        <radialGradient id="ppBlush" cx="0.7" cy="0.6" r="0.4">
          <stop offset="0%" stopColor="#e8a040" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8a040" stopOpacity="0" />
        </radialGradient>
        {/* Leaf gradient */}
        <linearGradient id="ppLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#43a047" />
        </linearGradient>
      </defs>

      {/* Warm soft background */}
      <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#ppBgGrad)" />

      {/* Soft sunlight circle in background */}
      <circle cx="180" cy="35" r="50" fill="#fff9c4" opacity="0.4" />

      {/* Background bokeh dots */}
      <circle cx="30" cy="40" r="8" fill="#c8e6c9" opacity="0.4" />
      <circle cx="60" cy="25" r="5" fill="#dcedc8" opacity="0.35" />
      <circle cx="200" cy="65" r="6" fill="#fff9c4" opacity="0.3" />
      <circle cx="220" cy="30" r="4" fill="#dcedc8" opacity="0.4" />
      <circle cx="15" cy="170" r="7" fill="#c8e6c9" opacity="0.3" />
      <circle cx="225" cy="160" r="5" fill="#dcedc8" opacity="0.3" />

      {/* Branch */}
      <path
        d="M50 45 Q80 42 115 55 Q130 60 160 50 Q190 40 220 45"
        fill="none"
        stroke="#8d6e63"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Branch texture */}
      <path
        d="M70 44 Q80 40 90 44"
        fill="none"
        stroke="#6d4c41"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M150 52 Q160 48 170 50"
        fill="none"
        stroke="#6d4c41"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Leaf 1 - right of pear */}
      <g className={animated ? "pp-leaf1" : undefined}>
        <path
          d="M130 55 Q145 35 160 48 Q145 55 130 55 Z"
          fill="url(#ppLeafGrad)"
          stroke="#388e3c"
          strokeWidth="1"
        />
        {/* Leaf vein */}
        <path d="M132 53 Q145 42 158 48" fill="none" stroke="#2e7d32" strokeWidth="0.8" opacity="0.5" />
        <path d="M140 48 Q142 44 146 42" fill="none" stroke="#2e7d32" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Leaf 2 - left of pear */}
      <g className={animated ? "pp-leaf2" : undefined}>
        <path
          d="M108 50 Q95 32 82 42 Q95 52 108 50 Z"
          fill="url(#ppLeafGrad)"
          stroke="#388e3c"
          strokeWidth="1"
        />
        <path d="M106 49 Q95 38 84 42" fill="none" stroke="#2e7d32" strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* Pear stem */}
      <path
        d="M120 60 Q118 68 120 75"
        fill="none"
        stroke="#6d4c41"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Pear body - classic pear shape */}
      <g className={animated ? "pp-pear" : undefined}>
        <path
          d="M120 75
           Q110 80 106 90
           Q100 105 98 120
           Q95 140 105 155
           Q115 168 120 170
           Q125 168 135 155
           Q145 140 142 120
           Q140 105 134 90
           Q130 80 120 75 Z"
          fill="url(#ppPearGrad)"
          stroke="#8a9a25"
          strokeWidth="1.5"
        />

        {/* Pear blush overlay */}
        <path
          d="M120 75
           Q110 80 106 90
           Q100 105 98 120
           Q95 140 105 155
           Q115 168 120 170
           Q125 168 135 155
           Q145 140 142 120
           Q140 105 134 90
           Q130 80 120 75 Z"
          fill="url(#ppBlush)"
        />

        {/* Pear highlight / shine */}
        <ellipse cx="112" cy="100" rx="6" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-15 112 100)" />

        {/* Pear bottom dimple */}
        <path d="M116 168 Q120 172 124 168" fill="none" stroke="#8a9a25" strokeWidth="1" opacity="0.5" />

        {/* Subtle speckle details */}
        <circle cx="115" cy="130" r="0.8" fill="#8a9a25" opacity="0.3" />
        <circle cx="125" cy="140" r="0.6" fill="#8a9a25" opacity="0.25" />
        <circle cx="110" cy="145" r="0.7" fill="#8a9a25" opacity="0.3" />
        <circle cx="130" cy="125" r="0.5" fill="#8a9a25" opacity="0.2" />
        <circle cx="118" cy="155" r="0.6" fill="#8a9a25" opacity="0.25" />
      </g>

      {/* Small decorative butterfly - charming detail */}
      <g opacity="0.6">
        <ellipse cx="185" cy="100" rx="5" ry="3.5" fill="#e1bee7" transform="rotate(-20 185 100)" />
        <ellipse cx="192" cy="98" rx="4" ry="3" fill="#ce93d8" transform="rotate(15 192 98)" />
        <circle cx="188" cy="100" r="1" fill="#6a1b9a" />
        <path d="M188 100 Q190 105 189 110" fill="none" stroke="#6a1b9a" strokeWidth="0.5" />
      </g>

      {/* Ground suggestion */}
      <path d="M0 190 Q60 182 120 188 Q180 182 240 190 L240 200 L0 200 Z" fill="#a5d6a7" opacity="0.3" rx="8" />
    </svg>
  );
}
