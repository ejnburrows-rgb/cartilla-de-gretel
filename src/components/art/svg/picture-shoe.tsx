import React from "react";

interface PictureShoeProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureShoe({ animated = false, ...props }: PictureShoeProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A cute red children's sneaker with untied laces"
      {...props}
    >
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .ps-lace1 { animation: psLaceSway 3s ease-in-out infinite; transform-origin: 108px 82px; }
            .ps-lace2 { animation: psLaceSway 3s ease-in-out 0.4s infinite; transform-origin: 122px 80px; }
            .ps-star { animation: psStarPop 2.5s ease-in-out infinite; }
            @keyframes psLaceSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(8deg); }
            }
            @keyframes psStarPop {
              0%, 100% { opacity: 0; transform: scale(0.5); }
              50% { opacity: 0.7; transform: scale(1); }
            }
          }
        `}</style>
      )}

      <defs>
        {/* Warm room background */}
        <linearGradient id="shBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="60%" stopColor="#fff3e0" />
          <stop offset="100%" stopColor="#efebe9" />
        </linearGradient>
        {/* Shoe red gradient */}
        <linearGradient id="shRedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef5350" />
          <stop offset="100%" stopColor="#c62828" />
        </linearGradient>
        {/* Wooden floor gradient */}
        <linearGradient id="shFloorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7ccc8" />
          <stop offset="100%" stopColor="#bcaaa4" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="240" height="200" rx="12" fill="url(#shBgGrad)" />

      {/* Wooden floor */}
      <rect x="0" y="145" width="240" height="55" rx="0" fill="url(#shFloorGrad)" />

      {/* Floor planks */}
      <line x1="0" y1="145" x2="240" y2="145" stroke="#a1887f" strokeWidth="1.5" />
      <line x1="80" y1="145" x2="80" y2="200" stroke="#a1887f" strokeWidth="0.8" opacity="0.3" />
      <line x1="160" y1="145" x2="160" y2="200" stroke="#a1887f" strokeWidth="0.8" opacity="0.3" />
      {/* Wood grain lines */}
      <path d="M10 160 Q40 158 70 160" fill="none" stroke="#a1887f" strokeWidth="0.5" opacity="0.3" />
      <path d="M90 170 Q120 168 150 170" fill="none" stroke="#a1887f" strokeWidth="0.5" opacity="0.3" />
      <path d="M170 165 Q200 163 230 165" fill="none" stroke="#a1887f" strokeWidth="0.5" opacity="0.3" />
      <path d="M20 180 Q50 178 75 180" fill="none" stroke="#a1887f" strokeWidth="0.5" opacity="0.25" />
      <path d="M100 185 Q130 183 155 185" fill="none" stroke="#a1887f" strokeWidth="0.5" opacity="0.25" />

      {/* Shoe shadow on floor */}
      <ellipse cx="125" cy="147" rx="55" ry="5" fill="#8d6e63" opacity="0.15" />

      {/* White sole - bottom of shoe */}
      <path
        d="M55 140 Q55 148 65 148 L175 148 Q185 148 185 140 L180 135 Q170 128 55 135 Z"
        fill="#fafafa"
        stroke="#bdbdbd"
        strokeWidth="1"
      />
      {/* Sole tread detail */}
      <line x1="80" y1="146" x2="80" y2="143" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="100" y1="146" x2="100" y2="142" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="120" y1="146" x2="120" y2="142" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="140" y1="146" x2="140" y2="142" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="160" y1="146" x2="160" y2="143" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Shoe body - main red shape */}
      <path
        d="M60 135 Q58 100 70 85 Q80 74 100 72 L115 72 Q120 72 125 74
           Q140 80 155 90 Q170 100 180 115 Q185 125 185 135 Z"
        fill="url(#shRedGrad)"
        stroke="#b71c1c"
        strokeWidth="1.5"
      />

      {/* Shoe toe cap - rounded white rubber */}
      <path
        d="M155 115 Q170 105 180 115 Q185 125 185 135 L175 135 Q172 120 160 115 Z"
        fill="#ffffff"
        stroke="#bdbdbd"
        strokeWidth="1"
        opacity="0.9"
      />

      {/* Shoe tongue */}
      <path
        d="M95 72 Q100 58 108 55 Q115 55 120 60 Q125 72 122 78"
        fill="#e57373"
        stroke="#c62828"
        strokeWidth="1"
      />

      {/* Shoe collar / opening */}
      <path
        d="M68 90 Q75 76 95 72 L122 74 Q130 78 135 85"
        fill="none"
        stroke="#b71c1c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Inner shoe darkness */}
      <path
        d="M72 88 Q78 78 95 74 L120 76 Q128 80 132 86"
        fill="#4a1010"
        opacity="0.3"
      />

      {/* Lace eyelets */}
      <circle cx="98" cy="84" r="2.5" fill="#4a1010" stroke="#b71c1c" strokeWidth="1" />
      <circle cx="108" cy="82" r="2.5" fill="#4a1010" stroke="#b71c1c" strokeWidth="1" />
      <circle cx="118" cy="82" r="2.5" fill="#4a1010" stroke="#b71c1c" strokeWidth="1" />
      <circle cx="128" cy="84" r="2.5" fill="#4a1010" stroke="#b71c1c" strokeWidth="1" />

      {/* Untied laces - left lace */}
      <g className={animated ? "ps-lace1" : undefined}>
        <path
          d="M98 84 Q85 70 78 60 Q75 55 80 52"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Lace end / aglet */}
        <rect x="78" y="49" width="5" height="7" rx="2" fill="#e0e0e0" stroke="#bdbdbd" strokeWidth="0.5" />
      </g>

      {/* Untied laces - right lace */}
      <g className={animated ? "ps-lace2" : undefined}>
        <path
          d="M128 84 Q135 68 140 58 Q142 52 138 48"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Lace end / aglet */}
        <rect x="135" y="45" width="5" height="7" rx="2" fill="#e0e0e0" stroke="#bdbdbd" strokeWidth="0.5" />
      </g>

      {/* Cross lace between eyelets */}
      <path d="M100 84 Q108 78 118 82" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
      <path d="M108 82 Q118 78 128 84" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />

      {/* Shoe body highlight */}
      <path
        d="M70 120 Q80 110 110 105 Q120 103 130 108"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.2"
        strokeLinecap="round"
      />

      {/* Side stripe detail */}
      <path
        d="M75 120 Q100 108 135 105 Q155 105 170 115"
        fill="none"
        stroke="#ffcdd2"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Charming star decorations */}
      <g className={animated ? "ps-star" : undefined}>
        <polygon points="45,55 47,50 49,55 44,52 50,52" fill="#ffd54f" opacity="0.5" />
      </g>
      <g className={animated ? "ps-star" : undefined}>
        <polygon points="195,65 197,60 199,65 194,62 200,62" fill="#ffd54f" opacity="0.4" />
      </g>

      {/* Small heart decoration near shoe */}
      <path d="M200 130 Q203 125 206 130 Q209 125 212 130 Q206 138 200 130 Z" fill="#ef9a9a" opacity="0.4" />

      {/* Ambient sparkle dots */}
      <circle cx="30" cy="30" r="1.5" fill="var(--art-accent, #d4a76a)" opacity="0.3" />
      <circle cx="210" cy="40" r="1.2" fill="var(--art-accent, #d4a76a)" opacity="0.25" />
      <circle cx="50" cy="110" r="1" fill="var(--art-accent, #d4a76a)" opacity="0.2" />
    </svg>
  );
}
