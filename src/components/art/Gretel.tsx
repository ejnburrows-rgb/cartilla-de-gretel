import React from "react";
import { GretelIdle } from "./svg/gretel-idle";
import { GretelHappy } from "./svg/gretel-happy";
import { GretelCheer } from "./svg/gretel-cheer";
import { GretelThinking } from "./svg/gretel-thinking";
import { GretelEncouraging } from "./svg/gretel-encouraging";
import "../../styles/art.css";

export type GretelPoseKind = "idle" | "happy" | "cheer" | "thinking" | "encouraging";

interface GretelProps {
  pose: GretelPoseKind;
  size?: number;
  className?: string;
  animated?: boolean;
}

type GretelComponent = React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}>;

const GRETEL_MAP: Record<GretelPoseKind, GretelComponent> = {
  idle: GretelIdle,
  happy: GretelHappy,
  cheer: GretelCheer,
  thinking: GretelThinking,
  encouraging: GretelEncouraging,
};

export function Gretel({
  pose,
  size,
  className,
  animated = false,
}: GretelProps) {
  const Component = GRETEL_MAP[pose];

  if (!Component) {
    return null;
  }

  // Calculate style dimensions if size is provided
  const style = size ? { width: size, height: (size * 3) / 2 } : undefined;

  return <Component className={className} animated={animated} style={style} />;
}
