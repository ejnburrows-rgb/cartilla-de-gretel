import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

export type Theme = "light" | "dark";

const KEY = "reader.theme";

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storage.get<Theme | null>(KEY, null);
    if (saved) return saved;
    return "light";
  });

  useEffect(() => {
    apply(theme);
    storage.set(KEY, theme);
  }, [theme]);

  return { theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
