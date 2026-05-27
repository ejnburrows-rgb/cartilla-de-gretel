import React from "react";
import { useTheme } from "@/hooks/useTheme";
import type { Theme, Language } from "@/components/theme/ThemeProvider";
import { Sun, Moon, Eye, Type, Globe } from "lucide-react";

// Hoisted Styles for double-brace JSX styling ban compliance
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  padding: "1.25rem",
  borderRadius: "1.25rem",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "2px solid var(--border-color)",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.03)",
  maxWidth: "360px",
  width: "100%",
  boxSizing: "border-box",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "var(--muted-color)",
  letterSpacing: "0.05em",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.6rem",
};

const optionBtnStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.65rem 0.85rem",
  borderRadius: "0.85rem",
  border: `2px solid ${active ? "var(--primary-color)" : "var(--border-color)"}`,
  backgroundColor: active ? "var(--accent-glow)" : "transparent",
  color: active ? "var(--primary-color)" : "var(--text-color)",
  fontWeight: "bold",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "all 0.15s ease",
  outline: "none",
});

const langContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderTop: "1px dashed var(--border-color)",
  paddingTop: "1rem",
  marginTop: "0.25rem",
};

export function ThemeSwitcher() {
  const { theme, setTheme, lang, setLang } = useTheme();

  const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Claro", icon: <Sun className="w-4 h-4" /> },
    { id: "dark", label: "Oscuro", icon: <Moon className="w-4 h-4" /> },
    { id: "high-contrast", label: "Contraste", icon: <Eye className="w-4 h-4" /> },
    { id: "dyslexia-friendly", label: "Dislexia", icon: <Type className="w-4 h-4" /> },
  ];

  return (
    <div style={containerStyle} className="theme-switcher-box">
      <div>
        <h4 style={sectionTitleStyle}>
          <span>Tema Visual</span>
        </h4>
        <div style={{ height: "0.65rem" }} />
        <div style={gridStyle}>
          {themes.map((t) => {
            const isActive = theme === t.id;
            const btnStyle = optionBtnStyle(isActive);
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={btnStyle}
                className="hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={langContainerStyle}>
        <div style={sectionTitleStyle}>
          <Globe className="w-4 h-4" />
          <span>Idioma / Language</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setLang("es")}
            style={optionBtnStyle(lang === "es")}
            className="px-3 py-1 rounded-lg text-xs"
          >
            ES
          </button>
          <button
            onClick={() => setLang("en")}
            style={optionBtnStyle(lang === "en")}
            className="px-3 py-1 rounded-lg text-xs"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}
export type ThemeSwitcher = typeof ThemeSwitcher;
