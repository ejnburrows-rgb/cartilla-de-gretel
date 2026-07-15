import React from "react";

interface PictureDogProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureDog({ animated = false, ...props }: PictureDogProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Un perro feliz jugando en un patio"
      {...props}
    >
      <defs>
        <linearGradient id="dog-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8dcf8" />
          <stop offset="100%" stopColor="#dff0fb" />
        </linearGradient>
      </defs>

      {/* === BACKGROUND: Sky === */}
      <rect x="0" y="0" width="240" height="200" rx="8" fill="url(#dog-sky)" />

      {/* Sun */}
      <circle cx="30" cy="28" r="18" fill="#fce588" opacity="0.85" />
      <circle cx="30" cy="28" r="13" fill="#fef3c0" />
      {/* Sun rays */}
      <line
        x1="30"
        y1="6"
        x2="30"
        y2="12"
        stroke="#fce588"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="12"
        y1="18"
        x2="16"
        y2="22"
        stroke="#fce588"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="48"
        y1="18"
        x2="44"
        y2="22"
        stroke="#fce588"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="8"
        y1="34"
        x2="14"
        y2="32"
        stroke="#fce588"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Clouds */}
      <ellipse cx="130" cy="25" rx="22" ry="9" fill="#ffffff" opacity="0.75" />
      <ellipse cx="145" cy="22" rx="16" ry="8" fill="#ffffff" opacity="0.8" />
      <ellipse cx="200" cy="35" rx="18" ry="7" fill="#ffffff" opacity="0.65" />

      {/* === MIDGROUND: Fence === */}
      {/* Fence pickets */}
      <rect
        x="0"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="12"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="24"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="36"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="48"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="60"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      {/* Fence rails */}
      <line x1="0" y1="92" x2="67" y2="92" stroke="#dcd0b8" strokeWidth="2" />
      <line x1="0" y1="105" x2="67" y2="105" stroke="#dcd0b8" strokeWidth="2" />

      {/* Right fence section */}
      <rect
        x="178"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="190"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="202"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="214"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <rect
        x="226"
        y="85"
        width="7"
        height="28"
        rx="2"
        fill="#f0e4d0"
        stroke="#dcd0b8"
        strokeWidth="0.8"
      />
      <line x1="178" y1="92" x2="240" y2="92" stroke="#dcd0b8" strokeWidth="2" />
      <line x1="178" y1="105" x2="240" y2="105" stroke="#dcd0b8" strokeWidth="2" />

      {/* Garden bush behind fence */}
      <ellipse cx="20" cy="88" rx="16" ry="10" fill="#8cc9a0" />
      <ellipse cx="50" cy="86" rx="14" ry="9" fill="#a5d494" />
      <ellipse cx="200" cy="87" rx="18" ry="11" fill="#8cc9a0" />
      <ellipse cx="228" cy="89" rx="14" ry="8" fill="#a5d494" />

      {/* Small flowers on bushes */}
      <circle cx="15" cy="83" r="2.5" fill="#f9c3d1" />
      <circle cx="25" cy="81" r="2" fill="#f9c3d1" />
      <circle cx="205" cy="80" r="2.5" fill="#c3b1f0" />
      <circle cx="195" cy="83" r="2" fill="#c3b1f0" />

      {/* === Ground === */}
      <rect x="0" y="113" width="240" height="87" rx="0" fill="#b8dfa8" />
      <ellipse cx="120" cy="113" rx="130" ry="10" fill="#a5d494" />

      {/* === DOG === */}
      {/* Tail (wagging up) */}
      <path
        d="M162 120 Q170 100 175 95 Q178 92 176 90"
        fill="none"
        stroke="#e8c878"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Body */}
      <ellipse cx="125" cy="130" rx="35" ry="20" fill="#f0d078" />
      {/* Belly */}
      <ellipse cx="125" cy="136" rx="24" ry="12" fill="#fce8b0" />

      {/* Back legs */}
      <rect x="148" y="144" width="9" height="22" rx="4" fill="#e8c878" />
      <rect x="138" y="146" width="9" height="20" rx="4" fill="#e8c878" />
      {/* Back paws */}
      <ellipse cx="152" cy="167" rx="6" ry="3" fill="#f0d078" />
      <ellipse cx="142" cy="167" rx="6" ry="3" fill="#f0d078" />

      {/* Front legs */}
      <rect x="98" y="142" width="9" height="24" rx="4" fill="#e8c878" />
      <rect x="110" y="144" width="9" height="22" rx="4" fill="#e8c878" />
      {/* Front paws */}
      <ellipse cx="102" cy="167" rx="6" ry="3" fill="#f0d078" />
      <ellipse cx="114" cy="167" rx="6" ry="3" fill="#f0d078" />

      {/* Chest fluff */}
      <ellipse cx="98" cy="128" rx="10" ry="12" fill="#fce8b0" />

      {/* Head */}
      <circle cx="85" cy="112" r="20" fill="#f0d078" />

      {/* Ears */}
      <ellipse cx="70" cy="102" rx="8" ry="14" fill="#d4a848" transform="rotate(-15 70 102)" />
      <ellipse cx="100" cy="100" rx="8" ry="14" fill="#d4a848" transform="rotate(15 100 100)" />
      {/* Inner ear */}
      <ellipse cx="70" cy="103" rx="5" ry="10" fill="#e8c878" transform="rotate(-15 70 103)" />
      <ellipse cx="100" cy="101" rx="5" ry="10" fill="#e8c878" transform="rotate(15 100 101)" />

      {/* Muzzle */}
      <ellipse cx="78" cy="118" rx="12" ry="8" fill="#fce8b0" />

      {/* Eyes */}
      <circle cx="78" cy="108" r="4.5" fill="#ffffff" />
      <circle cx="78" cy="109" r="3" fill="#5c3d2e" />
      <circle cx="79" cy="107" r="1.2" fill="#ffffff" />
      <circle cx="92" cy="107" r="4.5" fill="#ffffff" />
      <circle cx="92" cy="108" r="3" fill="#5c3d2e" />
      <circle cx="93" cy="106" r="1.2" fill="#ffffff" />

      {/* Eyebrows */}
      <path
        d="M73 103 Q78 101 83 103"
        fill="none"
        stroke="#c9a040"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M87 102 Q92 100 97 102"
        fill="none"
        stroke="#c9a040"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="78" cy="115" rx="4" ry="3" fill="#4a3a30" />
      <ellipse cx="79" cy="114" rx="1.2" ry="0.8" fill="#6a5a50" />

      {/* Mouth — happy panting */}
      <path d="M74 119 Q78 125 82 119" fill="#e07070" stroke="#a05050" strokeWidth="0.8" />
      {/* Tongue */}
      <ellipse cx="78" cy="124" rx="3" ry="4" fill="#f0a0a0" />

      {/* Collar */}
      <path
        d="M74 126 Q85 132 96 126"
        fill="none"
        stroke="#e06050"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Tag */}
      <circle cx="85" cy="132" r="3" fill="var(--art-primary, #c98c4f)" />

      {/* === Ball === */}
      <circle cx="170" cy="158" r="10" fill="#e87080" />
      <circle cx="170" cy="158" r="10" fill="none" stroke="#d06068" strokeWidth="1" />
      <path d="M163 152 Q170 158 177 152" fill="none" stroke="#d06068" strokeWidth="0.8" />
      <path d="M163 164 Q170 158 177 164" fill="none" stroke="#d06068" strokeWidth="0.8" />
      {/* Ball highlight */}
      <ellipse cx="167" cy="154" rx="3" ry="2" fill="#f0a0a8" opacity="0.5" />

      {/* === FOREGROUND: Grass and details === */}
      <path
        d="M10,178 Q12,171 14,178"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M50,182 Q52,175 54,182"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M80,180 Q82,173 84,180"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M190,178 Q192,171 194,178"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M220,180 Q222,173 224,180"
        fill="none"
        stroke="#6db386"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Small daisies */}
      <circle cx="35" cy="172" r="3" fill="#ffffff" />
      <circle cx="35" cy="172" r="1.2" fill="#f5e680" />
      <line x1="35" y1="175" x2="35" y2="182" stroke="#6db386" strokeWidth="1" />

      <circle cx="210" cy="170" r="3.5" fill="#c3b1f0" />
      <circle cx="210" cy="170" r="1.5" fill="#f5e680" />
      <line x1="210" y1="173" x2="210" y2="180" stroke="#6db386" strokeWidth="1" />

      {/* Butterfly */}
      <ellipse cx="55" cy="60" rx="4" ry="2.5" fill="#f0c8e0" transform="rotate(-25 55 60)" />
      <ellipse cx="60" cy="59" rx="4" ry="2.5" fill="#e8b8d8" transform="rotate(25 60 59)" />
      <line
        x1="57.5"
        y1="59"
        x2="57.5"
        y2="63"
        stroke="var(--art-primary, #c98c4f)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
