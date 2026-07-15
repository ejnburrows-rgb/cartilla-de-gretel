import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { HelpCircle } from "lucide-react";

export function HelpSection() {
  const { lang } = useLanguage();

  return (
    <section className="mt-6 kid-card p-4 sm:p-6 bg-secondary/30">
      <div className="flex items-center gap-2 text-primary mb-4">
        <HelpCircle className="w-5 h-5" />
        <h2 className="font-bold text-lg">{t("helpTitle", lang)}</h2>
      </div>

      <ul className="space-y-3 text-sm text-foreground/80">
        <li className="flex gap-2">
          <span className="font-bold text-primary mt-0.5">•</span>
          <span>{t("helpCreateClass", lang)}</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-primary mt-0.5">•</span>
          <span>{t("helpShareCode", lang)}</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-primary mt-0.5">•</span>
          <span>{t("helpProgress", lang)}</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-primary mt-0.5">•</span>
          <span>{t("helpLanguage", lang)}</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-primary mt-0.5">•</span>
          <span>{t("helpTheme", lang)}</span>
        </li>
      </ul>
    </section>
  );
}
