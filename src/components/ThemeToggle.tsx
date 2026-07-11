import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { Sun, Moon } from "lucide-react";

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
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    )
      return "dark";
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
      className="p-2 rounded-full border border-border bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center tap-target shadow-sm"
    >
      {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-[hsl(var(--primary))]" />}
    </button>
  );
}
