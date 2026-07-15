import React from "react";

interface GretelStageProps {
  size?: "sm" | "md" | "lg";
  warmth?: boolean;
  basePoseSrc?: string;
  blinkOverlaySrc?: string;
  showBlink?: boolean;
  children?: React.ReactNode;
}

const warmFilter = { filter: "sepia(15%) brightness(1.03)" };

export function GretelStage({
  size = "md",
  warmth = true,
  basePoseSrc,
  blinkOverlaySrc,
  showBlink = false,
  children,
}: GretelStageProps) {
  const sizeClasses = {
    sm: "max-h-[100px] max-w-[100px]",
    md: "max-h-[220px] max-w-[220px]",
    lg: "max-h-[320px] max-w-[320px]",
  };

  return null;
}
