import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-full p-1 text-xs font-bold shrink-0">
      <button
        onClick={() => setLang("es")}
        className={`px-2 py-1 rounded-full transition-colors ${
          lang === "es"
            ? "bg-background shadow-sm text-foreground"
            : "text-foreground/50 hover:text-foreground"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded-full transition-colors ${
          lang === "en"
            ? "bg-background shadow-sm text-foreground"
            : "text-foreground/50 hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
