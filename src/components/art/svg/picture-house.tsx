import React from "react";

interface PictureHouseProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean;
}

export function PictureHouse({ animated = false, ...props }: PictureHouseProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Una casa acogedora con un jardín y sol brillante"
      {...props}
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4eaf7" />
          <stop offset="100%" stopColor="#e8f5e9" />
        </linearGradient>
        {/* Roof gradient */}
        <linearGradient id="house-roof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e26d5c" />
          <stop offset="100%" stopColor="#c84b31" />
        </linearGradient>
      </defs>

      {/* === BACKGROUND === */}
      <rect x="0" y="0" width="240" height="200" rx="8" fill="url(#house-sky)" />

      {/* Sunny day elements */}
      {/* Sun in the corner */}
      <circle cx="210" cy="30" r="16" fill="#ffe066" opacity="0.9" />
      <circle cx="210" cy="30" r="12" fill="#ffd43b" />
      {/* Sun rays */}
      <line x1="210" y1="8" x2="210" y2="12" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="210" y1="48" x2="210" y2="52" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="188" y1="30" x2="192" y2="30" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="228" y1="30" x2="232" y2="30" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="195" y1="15" x2="198" y2="18" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="222" y1="42" x2="225" y2="45" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="195" y1="45" x2="198" y2="42" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />
      <line x1="222" y1="18" x2="225" y2="15" stroke="#ffd43b" strokeWidth="2" strokeLinecap="round" />

      {/* Soft clouds */}
      <ellipse cx="50" cy="35" rx="24" ry="10" fill="#ffffff" opacity="0.75" />
      <ellipse cx="65" cy="32" rx="16" ry="8" fill="#ffffff" opacity="0.85" />
      <ellipse cx="130" cy="25" rx="20" ry="9" fill="#ffffff" opacity="0.65" />

      {/* Green hills background */}
      <ellipse cx="60" cy="115" rx="90" ry="35" fill="#a8d5b8" />
      <ellipse cx="180" cy="120" rx="90" ry="30" fill="#b8dfc4" />

      {/* Ground plane */}
      <ellipse cx="120" cy="165" rx="130" ry="35" fill="#a0d8ae" />
      <ellipse cx="120" cy="175" rx="120" ry="25" fill="#8dc99d" />

      {/* === COZY HOUSE === */}
      {/* Chimney */}
      <rect x="75" y="65" width="12" height="25" rx="1" fill="#ac6c53" />
      <rect x="73" y="63" width="16" height="4" rx="1" fill="#8d543e" />
      {/* Chimney smoke */}
      <ellipse cx="81" cy="53" rx="6" ry="4" fill="#ffffff" opacity="0.6" />
      <ellipse cx="85" cy="44" rx="8" ry="5" fill="#ffffff" opacity="0.5" />
      <ellipse cx="91" cy="34" rx="10" ry="6" fill="#ffffff" opacity="0.3" />

      {/* House Body (Yellow/Cream walls) */}
      <rect x="65" y="95" width="110" height="70" rx="4" fill="#faf0d7" stroke="#ebd7ab" strokeWidth="1.5" />

      {/* Red Roof */}
      <polygon points="55,98 120,48 185,98" fill="url(#house-roof)" stroke="#a63a2b" strokeWidth="1" />
      {/* Round window in attic */}
      <circle cx="120" cy="72" r="10" fill="#ffffff" stroke="#c84b31" strokeWidth="1.5" />
      <circle cx="120" cy="72" r="8" fill="#d4eaf7" />
      <line x1="120" y1="64" x2="120" y2="80" stroke="#c84b31" strokeWidth="1" />
      <line x1="112" y1="72" x2="128" y2="72" stroke="#c84b31" strokeWidth="1" />

      {/* Front Door */}
      <rect x="105" y="120" width="30" height="45" rx="2" fill="#ac6c53" stroke="#8d543e" strokeWidth="1" />
      <circle cx="112" cy="142" r="2.5" fill="#ffe066" /> {/* Golden doorknob */}

      {/* Window Left */}
      <rect x="75" y="112" width="22" height="26" rx="2" fill="#ffffff" stroke="#ebd7ab" strokeWidth="1.5" />
      <rect x="77" y="114" width="18" height="22" rx="1" fill="#d4eaf7" />
      <line x1="86" y1="114" x2="86" y2="136" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="77" y1="125" x2="95" y2="125" stroke="#ffffff" strokeWidth="1.5" />
      {/* Flower box Left */}
      <rect x="72" y="136" width="28" height="6" rx="1.5" fill="#8d543e" />
      {/* Flowers in box */}
      <circle cx="76" cy="133" r="2.5" fill="#e26d5c" />
      <circle cx="86" cy="133" r="2.5" fill="#ffe066" />
      <circle cx="96" cy="133" r="2.5" fill="#e26d5c" />

      {/* Window Right */}
      <rect x="143" y="112" width="22" height="26" rx="2" fill="#ffffff" stroke="#ebd7ab" strokeWidth="1.5" />
      <rect x="145" y="114" width="18" height="22" rx="1" fill="#d4eaf7" />
      <line x1="154" y1="114" x2="154" y2="136" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="145" y1="125" x2="163" y2="125" stroke="#ffffff" strokeWidth="1.5" />
      {/* Flower box Right */}
      <rect x="140" y="136" width="28" height="6" rx="1.5" fill="#8d543e" />
      {/* Flowers in box */}
      <circle cx="144" cy="133" r="2.5" fill="#ffe066" />
      <circle cx="154" cy="133" r="2.5" fill="#e26d5c" />
      <circle cx="164" cy="133" r="2.5" fill="#ffe066" />

      {/* Garden path leading to the door */}
      <path d="M105,165 Q100,185 85,198 L125,198 Q130,185 135,165 Z" fill="#ebd7ab" opacity="0.8" />

      {/* Bushes by the house */}
      {/* Left Bush */}
      <ellipse cx="48" cy="158" rx="16" ry="12" fill="#5a9e75" />
      <ellipse cx="58" cy="155" rx="14" ry="12" fill="#6db386" />
      <ellipse cx="52" cy="150" rx="10" ry="8" fill="#80c49a" />
      {/* Right Bush */}
      <ellipse cx="192" cy="158" rx="16" ry="12" fill="#5a9e75" />
      <ellipse cx="182" cy="155" rx="14" ry="12" fill="#6db386" />
      <ellipse cx="188" cy="150" rx="10" ry="8" fill="#80c49a" />

      {/* Little flowers in the yard */}
      <circle cx="35" cy="178" r="3.5" fill="#f9c3d1" />
      <circle cx="35" cy="178" r="1.5" fill="#ffe066" />
      <circle cx="198" cy="180" r="3.5" fill="#a8d8f0" />
      <circle cx="198" cy="180" r="1.5" fill="#ffe066" />
    </svg>
  );
}
