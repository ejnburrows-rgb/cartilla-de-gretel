import React from "react";
import { Gretel, GretelPoseKind } from "./Gretel";

interface GretelPoseProps {
  pose: GretelPoseKind;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function GretelPose({ pose, size, className, animated = false }: GretelPoseProps) {
  return (
    <div className="gretel-pose-container">
      <Gretel pose={pose} size={size} className={className} animated={animated} />
    </div>
  );
}
