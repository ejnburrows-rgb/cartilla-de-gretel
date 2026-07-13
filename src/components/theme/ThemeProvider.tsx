import React, { createContext, useState, useEffect } from "react";

export type Theme = "light" | "dark" | "high-contrast" | "dyslexia-friendly";
export type Language = "es" | "en";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("cartilla.theme.v1") as Theme) || "light";
  });

  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    return (localStorage.getItem("cartilla.lang.v1") as Language) || "es";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("cartilla.theme.v1", t);
  };

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("cartilla.lang.v1", l);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // Clear all previous theme classes
    root.classList.remove("theme-light", "theme-dark", "theme-high-contrast", "theme-dyslexia", "dark");
    
    if (theme === "light") {
      root.classList.add("theme-light");
    } else if (theme === "dark") {
      // theme-dark drives CSS custom properties; also set Tailwind's `dark`
      // class so dark: utilities (student workbook / flipbook chrome) apply.
      root.classList.add("theme-dark", "dark");
    } else if (theme === "high-contrast") {
      root.classList.add("theme-high-contrast", "dark");
    } else if (theme === "dyslexia-friendly") {
      root.classList.add("theme-dyslexia");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}
