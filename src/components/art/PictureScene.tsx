import React from "react";
import { PICTURE_REGISTRY } from "./svg/index";

/* ------------------------------------------------------------------ */
/*  PictureScene – resolve a picture key to its SVG component          */
/* ------------------------------------------------------------------ */

interface PictureSceneProps {
  /** Picture registry key, e.g. "o-oso", "v-vaca" */
  k: string;
  /** Max width / height in pixels (square) */
  size?: number;
  className?: string;
  animated?: boolean;
}

const fallbackStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  maxWidth: 240,
  aspectRatio: "6 / 5",
  borderRadius: 12,
  backgroundColor: "var(--art-bg, #fdfcfa)",
  border: "2px dashed var(--art-accent, #d4a76a)",
  color: "var(--art-primary, #c98c4f)",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: 14,
};

export function PictureScene({
  k,
  size,
  className,
  animated = false,
}: PictureSceneProps) {
  const Component = PICTURE_REGISTRY[k];

  const baseClass = ["art-picture-scene", className].filter(Boolean).join(" ");

  const sizeStyle: React.CSSProperties | undefined = size
    ? { width: size, height: "auto", maxWidth: "100%" }
    : undefined;

  if (!Component) {
    return (
      <div style={fallbackStyle} className={baseClass} role="img" aria-label={k}>
        <span>{k}</span>
      </div>
    );
  }

  return (
    <Component
      className={baseClass}
      style={sizeStyle}
      animated={animated}
    />
  );
}
