import type { CSSProperties } from "react";
import type { CatalogEntry } from "@/types/cartilla";
import { getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { DragBuildWord } from "./DragBuildWord";

interface BookPageProps {
  entry: CatalogEntry;
}

function sectionLabel(kind: CatalogEntry["kind"]): string {
  switch (kind) {
    case "intro":
      return "Las hermanitas vocales";
    case "vowel":
      return "Vocal";
    case "consonant":
      return "Consonante";
  }
}

function pageStyle(entry: CatalogEntry): CSSProperties {
  const theme = getCartillaCrmTheme(entry.n);
  return {
    background: `radial-gradient(circle at 16% 12%, ${theme.accentSoft}, transparent 22rem), linear-gradient(135deg, #fffdf4 0%, ${theme.pagePaper} 58%, ${theme.accentSoft} 100%)`,
    color: theme.titleInk,
    borderColor: theme.border,
  };
}

function glowStyle(accent: string): CSSProperties {
  return { background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` };
}

export function BookPage({ entry }: BookPageProps) {
  const theme = getCartillaCrmTheme(entry.n);
  const accent = theme.accent;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[1.6rem] border shadow-[0_18px_46px_rgba(50,30,10,0.10),4px_7px_0_-2px_#fffcf8,8px_12px_0_-4px_#faf7ef]"
      style={pageStyle(entry)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,245,0.72),transparent_24%),radial-gradient(circle_at_80%_85%,rgba(255,255,245,0.58),transparent_28%)]" />
      <div className="pointer-events-none absolute bottom-0 left-5 top-0 w-px bg-red-400/20 sm:left-9" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-35" style={glowStyle(accent)} />

      <div className="relative flex h-full flex-col px-7 py-7 sm:px-10 sm:py-9">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-65 sm:text-xs">
          Leccion {entry.n} · {sectionLabel(entry.kind)}
        </div>
        <h1 className="mt-1 text-4xl font-black leading-none sm:text-6xl" style={{ color: accent }}>
          {entry.title}
        </h1>
        {entry.pages ? <p className="mt-1 text-xs font-bold opacity-65 sm:text-sm">Paginas {entry.pages}</p> : null}

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <DragBuildWord entry={entry} accent={accent} />
        </div>

        <footer className="mt-4 flex items-center justify-between border-t-2 border-dashed pt-2 text-[10px] font-bold opacity-70" style={{ borderColor: theme.border }}>
          <span>La Cartilla de Gretel · Leonor Lopetegui</span>
          <span>Lanny Books</span>
        </footer>
      </div>
    </div>
  );
}
