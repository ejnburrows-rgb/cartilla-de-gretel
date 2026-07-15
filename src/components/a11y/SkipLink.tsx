import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import "@/styles/a11y.css";

export function SkipLink() {
  const { lang } = useLanguage();

  const label = lang === "es" ? "Saltar al contenido principal" : "Skip to main content";

  return (
    <a href="#main-content" className="skip-link no-print" aria-label={label}>
      {label}
    </a>
  );
}
export type SkipLink = typeof SkipLink;
