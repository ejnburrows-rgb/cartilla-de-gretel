import React from "react";

interface PictureCowProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureCow({ animated = false, ...props }: PictureCowProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Una vaca amigable en un prado verde"
      {...props}
    >
      <defs>
        <linearGradient id="cow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5e3f6" />
          <stop offset="100%" stopColor="#dff0fb" />
        </linearGradient>
      </defs>

      {/* === BACKGROUND: Sky === */}
      <rect x="0" y="0" width="240" height="200" rx="8" fill="url(#cow-sky)" />

      {/* Sun */}
      <circle cx="210" cy="30" r="18" fill="#fce588" opacity="0.85" />
      <circle cx="210" cy="30" r="14" fill="#fef3c0" />

      {/* Puffy clouds */}
      <ellipse cx="50" cy="28" rx="26" ry="11" fill="#ffffff" opacity="0.8" />
      <ellipse cx="68" cy="25" rx="18" ry="10" fill="#ffffff" opacity="0.85" />
      <ellipse cx="35" cy="25" rx="15" ry="8" fill="#ffffff" opacity="0.7" />

      <ellipse cx="150" cy="38" rx="22" ry="9" fill="#ffffff" opacity="0.7" />
      <ellipse cx="165" cy="35" rx="16" ry="8" fill="#ffffff" opacity="0.75" />

      {/* === MIDGROUND: Barn === */}
      {/* Barn body */}
      <rect x="170" y="72" width="48" height="42" rx="3" fill="#e07b6b" />
      {/* Barn roof */}
      <polygon points="165,72 218,72 194,52" fill="#c0564a" />
      {/* Barn door */}
      <rect x="186" y="90" width="16" height="24" rx="2" fill="#8b3a30" />
      <path d="M186 90 Q194 84 202 90" fill="#7a3028" />
      {/* Barn door cross beams */}
      <line x1="194" y1="90" x2="194" y2="114" stroke="#a0453a" strokeWidth="1" />
      {/* Barn windows */}
      <rect x="174" y="80" width="8" height="8" rx="1.5" fill="#fce588" opacity="0.7" />
      <line x1="178" y1="80" x2="178" y2="88" stroke="#c0564a" strokeWidth="0.8" />
      <line x1="174" y1="84" x2="182" y2="84" stroke="#c0564a" strokeWidth="0.8" />

      {/* Silo */}
      <rect x="220" y="65" width="14" height="49" rx="6" fill="#d8a090" />
      <ellipse cx="227" cy="65" rx="7" ry="4" fill="#c0887a" />

      {/* === Ground === */}
      <rect x="0" y="114" width="240" height="86" rx="0" fill="#b8dfa8" />
      <ellipse cx="120" cy="114" rx="130" ry="12" fill="#a5d494" />

      {/* Rolling hills texture */}
      <ellipse cx="60" cy="120" rx="70" ry="8" fill="#aed89e" />
      <ellipse cx="180" cy="118" rx="50" ry="6" fill="#aed89e" />

      {/* Fence posts */}
      <rect x="10" y="108" width="3" height="18" rx="1" fill="#c9a87c" />
      <rect x="35" y="108" width="3" height="18" rx="1" fill="#c9a87c" />
      <rect x="60" y="108" width="3" height="18" rx="1" fill="#c9a87c" />
      {/* Fence rails */}
      <line
        x1="10"
        y1="113"
        x2="63"
        y2="113"
        stroke="#c9a87c"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="120"
        x2="63"
        y2="120"
        stroke="#c9a87c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* === COW === */}
      {/* Body */}
      <ellipse cx="110" cy="142" rx="34" ry="22" fill="#f5f5f0" />

      {/* Spots */}
      <ellipse cx="100" cy="135" rx="8" ry="6" fill="#4a4a4a" transform="rotate(-10 100 135)" />
      <ellipse cx="120" cy="138" rx="6" ry="8" fill="#4a4a4a" transform="rotate(15 120 138)" />
      <ellipse cx="105" cy="148" rx="5" ry="4" fill="#4a4a4a" transform="rotate(-5 105 148)" />
      <circle cx="128" cy="150" r="4" fill="#4a4a4a" />

      {/* Legs */}
      <rect x="86" y="158" width="7" height="18" rx="3" fill="#f5f5f0" />
      <rect x="98" y="160" width="7" height="16" rx="3" fill="#f5f5f0" />
      <rect x="120" y="158" width="7" height="18" rx="3" fill="#f5f5f0" />
      <rect x="132" y="160" width="7" height="16" rx="3" fill="#f5f5f0" />
      {/* Hooves */}
      <rect x="85" y="173" width="9" height="4" rx="2" fill="#6b5b4f" />
      <rect x="97" y="173" width="9" height="4" rx="2" fill="#6b5b4f" />
      <rect x="119" y="173" width="9" height="4" rx="2" fill="#6b5b4f" />
      <rect x="131" y="173" width="9" height="4" rx="2" fill="#6b5b4f" />

      {/* Tail */}
      <path
        d="M143 135 Q155 130 150 120"
        fill="none"
        stroke="#f5f5f0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="150" cy="118" rx="3" ry="4" fill="#4a4a4a" />

      {/* Udder */}
      <ellipse cx="115" cy="162" rx="8" ry="5" fill="#f0c8c8" />

      {/* Head */}
      <ellipse cx="78" cy="128" rx="18" ry="16" fill="#f5f5f0" />

      {/* Ears */}
      <ellipse cx="65" cy="118" rx="6" ry="4" fill="#f5f5f0" transform="rotate(-30 65 118)" />
      <ellipse cx="65" cy="118" rx="4" ry="2.5" fill="#f0c8c8" transform="rotate(-30 65 118)" />
      <ellipse cx="91" cy="116" rx="6" ry="4" fill="#f5f5f0" transform="rotate(30 91 116)" />
      <ellipse cx="91" cy="116" rx="4" ry="2.5" fill="#f0c8c8" transform="rotate(30 91 116)" />

      {/* Horns */}
      <path
        d="M70 113 Q68 105 72 102"
        fill="none"
        stroke="#e8d8a0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M86 112 Q88 104 84 101"
        fill="none"
        stroke="#e8d8a0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Muzzle */}
      <ellipse cx="72" cy="134" rx="10" ry="7" fill="#f0d0c0" />

      {/* Head spot */}
      <ellipse cx="82" cy="122" rx="6" ry="5" fill="#4a4a4a" />

      {/* Eyes */}
      <circle cx="72" cy="125" r="3.5" fill="#ffffff" />
      <circle cx="72" cy="126" r="2" fill="#5c3d2e" />
      <circle cx="73" cy="125" r="0.8" fill="#ffffff" />
      <circle cx="85" cy="124" r="3.5" fill="#ffffff" />
      <circle cx="85" cy="125" r="2" fill="#5c3d2e" />
      <circle cx="86" cy="124" r="0.8" fill="#ffffff" />

      {/* Nostrils */}
      <ellipse cx="69" cy="134" rx="2" ry="1.5" fill="#c9a090" />
      <ellipse cx="75" cy="134" rx="2" ry="1.5" fill="#c9a090" />

      {/* Mouth */}
      <path
        d="M68 138 Q72 141 76 138"
        fill="none"
        stroke="#a08070"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Bell */}
      <line x1="78" y1="142" x2="78" y2="148" stroke="#c9a87c" strokeWidth="1.2" />
      <circle
        cx="78"
        cy="150"
        r="4"
        fill="#f5d060"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="1"
      />
      <circle cx="78" cy="151" r="1" fill="var(--art-primary, #c98c4f)" />

      {/* === FOREGROUND: Flowers and grass === */}
      <path
        d="M15,175 Q17,168 19,175"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M45,180 Q47,173 49,180"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M160,182 Q162,175 164,182"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M200,178 Q202,171 204,178"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Daisies */}
      <circle cx="25" cy="170" r="3.5" fill="#ffffff" />
      <circle cx="25" cy="170" r="1.5" fill="#f5e680" />
      <line x1="25" y1="173" x2="25" y2="180" stroke="#6db386" strokeWidth="1" />

      <circle cx="155" cy="172" r="3" fill="#ffffff" />
      <circle cx="155" cy="172" r="1.3" fill="#f5e680" />
      <line x1="155" y1="175" x2="155" y2="182" stroke="#6db386" strokeWidth="1" />

      <circle cx="195" cy="168" r="3.5" fill="#f9d0d8" />
      <circle cx="195" cy="168" r="1.5" fill="#f5e680" />
      <line x1="195" y1="171" x2="195" y2="179" stroke="#6db386" strokeWidth="1" />
    </svg>
  );
}
