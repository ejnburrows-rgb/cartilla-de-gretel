import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import React from "react";
import "../../styles/art.css";

export type GretelPoseKind = "idle" | "happy" | "cheer" | "thinking" | "encouraging";

interface GretelProps {
  pose: GretelPoseKind;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function Gretel({ pose, size, className }: GretelProps) {
  return <img src={GRETEL_APPROVED_MASTER_SRC} alt="Gretel" data-pose={pose}
    className={className} style={size ? { width: size, height: (size * 1450) / 1061, objectFit: "contain" } : { objectFit: "contain" }} />;
}
