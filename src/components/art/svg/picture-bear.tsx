import React from "react";

interface PictureBearProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureBear({ animated = false, ...props }: PictureBearProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Un oso simpático sentado en un claro del bosque"
      {...props}
    >
      {/* === BACKGROUND === */}
      {/* Sky gradient */}
      <defs>
        <linearGradient id="bear-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4eaf7" />
          <stop offset="100%" stopColor="#e8f5e9" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="200" rx="8" fill="url(#bear-sky)" />

      {/* Soft clouds */}
      <ellipse cx="45" cy="30" rx="28" ry="12" fill="#ffffff" opacity="0.7" />
      <ellipse cx="60" cy="28" rx="20" ry="10" fill="#ffffff" opacity="0.8" />
      <ellipse cx="180" cy="22" rx="24" ry="10" fill="#ffffff" opacity="0.65" />
      <ellipse cx="200" cy="20" rx="18" ry="9" fill="#ffffff" opacity="0.75" />

      {/* Distant hills */}
      <ellipse cx="120" cy="110" rx="140" ry="50" fill="#b8dfc4" />
      <ellipse cx="60" cy="115" rx="80" ry="40" fill="#a8d5b8" />
      <ellipse cx="200" cy="112" rx="70" ry="38" fill="#a8d5b8" />

      {/* === MIDGROUND: Pine trees === */}
      {/* Left tree */}
      <polygon points="30,60 18,105 42,105" fill="#7fb992" stroke="#5a9e75" strokeWidth="1" />
      <polygon points="30,50 21,85 39,85" fill="#8cc9a0" stroke="#5a9e75" strokeWidth="1" />
      <rect x="27" y="105" width="6" height="12" rx="2" fill="#a0826d" />

      {/* Second left tree */}
      <polygon points="58,55 44,108 72,108" fill="#6db386" stroke="#4e8e68" strokeWidth="1" />
      <polygon points="58,42 48,80 68,80" fill="#80c49a" stroke="#4e8e68" strokeWidth="1" />
      <rect x="55" y="108" width="6" height="10" rx="2" fill="#a0826d" />

      {/* Right tree */}
      <polygon points="210,58 198,108 222,108" fill="#7fb992" stroke="#5a9e75" strokeWidth="1" />
      <polygon points="210,48 201,83 219,83" fill="#8cc9a0" stroke="#5a9e75" strokeWidth="1" />
      <rect x="207" y="108" width="6" height="12" rx="2" fill="#a0826d" />

      {/* Far right tree */}
      <polygon points="185,65 175,105 195,105" fill="#6db386" stroke="#4e8e68" strokeWidth="1" />
      <polygon points="185,55 177,88 193,88" fill="#80c49a" stroke="#4e8e68" strokeWidth="1" />
      <rect x="182" y="105" width="6" height="10" rx="2" fill="#a0826d" />

      {/* === Ground plane === */}
      <ellipse cx="120" cy="170" rx="130" ry="45" fill="#b5e2c4" />
      <ellipse cx="120" cy="180" rx="120" ry="30" fill="#a0d8ae" />

      {/* === BEAR === */}
      {/* Body */}
      <ellipse cx="120" cy="148" rx="28" ry="24" fill="#c9956b" />
      {/* Belly patch */}
      <ellipse cx="120" cy="150" rx="18" ry="16" fill="#e0c4a0" />

      {/* Legs */}
      <ellipse cx="102" cy="166" rx="10" ry="7" fill="#b8845c" />
      <ellipse cx="138" cy="166" rx="10" ry="7" fill="#b8845c" />

      {/* Arms */}
      <ellipse cx="95" cy="143" rx="8" ry="12" fill="#c9956b" transform="rotate(-15 95 143)" />
      <ellipse cx="145" cy="143" rx="8" ry="12" fill="#c9956b" transform="rotate(15 145 143)" />

      {/* Head */}
      <circle cx="120" cy="112" r="22" fill="#c9956b" />

      {/* Ears */}
      <circle cx="101" cy="96" r="10" fill="#c9956b" />
      <circle cx="101" cy="96" r="6" fill="#e8b89a" />
      <circle cx="139" cy="96" r="10" fill="#c9956b" />
      <circle cx="139" cy="96" r="6" fill="#e8b89a" />

      {/* Muzzle */}
      <ellipse cx="120" cy="118" rx="12" ry="9" fill="#e0c4a0" />

      {/* Eyes */}
      <circle cx="111" cy="108" r="4" fill="#ffffff" />
      <circle cx="111" cy="109" r="2.5" fill="#5c3d2e" />
      <circle cx="112" cy="108" r="1" fill="#ffffff" />
      <circle cx="129" cy="108" r="4" fill="#ffffff" />
      <circle cx="129" cy="109" r="2.5" fill="#5c3d2e" />
      <circle cx="130" cy="108" r="1" fill="#ffffff" />

      {/* Nose */}
      <ellipse cx="120" cy="115" rx="4" ry="3" fill="#5c3d2e" />

      {/* Mouth */}
      <path
        d="M117 118 Q120 122 123 118"
        fill="none"
        stroke="#5c3d2e"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Rosy cheeks */}
      <circle cx="105" cy="114" r="3.5" fill="#f4a0a0" opacity="0.5" />
      <circle cx="135" cy="114" r="3.5" fill="#f4a0a0" opacity="0.5" />

      {/* === FOREGROUND: Flowers and grass === */}
      {/* Grass tufts */}
      <path
        d="M20,175 Q22,168 24,175"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M26,177 Q28,170 30,177"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M75,178 Q77,171 79,178"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M160,176 Q162,169 164,176"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M215,178 Q217,171 219,178"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Flowers left */}
      <circle cx="70" cy="162" r="4" fill="#f9c3d1" />
      <circle cx="70" cy="162" r="2" fill="#f5e6a3" />
      <line x1="70" y1="166" x2="70" y2="175" stroke="#6db386" strokeWidth="1.2" />

      <circle cx="82" cy="168" r="3.5" fill="#c3b1f0" />
      <circle cx="82" cy="168" r="1.8" fill="#f5e6a3" />
      <line x1="82" y1="171" x2="82" y2="178" stroke="#6db386" strokeWidth="1.2" />

      {/* Flowers right */}
      <circle cx="165" cy="165" r="3.5" fill="#f9c3d1" />
      <circle cx="165" cy="165" r="1.8" fill="#f5e6a3" />
      <line x1="165" y1="168" x2="165" y2="176" stroke="#6db386" strokeWidth="1.2" />

      <circle cx="178" cy="160" r="4" fill="#a8d8f0" />
      <circle cx="178" cy="160" r="2" fill="#f5e6a3" />
      <line x1="178" y1="164" x2="178" y2="173" stroke="#6db386" strokeWidth="1.2" />

      {/* Small butterfly near bear */}
      <ellipse cx="152" cy="90" rx="3" ry="2" fill="#f0b4d0" transform="rotate(-20 152 90)" />
      <ellipse cx="156" cy="89" rx="3" ry="2" fill="#f0b4d0" transform="rotate(20 156 89)" />
      <line x1="154" y1="89" x2="154" y2="92" stroke="#c98c4f" strokeWidth="0.6" />
    </svg>
  );
}
