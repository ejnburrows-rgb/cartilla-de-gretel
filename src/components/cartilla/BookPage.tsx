import type { CatalogEntry } from "@/lib/lesson-catalog";
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
        bg: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 45%, #fde68a 100%)",
        textColor: "#78350f",
        accentSoft: "rgba(120,53,15,0.6)",
        label: "Las hermanitas vocales",
      };
    case "vowel":
      return {
        bg: "linear-gradient(135deg, #e0f2fe 0%, #ecfccb 50%, #fef3c7 100%)",
        textColor: "#064e3b",
        accentSoft: "rgba(6,78,59,0.6)",
        label: "Vocal",
      };
    case "consonant":
      return {
        bg: "linear-gradient(135deg, #ecfccb 0%, #fef3c7 50%, #e0f2fe 100%)",
        textColor: "#064e3b",
        accentSoft: "rgba(6,78,59,0.6)",
        label: "Consonante",
      };
  }
}

export function BookPage({ entry }: BookPageProps) {
  const tone = sectionTone(entry.kind);
  const accent = entry.color || tone.textColor;

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{
        background: tone.bg,
        boxShadow:
          "0 30px 60px rgba(0,0,0,0.18), inset 0 0 0 4px rgba(120,53,15,0.12)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(120,80,40,0.13) 1px, transparent 0)",
          backgroundSize: "4px 4px",
          opacity: 0.4,
        }}
      />
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(120,53,15,0.10) 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` }}
      />

      <div
        className="relative h-full flex flex-col p-6 sm:p-10"
        style={{ color: tone.textColor }}
      >
        <div
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          style={{ color: tone.accentSoft }}
        >
          Lección {entry.n} · {tone.label}
        </div>
        <h1
          className="text-5xl sm:text-7xl font-bold mt-1 leading-none"
          style={{
            color: accent,
            fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif",
          }}
        >
          {entry.title}
        </h1>
        {entry.pages && (
          <p className="mt-1 text-xs sm:text-sm" style={{ color: tone.accentSoft }}>
            Páginas {entry.pages}
          </p>
        )}

        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          <DragBuildWord entry={entry} accent={accent} />
        </div>

        <footer
          className="mt-3 pt-2 border-t-2 border-dashed flex items-center justify-between text-[10px]"
          style={{ color: tone.accentSoft, borderColor: "rgba(120,53,15,0.15)" }}
        >
          <span>La Cartilla de Gretel · Leonor Lopetegui</span>
          <span>Lanny Books</span>
        </footer>
      </div>
    </div>
  );
}
