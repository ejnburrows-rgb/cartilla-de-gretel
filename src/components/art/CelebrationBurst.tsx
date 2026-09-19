import React from "react";

/* ------------------------------------------------------------------ */
/*  CelebrationBurst – expanding ring of colourful shapes              */
/* ------------------------------------------------------------------ */

interface CelebrationBurstProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

/* Particle specs around the centre (150,150) */
const PARTICLE_COUNT = 12;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i * 360) / PARTICLE_COUNT;
  const rad = (angle * Math.PI) / 180;
  const dist = 110;
  return {
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    shape: i % 3, // 0=star, 1=circle, 2=diamond
    angle,
  };
});

const BURST_COLORS = [
  "#ffd43b",
  "#40c057",
  "#228be6",
  "#e64980",
  "#f59f00",
  "#7950f2",
  "#ff6b6b",
  "#20c997",
  "#fab005",
  "#4c6ef5",
  "#f06595",
  "#12b886",
] as const;

/* Mini shape renderers */
function starPath(cx: number, cy: number) {
  return `M${cx} ${cy - 6} L${cx + 2} ${cy - 1} L${cx + 7} ${cy - 1} L${cx + 3} ${cy + 2} L${cx + 5} ${cy + 7} L${cx} ${cy + 4} L${cx - 5} ${cy + 7} L${cx - 3} ${cy + 2} L${cx - 7} ${cy - 1} L${cx - 2} ${cy - 1} Z`;
}

function diamondPath(cx: number, cy: number) {
  return `M${cx} ${cy - 5} L${cx + 3} ${cy} L${cx} ${cy + 5} L${cx - 3} ${cy} Z`;
}

export function CelebrationBurst({ active = false, className, ...rest }: CelebrationBurstProps) {
  const baseClass = [
    "art-celebration-burst",
    active ? "art-celebration-burst--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!active) return null;

  return (
    <svg
      viewBox="0 0 300 300"
      preserveAspectRatio="xMidYMid meet"
      className={baseClass}
      aria-hidden="true"
      {...rest}
    >
      {PARTICLES.map((p, i) => {
        const particleStyle: React.CSSProperties = {
          "--burst-tx": `${p.tx}px`,
          "--burst-ty": `${p.ty}px`,
        } as React.CSSProperties;

        const color = BURST_COLORS[i % BURST_COLORS.length];

        return (
          <g key={i} className="art-burst-particle" style={particleStyle}>
            {p.shape === 0 && <path d={starPath(150, 150)} fill={color} />}
            {p.shape === 1 && <circle cx={150} cy={150} r={5} fill={color} />}
            {p.shape === 2 && <path d={diamondPath(150, 150)} fill={color} />}
          </g>
        );
      })}
    </svg>
  );
}
