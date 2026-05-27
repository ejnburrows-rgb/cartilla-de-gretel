import React from "react";
import { useTheme } from "@/hooks/useTheme";

export function SkipLink() {
  const { lang } = useTheme();

  const label = lang === "es" 
    ? "Saltar al contenido principal" 
    : "Skip to main content";

  return (
    <a
      href="#main-content"
      className="skip-link no-print"
      aria-label={label}
    >
      {label}
    </a>
  );
}
export type SkipLink = typeof SkipLink;
