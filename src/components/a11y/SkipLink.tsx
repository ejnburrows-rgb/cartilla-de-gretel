import React from "react";
import "@/styles/a11y.css";

export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link no-print" aria-label="Saltar al contenido principal">
      Saltar al contenido principal
    </a>
  );
}
export type SkipLink = typeof SkipLink;
