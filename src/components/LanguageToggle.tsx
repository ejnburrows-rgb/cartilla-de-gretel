import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <button
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        className="p-2 rounded-full border border-border bg-background hover:bg-muted text-foreground transition-colors font-bold text-sm tap-target shadow-sm w-10 h-10 flex items-center justify-center shrink-0"
        title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
      >
        {lang === "es" ? "ES" : "EN"}
      </button>
    </div>
  );
}

