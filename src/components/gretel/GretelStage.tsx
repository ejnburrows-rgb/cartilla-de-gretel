import React from "react";

interface GretelStageProps {
  size?: "sm" | "md" | "lg";
  warmth?: boolean;
  children: React.ReactNode;
}

const warmFilter = { filter: "sepia(0.08) saturate(1.1) brightness(1.02)" };

export function GretelStage({ size = "md", warmth = true, children }: GretelStageProps) {
  const sizeClasses = {
    sm: "max-h-[100px]",
    md: "max-h-[220px]",
    lg: "max-h-[320px]",
  };

  return (
    <div className={`gretel-stage ${sizeClasses[size]}`} data-size={size}>
      <div className="gretel-shadow-contact" />
      <div className="gretel-shadow-ambient" />
      <div className="gretel-figure" style={warmth ? warmFilter : undefined}>
        {children}
      </div>
    </div>
  );
}
