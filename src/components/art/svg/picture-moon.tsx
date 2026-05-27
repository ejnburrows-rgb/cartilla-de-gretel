import React from "react";

interface PictureMoonProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureMoon({ animated = false, ...props }: PictureMoonProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A gentle crescent moon in a starry night sky"
      {...props}
    >
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .pm-twinkle1 { animation: pmTwinkle 3s ease-in-out infinite; }
            .pm-twinkle2 { animation: pmTwinkle 2.5s ease-in-out 0.8s infinite; }
            .pm-twinkle3 { animation: pmTwinkle 3.5s ease-in-out 1.6s infinite; }
            .pm-cloud1 { animation: pmDrift 12s ease-in-out infinite; }
            .pm-cloud2 { animation: pmDrift 15s ease-in-out 3s infinite; }
            @keyframes pmTwinkle {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.3); }
            }
            @keyframes pmDrift {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(8px); }
            }
          }
        `}</style>
      )}

      <defs>
        {/* Sky gradient */}
        <linearGradient id="pmSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a3e" />
          <stop offset="50%" stopColor="#2d2b55" />
          <stop offset="100%" stopColor="#3b3570" />
        </linearGradient>
        {/* Moon glow */}
        <radialGradient id="pmMoonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffeeba" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffeeba" stopOpacity="0" />
        </radialGradient>
        {/* Star glow filter */}
        <filter id="pmStarGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Night sky background */}
      <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#pmSkyGrad)" />

      {/* Distant tiny stars - background layer */}
      <circle cx="20" cy="25" r="1" fill="#e8dcf4" opacity="0.6" />
      <circle cx="55" cy="18" r="0.8" fill="#e8dcf4" opacity="0.5" />
      <circle cx="190" cy="30" r="1" fill="#e8dcf4" opacity="0.7" />
      <circle cx="215" cy="55" r="0.8" fill="#e8dcf4" opacity="0.4" />
      <circle cx="30" cy="80" r="0.7" fill="#e8dcf4" opacity="0.5" />
      <circle cx="210" cy="120" r="0.8" fill="#e8dcf4" opacity="0.6" />
      <circle cx="170" cy="15" r="0.9" fill="#e8dcf4" opacity="0.5" />

      {/* Twinkling stars - midground */}
      <g filter="url(#pmStarGlow)">
        <g className={animated ? "pm-twinkle1" : undefined}>
          <polygon points="45,50 47,46 49,50 47,54" fill="#ffefc1" opacity="0.8" />
          <polygon points="43,48 47,48 51,48" fill="#ffefc1" opacity="0.6" stroke="none" />
        </g>
        <g className={animated ? "pm-twinkle2" : undefined}>
          <polygon points="180,45 182,41 184,45 182,49" fill="#ffefc1" opacity="0.9" />
          <polygon points="178,43 182,43 186,43" fill="#ffefc1" opacity="0.6" />
        </g>
        <g className={animated ? "pm-twinkle3" : undefined}>
          <polygon points="100,28 102,24 104,28 102,32" fill="#e8dcf4" opacity="0.7" />
          <polygon points="98,26 102,26 106,26" fill="#e8dcf4" opacity="0.5" />
        </g>
        <g className={animated ? "pm-twinkle1" : undefined}>
          <polygon points="145,70 146.5,67 148,70 146.5,73" fill="#ffefc1" opacity="0.6" />
        </g>
        <g className={animated ? "pm-twinkle2" : undefined}>
          <polygon points="25,130 26.5,127 28,130 26.5,133" fill="#e8dcf4" opacity="0.5" />
        </g>
      </g>

      {/* Moon glow aura */}
      <circle cx="120" cy="90" r="55" fill="url(#pmMoonGlow)" />

      {/* Crescent moon body */}
      <circle cx="120" cy="90" r="38" fill="#fce9a8" />
      <circle cx="134" cy="82" r="30" fill="url(#pmSkyGrad)" />

      {/* Moon surface details - soft craters */}
      <circle cx="105" cy="80" r="4" fill="#f5dc7a" opacity="0.5" />
      <circle cx="112" cy="100" r="3" fill="#f5dc7a" opacity="0.4" />
      <circle cx="98" cy="95" r="2.5" fill="#f5dc7a" opacity="0.3" />

      {/* Moon's peaceful face */}
      {/* Closed sleepy eye */}
      <path d="M102 85 Q107 82 112 85" fill="none" stroke="#c49a3c" strokeWidth="1.8" strokeLinecap="round" />
      {/* Little eyelashes */}
      <line x1="103" y1="84" x2="101" y2="82" stroke="#c49a3c" strokeWidth="1" strokeLinecap="round" />
      <line x1="107" y1="82.5" x2="107" y2="80" stroke="#c49a3c" strokeWidth="1" strokeLinecap="round" />

      {/* Gentle smile */}
      <path d="M100 97 Q107 104 114 97" fill="none" stroke="#c49a3c" strokeWidth="1.6" strokeLinecap="round" />

      {/* Rosy cheek on moon */}
      <circle cx="97" cy="94" r="3.5" fill="#f0a0a0" opacity="0.35" />

      {/* Wispy cloud 1 - lower left */}
      <g className={animated ? "pm-cloud1" : undefined} opacity="0.25">
        <ellipse cx="50" cy="155" rx="35" ry="10" fill="#a8a0cc" />
        <ellipse cx="40" cy="150" rx="20" ry="8" fill="#a8a0cc" />
        <ellipse cx="65" cy="150" rx="18" ry="7" fill="#a8a0cc" />
      </g>

      {/* Wispy cloud 2 - lower right */}
      <g className={animated ? "pm-cloud2" : undefined} opacity="0.2">
        <ellipse cx="185" cy="165" rx="30" ry="8" fill="#9890b8" />
        <ellipse cx="178" cy="160" rx="18" ry="7" fill="#9890b8" />
        <ellipse cx="196" cy="161" rx="15" ry="6" fill="#9890b8" />
      </g>

      {/* Subtle hills silhouette at bottom */}
      <path d="M0 185 Q40 160 80 180 Q120 165 160 178 Q200 158 240 175 L240 200 L0 200 Z" fill="#252050" opacity="0.5" />
    </svg>
  );
}
