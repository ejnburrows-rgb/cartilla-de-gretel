import React from "react";

interface PicturePineappleProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PicturePineapple({ animated = false, ...props }: PicturePineappleProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A tropical pineapple with a crown of green leaves"
      {...props}
    >
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .pi-leaf1 { animation: piSway 3s ease-in-out infinite; transform-origin: 120px 55px; }
            .pi-leaf2 { animation: piSway 3.5s ease-in-out 0.5s infinite; transform-origin: 120px 55px; }
            .pi-sparkle { animation: piSparkle 2s ease-in-out infinite; }
            @keyframes piSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(3deg); }
            }
            @keyframes piSparkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.8; }
            }
          }
        `}</style>
      )}

      <defs>
        {/* Tropical sky gradient */}
        <linearGradient id="piBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f7fa" />
          <stop offset="50%" stopColor="#b2ebf2" />
          <stop offset="100%" stopColor="#fff8e1" />
        </linearGradient>
        {/* Pineapple body gradient */}
        <linearGradient id="piBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffca28" />
          <stop offset="50%" stopColor="#f9a825" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
        {/* Crown leaf gradient */}
        <linearGradient id="piLeafGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#558b2f" />
          <stop offset="100%" stopColor="#7cb342" />
        </linearGradient>
      </defs>

      {/* Tropical background */}
      <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#piBgGrad)" />

      {/* Background tropical sun hint */}
      <circle cx="200" cy="30" r="35" fill="#fff9c4" opacity="0.5" />

      {/* Distant palm frond - left background */}
      <path
        d="M0 80 Q10 60 25 70 Q15 55 30 50 Q20 45 32 35"
        fill="none"
        stroke="#a5d6a7"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Distant palm frond - right background */}
      <path
        d="M240 70 Q228 55 215 65 Q225 48 210 42"
        fill="none"
        stroke="#a5d6a7"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Pineapple shadow */}
      <ellipse cx="120" cy="185" rx="35" ry="6" fill="#bdbdbd" opacity="0.2" />

      {/* Pineapple body - oval shape */}
      <ellipse
        cx="120"
        cy="132"
        rx="34"
        ry="50"
        fill="url(#piBodyGrad)"
        stroke="#e65100"
        strokeWidth="1.5"
      />

      {/* Diamond crosshatch texture pattern */}
      {/* Diagonal lines going right */}
      <line x1="95" y1="95" x2="130" y2="170" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="107" y1="88" x2="140" y2="165" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="120" y1="85" x2="148" y2="155" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="133" y1="88" x2="152" y2="140" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="88" y1="105" x2="115" y2="175" stroke="#e08800" strokeWidth="1" opacity="0.5" />

      {/* Diagonal lines going left */}
      <line x1="145" y1="95" x2="110" y2="170" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="133" y1="88" x2="100" y2="165" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="120" y1="85" x2="92" y2="155" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="107" y1="88" x2="88" y2="140" stroke="#e08800" strokeWidth="1" opacity="0.5" />
      <line x1="152" y1="105" x2="125" y2="175" stroke="#e08800" strokeWidth="1" opacity="0.5" />

      {/* Small bumps at diamond intersections */}
      <circle cx="108" cy="105" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="120" cy="100" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="132" cy="105" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="102" cy="120" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="114" cy="115" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="126" cy="115" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="138" cy="120" r="1.5" fill="#ffcc00" opacity="0.6" />
      <circle cx="108" cy="135" r="1.5" fill="#ffcc00" opacity="0.5" />
      <circle cx="120" cy="130" r="1.5" fill="#ffcc00" opacity="0.5" />
      <circle cx="132" cy="135" r="1.5" fill="#ffcc00" opacity="0.5" />
      <circle cx="114" cy="150" r="1.5" fill="#e8a000" opacity="0.4" />
      <circle cx="126" cy="150" r="1.5" fill="#e8a000" opacity="0.4" />

      {/* Body highlight */}
      <ellipse
        cx="108"
        cy="118"
        rx="10"
        ry="22"
        fill="#ffffff"
        opacity="0.15"
        transform="rotate(-10 108 118)"
      />

      {/* Crown of leaves - back layer */}
      <g className={animated ? "pi-leaf2" : undefined}>
        <path
          d="M120 85 Q95 40 80 15"
          fill="none"
          stroke="url(#piLeafGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M120 85 Q145 40 160 15"
          fill="none"
          stroke="url(#piLeafGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M120 85 Q85 50 65 35"
          fill="none"
          stroke="#558b2f"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M120 85 Q155 50 175 35"
          fill="none"
          stroke="#558b2f"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* Crown of leaves - front layer */}
      <g className={animated ? "pi-leaf1" : undefined}>
        <path
          d="M120 85 Q110 55 100 25"
          fill="none"
          stroke="#7cb342"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M120 85 Q130 55 140 25"
          fill="none"
          stroke="#7cb342"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M120 85 Q118 50 120 20"
          fill="none"
          stroke="#8bc34a"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Small inner leaves */}
        <path
          d="M120 85 Q105 60 95 45"
          fill="none"
          stroke="#689f38"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M120 85 Q135 60 145 45"
          fill="none"
          stroke="#689f38"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* Tropical sparkle details */}
      <g className={animated ? "pi-sparkle" : undefined}>
        <circle cx="48" cy="45" r="2" fill="#fff9c4" opacity="0.5" />
        <circle cx="195" cy="80" r="1.5" fill="#fff9c4" opacity="0.4" />
        <circle cx="175" cy="165" r="1.5" fill="#fff9c4" opacity="0.3" />
      </g>

      {/* Ground / table surface */}
      <path
        d="M0 185 Q60 180 120 183 Q180 180 240 185 L240 200 L0 200 Z"
        fill="#ffe0b2"
        opacity="0.5"
      />
      <line x1="0" y1="185" x2="240" y2="185" stroke="#d7ccc8" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
