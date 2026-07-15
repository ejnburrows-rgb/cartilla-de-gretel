import React from "react";

interface PictureSunProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureSun({ animated = false, ...props }: PictureSunProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A bright cheerful sun with wavy rays in a blue sky"
      {...props}
    >
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .ps-rays { animation: psRotate 20s linear infinite; transform-origin: 120px 78px; }
            .ps-cloud1 { animation: psDrift 14s ease-in-out infinite; }
            .ps-cloud2 { animation: psDrift 18s ease-in-out 4s infinite; }
            .ps-rainbow { animation: psFadeIn 3s ease-in-out; }
            @keyframes psRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes psDrift {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(10px); }
            }
            @keyframes psFadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          }
        `}</style>
      )}

      <defs>
        {/* Sky gradient */}
        <linearGradient id="psSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="60%" stopColor="#b8e4f0" />
          <stop offset="100%" stopColor="#d4f0fb" />
        </linearGradient>
        {/* Sun gradient */}
        <radialGradient id="psSunGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="70%" stopColor="#ffcc33" />
          <stop offset="100%" stopColor="#f5a623" />
        </radialGradient>
        {/* Sun glow */}
        <radialGradient id="psSunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe566" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffe566" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#psSkyGrad)" />

      {/* Sun glow aura */}
      <circle cx="120" cy="78" r="60" fill="url(#psSunGlow)" />

      {/* Wavy sun rays */}
      <g className={animated ? "ps-rays" : undefined} opacity="0.7">
        {/* 8 wavy rays around the sun */}
        <path
          d="M120 28 Q124 18 120 8"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M155 43 Q165 35 172 28"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M170 78 Q180 78 190 78"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M155 113 Q165 121 172 128"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M120 128 Q124 138 120 148"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85 113 Q75 121 68 128"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M70 78 Q60 78 50 78"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85 43 Q75 35 68 28"
          fill="none"
          stroke="#ffcc33"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Secondary shorter rays between main rays */}
        <path
          d="M138 34 Q144 26 148 18"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M164 58 Q174 52 182 48"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M164 98 Q174 104 182 108"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M138 122 Q144 130 148 138"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M102 122 Q96 130 92 138"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M76 98 Q66 104 58 108"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M76 58 Q66 52 58 48"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M102 34 Q96 26 92 18"
          fill="none"
          stroke="#ffd966"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Sun body */}
      <circle cx="120" cy="78" r="32" fill="url(#psSunGrad)" />
      <circle cx="120" cy="78" r="32" fill="none" stroke="#f0a020" strokeWidth="2" />

      {/* Sun happy face */}
      {/* Eyes - open and cheerful */}
      <circle cx="110" cy="73" r="4" fill="#ffffff" />
      <circle cx="110" cy="73" r="2.5" fill="#5c3d2e" />
      <circle cx="111" cy="72" r="1" fill="#ffffff" />
      <circle cx="130" cy="73" r="4" fill="#ffffff" />
      <circle cx="130" cy="73" r="2.5" fill="#5c3d2e" />
      <circle cx="131" cy="72" r="1" fill="#ffffff" />

      {/* Rosy cheeks */}
      <circle cx="104" cy="82" r="4" fill="#f0a060" opacity="0.5" />
      <circle cx="136" cy="82" r="4" fill="#f0a060" opacity="0.5" />

      {/* Wide happy smile */}
      <path
        d="M110 85 Q120 96 130 85"
        fill="#f08030"
        stroke="#d06020"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Rainbow arc at bottom */}
      <g className={animated ? "ps-rainbow" : undefined}>
        <path
          d="M40 185 Q120 120 200 185"
          fill="none"
          stroke="#ff8a8a"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M45 185 Q120 125 195 185"
          fill="none"
          stroke="#ffc97a"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M50 185 Q120 130 190 185"
          fill="none"
          stroke="#fff08a"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M55 185 Q120 135 185 185"
          fill="none"
          stroke="#8affa0"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M60 185 Q120 140 180 185"
          fill="none"
          stroke="#8ac8ff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M65 185 Q120 145 175 185"
          fill="none"
          stroke="#c08aff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* Cloud 1 - left */}
      <g className={animated ? "ps-cloud1" : undefined}>
        <ellipse cx="38" cy="48" rx="22" ry="10" fill="#ffffff" opacity="0.85" />
        <ellipse cx="28" cy="43" rx="14" ry="8" fill="#ffffff" opacity="0.85" />
        <ellipse cx="48" cy="43" rx="12" ry="7" fill="#ffffff" opacity="0.85" />
        <ellipse cx="38" cy="40" rx="10" ry="6" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Cloud 2 - right */}
      <g className={animated ? "ps-cloud2" : undefined}>
        <ellipse cx="198" cy="55" rx="20" ry="9" fill="#ffffff" opacity="0.8" />
        <ellipse cx="190" cy="50" rx="12" ry="7" fill="#ffffff" opacity="0.8" />
        <ellipse cx="208" cy="50" rx="10" ry="6" fill="#ffffff" opacity="0.8" />
      </g>

      {/* Small fluffy cloud bottom */}
      <ellipse cx="155" cy="170" rx="18" ry="6" fill="#ffffff" opacity="0.5" />
      <ellipse cx="148" cy="167" rx="10" ry="5" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}
