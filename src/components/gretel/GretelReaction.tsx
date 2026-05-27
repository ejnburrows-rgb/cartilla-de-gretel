import React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function GretelReaction() {
  const isReduced = useReducedMotion();

  if (isReduced) return null;

  // Render 12 beautiful exploding sparkles in random directions
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 360) / 12;
    const distance = 50 + Math.random() * 35; // explode radius
    const dx = `${Math.cos((angle * Math.PI) / 180) * distance}px`;
    const dy = `${Math.sin((angle * Math.PI) / 180) * distance}px`;

    const particleStyle = {
      "--dx": dx,
      "--dy": dy,
      left: "50%",
      top: "50%",
    } as React.CSSProperties;

    return (
      <div
        key={i}
        style={particleStyle}
        className={`sparkle-particle sparkle-${(i % 6) + 1}`}
      />
    );
  });

  return <div className="gretel-sparkles">{sparkles}</div>;
}
export type GretelReaction = typeof GretelReaction;
