import React, { useEffect, useState, useRef } from "react";
import { feelBus } from "../../lib/feel-bus";

interface SuccessPulseProps {
  children: React.ReactNode;
  active: boolean;
  onComplete?: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  scale: number;
}

export function SuccessPulse({ children, active, onComplete }: SuccessPulseProps) {
  const [pulseActive, setPulseActive] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) return;

    setPulseActive(true);
    feelBus.emit("success");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      const newSparkles: Sparkle[] = Array.from({ length: 8 }).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 40;
        return {
          id: nextId.current++,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          scale: 0.5 + Math.random() * 0.7,
        };
      });
      setSparkles(newSparkles);
    }

    const timer = setTimeout(() => {
      setPulseActive(false);
      setSparkles([]);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <div className="relative inline-block">
      {children}
      {pulseActive && <div className="feel-success-pulse" />}
      {sparkles.map((sp) => {
        const style = {
          left: `calc(50% + ${sp.x}px - 6px)`,
          top: `calc(50% + ${sp.y}px - 6px)`,
          transform: `scale(${sp.scale})`,
        };
        return <div key={sp.id} className="feel-sparkle-particle" style={style} />;
      })}
    </div>
  );
}

export default SuccessPulse;
