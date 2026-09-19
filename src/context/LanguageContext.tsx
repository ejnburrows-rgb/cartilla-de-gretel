import { createContext, useContext, useEffect, useState } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readSavedLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("cartilla_lang");
    return saved === "es" || saved === "en" ? saved : null;
  } catch {
    return null;
  }
}

function saveLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("cartilla_lang", lang);
  } catch {
    // Storage can be unavailable in privacy-restricted or embedded browsers.
    // Language switching should still work for the current session.
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    const saved = readSavedLanguage();
    if (saved) setLangState(saved);
  }, []);

  const setLang = (newLang: Language) => {
    saveLanguage(newLang);
    setLangState(newLang);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
