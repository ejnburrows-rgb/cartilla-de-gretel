import React from "react";

interface PictureCatProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureCat({ animated = false, ...props }: PictureCatProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Un gato juguetón sentado en el alféizar de una ventana"
      {...props}
    >
      <defs>
        <linearGradient id="cat-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ede0" />
          <stop offset="100%" stopColor="#efe4d4" />
        </linearGradient>
        <linearGradient id="cat-outside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5e3f6" />
          <stop offset="80%" stopColor="#d6eefa" />
          <stop offset="100%" stopColor="#b8dfa8" />
        </linearGradient>
      </defs>

      {/* === BACKGROUND: Wall === */}
      <rect x="0" y="0" width="240" height="200" rx="8" fill="url(#cat-wall)" />

      {/* === Window frame === */}
      <rect x="30" y="15" width="180" height="140" rx="6" fill="url(#cat-outside)" />
      {/* Window frame border */}
      <rect x="30" y="15" width="180" height="140" rx="6" fill="none" stroke="#d4c4a8" strokeWidth="4" />
      {/* Window cross beams */}
      <line x1="120" y1="15" x2="120" y2="155" stroke="#d4c4a8" strokeWidth="3" />
      <line x1="30" y1="85" x2="210" y2="85" stroke="#d4c4a8" strokeWidth="3" />

      {/* Outside scene through window */}
      {/* Distant hills */}
      <ellipse cx="120" cy="142" rx="100" ry="20" fill="#b8dfa8" />
      {/* Distant tree */}
      <circle cx="70" cy="118" r="10" fill="#a5d494" />
      <rect x="68" y="128" width="4" height="10" rx="1" fill="#a0826d" />
      <circle cx="165" cy="125" r="8" fill="#a5d494" />
      <rect x="163" y="133" width="4" height="8" rx="1" fill="#a0826d" />
      {/* Small cloud outside */}
      <ellipse cx="80" cy="35" rx="14" ry="6" fill="#ffffff" opacity="0.8" />
      <ellipse cx="170" cy="42" rx="12" ry="5" fill="#ffffff" opacity="0.7" />

      {/* === Curtains === */}
      {/* Left curtain */}
      <path d="M30 15 Q38 15 36 40 Q34 70 30 85 L30 15" fill="#e8b8c8" opacity="0.7" />
      <path d="M30 15 Q42 20 40 45 Q38 65 30 85" fill="none" stroke="#d4a0b0" strokeWidth="1" />
      {/* Right curtain */}
      <path d="M210 15 Q202 15 204 40 Q206 70 210 85 L210 15" fill="#e8b8c8" opacity="0.7" />
      <path d="M210 15 Q198 20 200 45 Q202 65 210 85" fill="none" stroke="#d4a0b0" strokeWidth="1" />

      {/* === Windowsill === */}
      <rect x="22" y="152" width="196" height="10" rx="3" fill="#d4c4a8" />
      <rect x="22" y="152" width="196" height="4" rx="2" fill="#e0d4c0" />

      {/* === Potted plant (left side of sill) === */}
      {/* Pot */}
      <path d="M42 152 L38 175 L56 175 L52 152" fill="#d4826a" />
      <rect x="38" y="149" width="18" height="5" rx="2" fill="#d4826a" />
      {/* Soil */}
      <ellipse cx="47" cy="153" rx="6" ry="2" fill="#8b6b50" />
      {/* Plant leaves */}
      <path d="M47 149 Q42 135 47 130" fill="none" stroke="#6db386" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="45" cy="130" rx="5" ry="3" fill="#80c49a" transform="rotate(-20 45 130)" />
      <path d="M47 149 Q52 132 48 125" fill="none" stroke="#6db386" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="49" cy="125" rx="5" ry="3" fill="#8cc9a0" transform="rotate(15 49 125)" />
      <path d="M47 149 Q47 138 44 133" fill="none" stroke="#6db386" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="43" cy="133" rx="4" ry="2.5" fill="#6db386" transform="rotate(-5 43 133)" />
      {/* Small flower */}
      <circle cx="48" cy="123" r="3" fill="#f9c3d1" />
      <circle cx="48" cy="123" r="1.2" fill="#f5e6a3" />

      {/* === CAT === */}
      {/* Tail */}
      <path d="M165 148 Q180 130 185 115 Q188 105 182 102" fill="none" stroke="#e8a050" strokeWidth="4" strokeLinecap="round" />
      {/* Tail stripes */}
      <path d="M176 123 Q179 120 181 118" fill="none" stroke="#c98040" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M180 114 Q182 111 183 108" fill="none" stroke="#c98040" strokeWidth="1.5" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="140" cy="140" rx="24" ry="16" fill="#f0a848" />
      {/* Body stripes */}
      <path d="M130 130 Q132 138 130 146" fill="none" stroke="#c98040" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M138 128 Q140 138 138 148" fill="none" stroke="#c98040" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M148 129 Q150 138 148 147" fill="none" stroke="#c98040" strokeWidth="1.5" strokeLinecap="round" />

      {/* Belly */}
      <ellipse cx="140" cy="145" rx="14" ry="8" fill="#fce0b8" />

      {/* Front paws tucked */}
      <ellipse cx="122" cy="152" rx="7" ry="4" fill="#f0a848" />
      <ellipse cx="135" cy="152" rx="7" ry="4" fill="#f0a848" />
      {/* Paw details */}
      <path d="M120 153 Q121 151 123 153" fill="none" stroke="#c98040" strokeWidth="0.8" />
      <path d="M133 153 Q134 151 136 153" fill="none" stroke="#c98040" strokeWidth="0.8" />

      {/* Back paw peeking */}
      <ellipse cx="160" cy="152" rx="6" ry="3.5" fill="#f0a848" />

      {/* Head */}
      <circle cx="115" cy="122" r="18" fill="#f0a848" />

      {/* Ears */}
      <polygon points="100,108 104,92 112,106" fill="#f0a848" />
      <polygon points="103,106 105,96 110,105" fill="#f0c8a8" />
      <polygon points="118,105 126,90 130,106" fill="#f0a848" />
      <polygon points="121,104 126,94 128,104" fill="#f0c8a8" />

      {/* Face stripes */}
      <path d="M100 118 Q105 120 108 118" fill="none" stroke="#c98040" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M122 117 Q125 120 130 118" fill="none" stroke="#c98040" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M113 109 Q115 112 117 109" fill="none" stroke="#c98040" strokeWidth="1.2" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="108" cy="120" rx="4.5" ry="5" fill="#ffffff" />
      <ellipse cx="108" cy="121" rx="3" ry="3.5" fill="#88b060" />
      <ellipse cx="108" cy="121" rx="1.5" ry="2.5" fill="#2a2a2a" />
      <circle cx="109" cy="119" r="1" fill="#ffffff" />

      <ellipse cx="122" cy="120" rx="4.5" ry="5" fill="#ffffff" />
      <ellipse cx="122" cy="121" rx="3" ry="3.5" fill="#88b060" />
      <ellipse cx="122" cy="121" rx="1.5" ry="2.5" fill="#2a2a2a" />
      <circle cx="123" cy="119" r="1" fill="#ffffff" />

      {/* Nose */}
      <path d="M113 126 L115 128 L117 126 Z" fill="#f0a0a0" />

      {/* Mouth */}
      <path d="M115 128 L115 131" fill="none" stroke="#a08070" strokeWidth="0.8" />
      <path d="M112 131 Q115 133 118 131" fill="none" stroke="#a08070" strokeWidth="0.8" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="96" y1="125" x2="107" y2="127" stroke="#d0b898" strokeWidth="0.8" />
      <line x1="97" y1="129" x2="107" y2="129" stroke="#d0b898" strokeWidth="0.8" />
      <line x1="123" y1="127" x2="134" y2="125" stroke="#d0b898" strokeWidth="0.8" />
      <line x1="123" y1="129" x2="133" y2="129" stroke="#d0b898" strokeWidth="0.8" />

      {/* Cheek fluff */}
      <circle cx="102" cy="126" r="3" fill="#fce0b8" opacity="0.6" />
      <circle cx="128" cy="126" r="3" fill="#fce0b8" opacity="0.6" />

      {/* === Below window: baseboard === */}
      <rect x="0" y="162" width="240" height="38" rx="0" fill="#e8dcc8" />
      <line x1="0" y1="164" x2="240" y2="164" stroke="#d4c4a8" strokeWidth="1.5" />

      {/* Small ball of yarn on floor */}
      <circle cx="195" cy="182" r="8" fill="#e8a0b8" />
      <path d="M190 178 Q195 182 192 186 Q196 184 200 186 Q198 180 193 178" fill="none" stroke="#d08898" strokeWidth="0.8" />
      <path d="M203 182 Q210 180 215 184" fill="none" stroke="#e8a0b8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
