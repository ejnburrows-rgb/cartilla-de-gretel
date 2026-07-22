import type { SVGProps } from "react";

// Common style parameters to strictly respect the JSX double-brace styling ban
const baseStrokeStyle = {
  stroke: "#1c1917", // stone-900
  strokeWidth: "2.5",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const strokeStyle = {
  ...baseStrokeStyle,
  fill: "none",
};

const guideStrokeStyle = {
  stroke: "#d6d3d1", // stone-300
  strokeWidth: "1.5",
  strokeDasharray: "3 3",
  fill: "none",
};

interface DrawingProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function DrawOso({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Head */}
      <circle cx="50" cy="52" r="26" {...strokeStyle} />
      {/* Left Ear */}
      <circle cx="28" cy="30" r="10" {...strokeStyle} />
      <circle cx="28" cy="30" r="5" {...strokeStyle} />
      {/* Right Ear */}
      <circle cx="72" cy="30" r="10" {...strokeStyle} />
      <circle cx="72" cy="30" r="5" {...strokeStyle} />
      {/* Eyes */}
      <circle cx="40" cy="45" r="3" fill="#1c1917" />
      <circle cx="60" cy="45" r="3" fill="#1c1917" />
      {/* Snout */}
      <ellipse cx="50" cy="58" rx="8" ry="6" {...strokeStyle} />
      <polygon points="47,56 53,56 50,60" fill="#1c1917" />
      {/* Smile */}
      <path d="M 46,61 Q 50,65 54,61" {...strokeStyle} />
      {/* Cheeks */}
      <circle cx="34" cy="53" r="2" fill="#d6d3d1" />
      <circle cx="66" cy="53" r="2" fill="#d6d3d1" />
    </svg>
  );
}

export function DrawOjo({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Eyelids */}
      <path d="M 15,50 Q 50,22 85,50" {...strokeStyle} />
      <path d="M 15,50 Q 50,78 85,50" {...strokeStyle} />
      {/* Iris */}
      <circle cx="50" cy="50" r="17" {...strokeStyle} />
      {/* Pupil */}
      <circle cx="50" cy="50" r="8" fill="#1c1917" />
      {/* Reflections */}
      <circle cx="46" cy="46" r="3" fill="#ffffff" />
      {/* Eyebrow */}
      <path d="M 22,25 Q 50,15 78,25" {...strokeStyle} />
      {/* Eyelashes */}
      <path d="M 30,34 L 26,28" {...strokeStyle} />
      <path d="M 50,32 L 50,24" {...strokeStyle} />
      <path d="M 70,34 L 74,28" {...strokeStyle} />
    </svg>
  );
}

export function DrawOla({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Wave shape */}
      <path
        d="M 10,75 C 30,75 40,65 50,50 C 60,35 70,25 82,30 C 90,34 92,45 88,52 C 84,58 76,60 70,55"
        {...strokeStyle}
      />
      <path d="M 82,30 Q 72,15 60,25" {...strokeStyle} />
      {/* Additional crests */}
      <path d="M 10,85 C 35,85 45,80 55,70 C 65,60 75,55 85,60" {...strokeStyle} />
      {/* Foam droplets */}
      <circle cx="52" cy="22" r="2" fill="#1c1917" />
      <circle cx="68" cy="18" r="2" fill="#1c1917" />
      <circle cx="80" cy="15" r="3.5" {...strokeStyle} />
      <circle cx="90" cy="28" r="1.5" fill="#1c1917" />
    </svg>
  );
}

export function DrawOlla({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Pot Body */}
      <path
        d="M 20,45 L 23,78 C 24,84 30,88 38,88 L 62,88 C 70,88 76,84 77,78 L 80,45 Z"
        {...strokeStyle}
      />
      {/* Rim */}
      <rect x="16" y="38" width="68" height="7" rx="3.5" {...strokeStyle} />
      {/* Left Handle */}
      <path d="M 16,50 Q 8,50 8,60 Q 8,70 18,70" {...strokeStyle} />
      {/* Right Handle */}
      <path d="M 84,50 Q 92,50 92,60 Q 92,70 82,70" {...strokeStyle} />
      {/* Lid */}
      <path d="M 22,38 C 26,26 74,26 78,38" {...strokeStyle} />
      {/* Lid Handle */}
      <rect x="42" y="20" width="16" height="7" rx="2" {...strokeStyle} />
      {/* Steam lines */}
      <path d="M 38,14 Q 40,8 44,14" {...strokeStyle} />
      <path d="M 58,14 Q 60,8 64,14" {...strokeStyle} />
    </svg>
  );
}

export function DrawArbol({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Trunk */}
      <path
        d="M 45,55 L 43,88 C 43,88 35,90 35,92 L 65,92 C 65,90 57,88 57,88 L 55,55"
        {...strokeStyle}
      />
      <path d="M 48,68 Q 50,75 52,82" {...strokeStyle} />
      {/* Leaves canopy */}
      <path
        d="M 50,15 C 38,15 30,22 30,32 C 20,32 15,42 20,52 C 25,60 35,58 40,55 C 45,62 55,62 60,55 C 65,58 75,60 80,52 C 85,42 80,32 70,32 C 70,22 62,15 50,15 Z"
        {...strokeStyle}
      />
      {/* Apple/Fruit outlines */}
      <circle cx="38" cy="34" r="3.5" {...strokeStyle} />
      <circle cx="62" cy="38" r="3.5" {...strokeStyle} />
      <circle cx="48" cy="46" r="3.5" {...strokeStyle} />
    </svg>
  );
}

export function DrawAvion({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Fuselage */}
      <path
        d="M 85,40 C 90,45 65,65 40,65 C 22,65 10,58 10,50 C 10,42 22,35 40,35 C 65,35 80,35 85,40 Z"
        {...strokeStyle}
      />
      {/* Tail Fin */}
      <path d="M 18,37 L 10,18 C 8,14 14,14 18,18 L 26,35" {...strokeStyle} />
      {/* Left Wing (Backwards view) */}
      <path d="M 48,35 L 35,12 C 32,8 38,8 45,12 L 60,35" {...strokeStyle} />
      {/* Right Wing */}
      <path d="M 45,65 L 30,88 C 28,92 34,92 40,88 L 57,65" {...strokeStyle} />
      {/* Window Cockpit */}
      <path d="M 70,38 Q 78,42 74,47 C 70,47 65,42 65,40" {...strokeStyle} />
      {/* Propeller nose */}
      <path d="M 84,39 Q 88,40 84,45" {...strokeStyle} />
      <path d="M 88,28 L 88,52" {...strokeStyle} />
      {/* Clouds */}
      <path d="M 75,75 Q 82,75 80,82 Q 90,82 85,88 L 65,88 Q 60,82 75,75" {...strokeStyle} />
    </svg>
  );
}

export function DrawAbeja({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Body */}
      <ellipse cx="46" cy="54" rx="20" ry="15" {...strokeStyle} />
      {/* Head */}
      <circle cx="70" cy="46" r="10" {...strokeStyle} />
      {/* Eyes */}
      <circle cx="72" cy="43" r="1.5" fill="#1c1917" />
      {/* Antennas */}
      <path d="M 72,36 Q 75,26 80,28" {...strokeStyle} />
      <circle cx="80" cy="28" r="1.5" fill="#1c1917" />
      {/* Stripes */}
      <path d="M 38,40 Q 42,54 38,68" {...strokeStyle} />
      <path d="M 48,39 Q 52,54 48,69" {...strokeStyle} />
      {/* Wings */}
      <ellipse cx="44" cy="30" rx="9" ry="14" transform="rotate(15 44 30)" {...strokeStyle} />
      <ellipse cx="32" cy="28" rx="8" ry="12" transform="rotate(-15 32 28)" {...strokeStyle} />
      {/* Stinger */}
      <path d="M 26,54 L 18,54 L 26,58 Z" fill="#1c1917" />
      {/* Smile */}
      <path d="M 74,48 Q 72,52 68,50" {...strokeStyle} />
    </svg>
  );
}

export function DrawAla({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Wing shape */}
      <path
        d="M 85,25 C 75,25 50,35 30,50 C 15,62 10,75 22,78 C 30,80 40,72 55,60 C 70,48 85,35 90,30 Z"
        {...strokeStyle}
      />
      {/* Feathers */}
      <path d="M 30,50 Q 25,62 32,64" {...strokeStyle} />
      <path d="M 42,42 Q 35,58 45,58" {...strokeStyle} />
      <path d="M 55,35 Q 48,50 58,48" {...strokeStyle} />
      {/* Internal feather details */}
      <path d="M 80,28 C 70,35 55,48 40,60" {...strokeStyle} />
      <path d="M 70,33 C 62,40 50,52 38,62" {...strokeStyle} />
    </svg>
  );
}

export function DrawElefante({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Body / Head outline */}
      <circle cx="50" cy="55" r="24" {...strokeStyle} />
      {/* Large Ears */}
      <path d="M 28,45 C 10,40 12,18 28,34 Z" {...strokeStyle} />
      <path d="M 72,45 C 90,40 88,18 72,34 Z" {...strokeStyle} />
      {/* Eyes */}
      <circle cx="42" cy="46" r="2.5" fill="#1c1917" />
      <circle cx="58" cy="46" r="2.5" fill="#1c1917" />
      {/* Trunk (raised happily) */}
      <path d="M 50,54 C 50,68 62,70 65,60 C 67,52 60,50 56,54" {...strokeStyle} />
      {/* Tusks */}
      <path d="M 44,55 Q 43,62 40,58" {...strokeStyle} />
      <path d="M 56,55 Q 57,62 60,58" {...strokeStyle} />
      {/* Smile cheeks */}
      <path d="M 38,52 Q 40,54 42,53" {...strokeStyle} />
      <path d="M 62,52 Q 60,54 58,53" {...strokeStyle} />
    </svg>
  );
}

export function DrawEscoba({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Handle */}
      <rect x="46" y="10" width="8" height="52" rx="2" {...strokeStyle} />
      {/* Brush Bristles */}
      <path d="M 32,85 L 36,62 L 64,62 L 68,85 C 60,89 40,89 32,85 Z" {...strokeStyle} />
      {/* String Tie */}
      <line x1="34" y1="68" x2="66" y2="68" {...strokeStyle} />
      <line x1="35" y1="74" x2="65" y2="74" {...strokeStyle} />
      {/* Bristle texture lines */}
      <line x1="42" y1="76" x2="40" y2="84" {...strokeStyle} />
      <line x1="50" y1="76" x2="50" y2="85" {...strokeStyle} />
      <line x1="58" y1="76" x2="60" y2="84" {...strokeStyle} />
    </svg>
  );
}

export function DrawEspejo({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Handle */}
      <rect x="46" y="65" width="8" height="28" rx="3" {...strokeStyle} />
      {/* Frame */}
      <circle cx="50" cy="38" r="26" {...strokeStyle} />
      {/* Inner Mirror Glass */}
      <circle cx="50" cy="38" r="21" {...strokeStyle} />
      {/* Reflection shines */}
      <path d="M 40,25 Q 55,20 60,35" {...strokeStyle} />
      <path d="M 36,36 Q 44,32 46,42" {...strokeStyle} />
    </svg>
  );
}

export function DrawEstrella({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Star outline */}
      <path
        d="M 50,10 L 62,35 L 90,38 L 68,57 L 74,85 L 50,70 L 26,85 L 32,57 L 10,38 L 38,35 Z"
        {...strokeStyle}
      />
      {/* Cute eyes */}
      <circle cx="43" cy="46" r="2" fill="#1c1917" />
      <circle cx="57" cy="46" r="2" fill="#1c1917" />
      {/* Smiling mouth */}
      <path d="M 47,53 Q 50,56 53,53" {...strokeStyle} />
      {/* Little sparkle dots around */}
      <circle cx="82" cy="22" r="1" fill="#1c1917" />
      <circle cx="18" cy="74" r="1.5" fill="#1c1917" />
    </svg>
  );
}

export function DrawIglu({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Base floor line */}
      <line x1="12" y1="84" x2="88" y2="84" {...strokeStyle} />
      {/* Dome */}
      <path d="M 18,84 A 32,32 0 0,1 82,84" {...strokeStyle} />
      {/* Ice blocks arches */}
      <path d="M 28,84 A 22,22 0 0,1 72,84" {...strokeStyle} />
      <path d="M 38,84 A 12,12 0 0,1 62,84" {...strokeStyle} />
      {/* Vertical block seams */}
      <line x1="50" y1="20" x2="50" y2="52" {...strokeStyle} />
      <line x1="33" y1="36" x2="38" y2="62" {...strokeStyle} />
      <line x1="67" y1="36" x2="62" y2="62" {...strokeStyle} />
      {/* Arch doorway */}
      <path d="M 40,84 L 40,68 C 40,62 60,62 60,68 L 60,84 Z" fill="#ffffff" {...baseStrokeStyle} />
      <path d="M 45,84 L 45,74 C 45,71 55,71 55,74 L 55,84" {...strokeStyle} />
    </svg>
  );
}

export function DrawIsla({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Sea / horizon */}
      <path d="M 10,80 Q 50,84 90,80" {...strokeStyle} />
      {/* Sandy mound */}
      <path d="M 25,80 C 25,65 75,65 75,80 Z" fill="#ffffff" {...baseStrokeStyle} />
      {/* Palm Tree trunk */}
      <path d="M 48,70 Q 42,50 48,34" {...strokeStyle} />
      <path d="M 52,70 Q 46,50 52,34" {...strokeStyle} />
      {/* Trunk rings */}
      <line x1="44" y1="60" x2="50" y2="59" {...strokeStyle} />
      <line x1="45" y1="48" x2="51" y2="47" {...strokeStyle} />
      {/* Palm leaves */}
      <path d="M 50,34 Q 30,34 24,44" {...strokeStyle} />
      <path d="M 50,34 Q 40,22 32,18" {...strokeStyle} />
      <path d="M 50,34 Q 60,20 68,18" {...strokeStyle} />
      <path d="M 50,34 Q 70,30 78,42" {...strokeStyle} />
      <path d="M 50,34 Q 58,46 54,54" {...strokeStyle} />
      {/* Coconuts */}
      <circle cx="46" cy="38" r="3.5" {...strokeStyle} />
      <circle cx="53" cy="37" r="3.5" {...strokeStyle} />
    </svg>
  );
}

export function DrawIguana({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Body curve */}
      <path d="M 15,62 C 25,50 65,48 78,60" {...strokeStyle} />
      {/* Tail curly */}
      <path d="M 78,60 C 88,68 92,52 86,46 C 80,40 76,46 80,50" {...strokeStyle} />
      {/* Head */}
      <path d="M 22,60 C 15,55 12,42 22,40 C 30,38 35,48 30,56 Z" {...strokeStyle} />
      {/* Spines along back */}
      <path
        d="M 36,49 L 38,44 L 42,49 L 45,43 L 49,48 L 52,43 L 56,48 L 59,44 L 63,49"
        {...strokeStyle}
      />
      {/* Legs */}
      <path d="M 28,61 Q 25,75 22,74" {...strokeStyle} />
      <path d="M 64,59 Q 68,75 72,74" {...strokeStyle} />
      {/* Eye */}
      <circle cx="20" cy="46" r="1.5" fill="#1c1917" />
      {/* Dewlap (throat fan) */}
      <path d="M 22,54 Q 24,64 28,58" {...strokeStyle} />
    </svg>
  );
}

export function DrawIman({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Horseshoe magnet */}
      <path
        d="M 30,25 L 30,55 C 30,72 70,72 70,55 L 70,25 L 56,25 L 56,53 C 56,60 44,60 44,53 L 44,25 Z"
        fill="#ffffff"
        {...baseStrokeStyle}
      />
      {/* Polar ends markings (North / South lines) */}
      <line x1="30" y1="36" x2="44" y2="36" {...strokeStyle} />
      <line x1="56" y1="36" x2="70" y2="36" {...strokeStyle} />
      <text x="33" y="32" fontSize="9" fontWeight="bold" fill="#1c1917">
        N
      </text>
      <text x="60" y="32" fontSize="9" fontWeight="bold" fill="#1c1917">
        S
      </text>
      {/* Magnetic sparks */}
      <path d="M 25,18 L 30,12 L 35,18" {...strokeStyle} />
      <path d="M 65,18 L 70,12 L 75,18" {...strokeStyle} />
    </svg>
  );
}

export function DrawUvas({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Grape Stem */}
      <path d="M 50,14 Q 52,24 50,28" {...strokeStyle} />
      {/* Leaf */}
      <path d="M 50,22 C 38,16 35,32 46,30 Z" {...strokeStyle} />
      {/* Bunch of grapes circles */}
      {/* Row 1 */}
      <circle cx="40" cy="38" r="9" fill="#ffffff" {...baseStrokeStyle} />
      <circle cx="60" cy="38" r="9" fill="#ffffff" {...baseStrokeStyle} />
      <circle cx="50" cy="34" r="9" fill="#ffffff" {...baseStrokeStyle} />
      {/* Row 2 */}
      <circle cx="32" cy="52" r="9" fill="#ffffff" {...baseStrokeStyle} />
      <circle cx="68" cy="52" r="9" fill="#ffffff" {...baseStrokeStyle} />
      <circle cx="50" cy="50" r="9" fill="#ffffff" {...baseStrokeStyle} />
      {/* Row 3 */}
      <circle cx="41" cy="66" r="9" fill="#ffffff" {...baseStrokeStyle} />
      <circle cx="59" cy="66" r="9" fill="#ffffff" {...baseStrokeStyle} />
      {/* Bottom single grape */}
      <circle cx="50" cy="80" r="9" fill="#ffffff" {...baseStrokeStyle} />
    </svg>
  );
}

export function DrawUna({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Finger outline */}
      <path d="M 36,90 L 36,44 C 36,28 64,28 64,44 L 64,90" {...strokeStyle} />
      {/* Nail outline */}
      <path
        d="M 40,48 C 40,36 60,36 60,48 L 60,70 C 60,74 58,76 50,76 C 42,76 40,74 40,70 Z"
        {...strokeStyle}
      />
      {/* Cuticle line */}
      <path d="M 40,70 Q 50,73 60,70" {...strokeStyle} />
      {/* Shine highlights */}
      <path d="M 44,46 L 44,60" {...strokeStyle} />
    </svg>
  );
}

export function DrawUno({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Number 1 block */}
      <path
        d="M 36,28 L 54,16 L 54,80 L 64,80 L 64,88 L 36,88 L 36,80 L 46,80 L 46,28 Z"
        fill="#ffffff"
        {...baseStrokeStyle}
      />
    </svg>
  );
}

export function DrawUrna({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Urn Amphora body */}
      <path
        d="M 50,18 C 30,18 20,40 20,58 C 20,74 35,88 50,88 C 65,88 80,74 80,58 C 80,40 70,18 50,18 Z"
        fill="#ffffff"
        {...baseStrokeStyle}
      />
      {/* Neck / Rim */}
      <rect x="36" y="10" width="28" height="8" rx="2" {...strokeStyle} />
      {/* Left Handle */}
      <path d="M 22,34 Q 10,38 20,52" {...strokeStyle} />
      {/* Right Handle */}
      <path d="M 78,34 Q 90,38 80,52" {...strokeStyle} />
      {/* Base */}
      <path d="M 40,88 Q 50,94 60,88 Z" {...strokeStyle} />
      {/* Decorative patterns */}
      <path d="M 22,54 Q 50,60 78,54" {...strokeStyle} />
      <path d="M 24,62 Q 50,68 76,62" {...strokeStyle} />
    </svg>
  );
}

export function DrawMama({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Hair Bun */}
      <circle cx="50" cy="22" r="10" {...strokeStyle} />
      {/* Face profile */}
      <circle cx="50" cy="46" r="20" {...strokeStyle} />
      {/* Hair front */}
      <path d="M 32,40 C 35,28 65,28 68,40" {...strokeStyle} />
      {/* Eyes */}
      <path d="M 42,44 Q 44,42 46,44" {...strokeStyle} />
      <path d="M 54,44 Q 56,42 58,44" {...strokeStyle} />
      {/* Eyelashes */}
      <path d="M 43,43 L 41,41" {...strokeStyle} />
      <path d="M 57,43 L 59,41" {...strokeStyle} />
      {/* Smile */}
      <path d="M 44,54 Q 50,60 56,54" {...strokeStyle} />
      {/* Neck */}
      <path
        d="M 44,65 L 44,82 C 44,82 30,86 28,88 L 72,88 C 70,86 56,82 56,82 L 56,65"
        {...strokeStyle}
      />
    </svg>
  );
}

export function DrawMesa({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Table top perspective */}
      <polygon points="12,42 88,42 76,24 24,24" fill="#ffffff" {...baseStrokeStyle} />
      <rect x="12" y="42" width="76" height="6" rx="2" fill="#ffffff" {...baseStrokeStyle} />
      {/* Front Left Leg */}
      <rect x="18" y="48" width="6" height="38" rx="1.5" {...strokeStyle} />
      {/* Front Right Leg */}
      <rect x="76" y="48" width="6" height="38" rx="1.5" {...strokeStyle} />
      {/* Back Left Leg */}
      <rect x="28" y="42" width="4" height="28" rx="1" {...strokeStyle} />
      {/* Back Right Leg */}
      <rect x="68" y="42" width="4" height="28" rx="1" {...strokeStyle} />
    </svg>
  );
}

export function DrawMimo({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Head */}
      <circle cx="50" cy="38" r="18" {...strokeStyle} />
      {/* Face makeup markings (classic mime crosses/tears) */}
      <path d="M 42,28 L 42,34" {...strokeStyle} />
      <path d="M 58,28 L 58,34" {...strokeStyle} />
      <circle cx="42" cy="38" r="1.5" fill="#1c1917" />
      <circle cx="58" cy="38" r="1.5" fill="#1c1917" />
      {/* Happy smile */}
      <path d="M 44,46 Q 50,52 56,46" {...strokeStyle} />
      {/* Striped shirt torso */}
      <path
        d="M 32,56 C 32,56 22,64 16,74 L 24,78 L 32,68 L 32,90 L 68,90 L 68,68 L 76,78 L 84,74 C 78,64 68,56 68,56 Z"
        fill="#ffffff"
        {...baseStrokeStyle}
      />
      {/* Shirt Stripes */}
      <line x1="32" y1="64" x2="68" y2="64" {...strokeStyle} />
      <line x1="32" y1="74" x2="68" y2="74" {...strokeStyle} />
      <line x1="32" y1="84" x2="68" y2="84" {...strokeStyle} />
    </svg>
  );
}

export function DrawMono({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Monkey Head */}
      <circle cx="50" cy="50" r="24" {...strokeStyle} />
      {/* Big Ears */}
      <circle cx="23" cy="46" r="10" {...strokeStyle} />
      <circle cx="23" cy="46" r="5" {...strokeStyle} />
      <circle cx="77" cy="46" r="10" {...strokeStyle} />
      <circle cx="77" cy="46" r="5" {...strokeStyle} />
      {/* Inner face shape (heart/banana outline) */}
      <path
        d="M 50,38 C 42,32 30,38 34,54 C 38,68 62,68 66,54 C 70,38 58,32 50,38 Z"
        fill="#ffffff"
        {...baseStrokeStyle}
      />
      {/* Eyes */}
      <circle cx="43" cy="44" r="2.5" fill="#1c1917" />
      <circle cx="57" cy="44" r="2.5" fill="#1c1917" />
      {/* Snout/Nose */}
      <path d="M 48,53 Q 50,50 52,53" {...strokeStyle} />
      {/* Wide grin */}
      <path d="M 40,58 Q 50,66 60,58" {...strokeStyle} />
    </svg>
  );
}

export function DrawMulo({ size = 120, ...props }: DrawingProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Mule Head */}
      <path d="M 38,76 L 34,44 C 34,36 66,36 66,44 L 62,76 Z" {...strokeStyle} />
      {/* Long Donkey Ears */}
      <path d="M 38,36 C 30,12 36,8 44,28 Z" {...strokeStyle} />
      <path d="M 62,36 C 70,12 64,8 56,28 Z" {...strokeStyle} />
      {/* Eyes */}
      <circle cx="43" cy="46" r="2.5" fill="#1c1917" />
      <circle cx="57" cy="46" r="2.5" fill="#1c1917" />
      {/* Snout outline */}
      <path d="M 36,64 Q 50,60 64,64" {...strokeStyle} />
      <circle cx="45" cy="70" r="1.5" fill="#1c1917" />
      <circle cx="55" cy="70" r="1.5" fill="#1c1917" />
      {/* Smile */}
      <path d="M 46,74 Q 50,77 54,74" {...strokeStyle} />
    </svg>
  );
}

// A generic fall-back outline generator that creates a beautiful, stylized vector seal with the word's first letter
export function DrawFallback({ word, size = 120, ...props }: DrawingProps & { word: string }) {
  const initial = word ? word.trim().charAt(0).toUpperCase() : "?";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...props}>
      {/* Decorative seal outline */}
      <circle cx="50" cy="50" r="38" {...strokeStyle} />
      <circle cx="50" cy="50" r="32" {...guideStrokeStyle} />
      {/* Star symbols on left and right */}
      <path d="M 22,50 L 24,47 L 27,50 L 24,53 Z" fill="#1c1917" />
      <path d="M 78,50 L 76,47 L 73,50 L 76,53 Z" fill="#1c1917" />
      {/* Big Initial letter */}
      <text
        x="50"
        y="60"
        fontSize="34"
        fontFamily="Fredoka, Inter, sans-serif"
        fontWeight="900"
        fill="#1c1917"
        textAnchor="middle"
      >
        {initial}
      </text>
    </svg>
  );
}

const DRAWING_REGISTRY: Record<string, React.ComponentType<DrawingProps>> = {
  // O oso
  oso: DrawOso,
  ojo: DrawOjo,
  ola: DrawOla,
  olla: DrawOlla,
  // A árbol
  árbol: DrawArbol,
  avión: DrawAvion,
  abeja: DrawAbeja,
  ala: DrawAla,
  // E elefante
  elefante: DrawElefante,
  escoba: DrawEscoba,
  espejo: DrawEspejo,
  estrella: DrawEstrella,
  // I iglú
  iglú: DrawIglu,
  isla: DrawIsla,
  iguana: DrawIguana,
  imán: DrawIman,
  // U uvas
  uvas: DrawUvas,
  uña: DrawUna,
  uno: DrawUno,
  urna: DrawUrna,
  // M consonant
  mamá: DrawMama,
  mesa: DrawMesa,
  mimo: DrawMimo,
  mono: DrawMono,
  mulo: DrawMulo,
};

interface MonochromeDrawingProps extends DrawingProps {
  word: string;
}

export function MonochromeDrawing({ word, size = 120, ...props }: MonochromeDrawingProps) {
  const normalized = word.trim().toLowerCase();
  const Component = DRAWING_REGISTRY[normalized];

  if (Component) {
    return <Component size={size} {...props} />;
  }

  return <DrawFallback word={word} size={size} {...props} />;
}
