import type { CSSProperties } from "react";
import type { CatalogEntry } from "@/types/cartilla";
import { DragBuildWord } from "./DragBuildWord";

interface BookPageProps {
  entry: CatalogEntry;
}

function sectionTone(kind: CatalogEntry["kind"]): {
  bg: string;
  textColor: string;
  accentSoft: string;
  label: string;
} {
  switch (kind) {
    case "intro":
      return {
        bg: "linear-gradient(135deg, #fff8e7 0%, #fef3c7 45%, #fde68a 100%)",
        textColor: "#78350f",
        accentSoft: "rgba(120,53,15,0.6)",
        label: "Las hermanitas vocales",
      };
    case "vowel":
      return {
        bg: "linear-gradient(135deg, #fffcf0 0%, #fef6e0 50%, #fdf0c5 100%)",
        textColor: "#064e3b",
        accentSoft: "rgba(6,78,59,0.6)",
        label: "Vocal",
      };
    case "consonant":
      return {
        bg: "linear-gradient(135deg, #fef6e0 0%, #fffcf0 50%, #fef3c7 100%)",
        textColor: "#064e3b",
        accentSoft: "rgba(6,78,59,0.6)",
        label: "Consonante",
      };
  }
}

function pageStyle(background: string): CSSProperties {
  return { background };
}

function paperTextureStyle(): CSSProperties {
  return {
    background:
      "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPHBhdGggZD0iTTAgMEg0VjRIMEowIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+') repeat, radial-gradient(circle at 20% 15%, rgba(255,255,245,0.8), transparent 24%), radial-gradient(circle at 80% 85%, rgba(255,255,245,0.65), transparent 28%)",
  };
}

function centerFoldStyle(accentSoft: string): CSSProperties {
  return {
    background: `linear-gradient(to bottom, transparent, ${accentSoft}, transparent)`,
  };
}

function glowStyle(accent: string): CSSProperties {
  return { background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` };
}

function contentStyle(color: string): CSSProperties {
  return { color };
}

function mutedStyle(color: string): CSSProperties {
  return { color: `${color}99` };
}

function titleStyle(color: string): CSSProperties {
  return { color };
}

function footerStyle(accentSoft: string): CSSProperties {
  return { borderColor: accentSoft };
}

export function BookPage({ entry }: BookPageProps) {
  const tone = sectionTone(entry.kind);
  const accent = entry.color || tone.textColor;

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden border border-stone-200 shadow-[0_16px_36px_rgba(50,30,10,0.08),0_4px_12px_rgba(0,0,0,0.04),4px_6px_0_-2px_#fffcf8,8px_10px_0_-4px_#faf7ef]"
      style={pageStyle(tone.bg)}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={paperTextureStyle()}
      />
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none"
        style={centerFoldStyle(tone.accentSoft)}
      />
      <div
        className="absolute top-0 bottom-0 left-5 sm:left-[34px] w-px bg-red-400/25 pointer-events-none"
        style={{ content: '""' }}
      />
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={glowStyle(accent)}
      />

      <div
        className="relative h-full flex flex-col pl-9 pr-6 sm:pl-14 sm:pr-10 py-6 sm:py-10"
        style={contentStyle(tone.textColor)}
      >
        <div
          className="text-[10px] sm:text-xs font-black uppercase tracking-widest"
          style={mutedStyle(tone.textColor)}
        >
          Lección {entry.n} · {tone.label}
        </div>
        <h1
          className="text-5xl sm:text-7xl font-bold mt-1 leading-none"
          style={titleStyle(accent)}
        >
          {entry.title}
        </h1>
        {entry.pages && (
          <p className="mt-1 text-xs sm:text-sm" style={mutedStyle(tone.textColor)}>
            Páginas {entry.pages}
          </p>
        )}

        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          <DragBuildWord entry={entry} accent={accent} />
        </div>

        <footer
          className="mt-3 pt-2 border-t-2 border-dashed flex items-center justify-between text-[10px]"
          style={footerStyle(tone.accentSoft)}
        >
          <span>La Cartilla de Gretel · Leonor Lopetegui</span>
          <span>Lanny Books</span>
        </footer>
      </div>
    </div>
  );
}
