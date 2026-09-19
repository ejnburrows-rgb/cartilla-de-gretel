import React, { useEffect, useState, useRef } from "react";

interface ConfettiParticle {
  id: number;
  color: string;
  left: number;
  top: number;
  dx: number;
  dy: number;
  delayMs: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#8b5cf6", // Purple
];

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onComplete?.();
      return;
    }

    // Generate exactly 24 particles
    const newParticles: ConfettiParticle[] = Array.from({ length: 24 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      return {
        id: nextId.current++,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: 50,
        top: 40,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance + 50,
        delayMs: Math.random() * 200,
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="feel-confetti-container">
      {particles.map((p) => {
        const style = {
          left: `${p.left}%`,
          top: `${p.top}%`,
          backgroundColor: p.color,
          "--dx": `${p.dx}px`,
          "--dy": `${p.dy}px`,
          animationDelay: `${p.delayMs}ms`,
        } as React.CSSProperties;

        return <div key={p.id} className="feel-confetti-particle" style={style} />;
      })}
    </div>
  );
}

export default Confetti;
