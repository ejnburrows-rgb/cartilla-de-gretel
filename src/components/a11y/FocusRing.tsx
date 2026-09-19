import React from "react";
import "@/styles/a11y.css";

interface FocusRingProps {
  children: React.ReactNode;
}

export function FocusRing({ children }: FocusRingProps) {
  // Acts as a styling context wrapper that imports and ensures focus styling is active
  return <>{children}</>;
}
export type FocusRing = typeof FocusRing;
