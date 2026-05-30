import { useMemo, type CSSProperties } from "react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { speak } from "@/lib/speak";

interface RingTabNavProps {
  currentPage: number;
  onSelect: (page: number) => void;
  className?: string;
}

interface LessonTab {
  n: number;
  label: string;
  title: string;
  start: number;
  end: number;
  color: string;
}

function pageRange(pages: string): { start: number; end: number } {
  const parts = pages.split("-").map((p) => parseInt(p, 10));
  const start = Number.isFinite(parts[0]) ? parts[0] : 1;
  const end = Number.isFinite(parts[1]) ? parts[1] : start;
  return { start, end };
}

function tabLabel(entry: CatalogEntry): string {
  if (entry.kind === "vowel") return entry.vowel.toUpperCase();
  if (entry.kind === "consonant") return entry.letter.toUpperCase();
  return "I";
}

// Metallic spiral-ring hole rendered at the top of each tab so the rail reads
// like the binding rings of a real spiral-bound cartilla. className-only so no
// inline double-brace style prop is needed.
const ringHoleClass =
  "absolute -top-1.5 h-3 w-3 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.65),inset_0_-1px_1.5px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.28)]";

export function RingTabNav({ currentPage, onSelect, className = "" }: RingTabNavProps) {
  const tabs = useMemo<LessonTab[]>(
    () =>
      CATALOG.map((entry) => {
        const { start, end } = pageRange(entry.pages);
        return {
          n: entry.n,
          label: tabLabel(entry),
          title: entry.title,
          start,
          end,
          color: entry.color,
        };
      }),
    [],
  );

  const handleSelect = (tab: LessonTab) => {
    onSelect(tab.start);
    // Hear the lesson when you jump to it (speak is SSR-guarded and a no-op
    // when speech synthesis is unavailable).
    void speak(tab.title);
  };

  return (
    <nav
      aria-label="Navegación por lecciones con pestañas de anillas"
      className={`ring-tab-nav no-print flex shrink-0 flex-row md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto px-1 py-2 ${className}`}
    >
      {tabs.map((tab) => {
        const active = currentPage >= tab.start && currentPage <= tab.end;
        const bodyStyle: CSSProperties = active
          ? { backgroundColor: tab.color, borderColor: tab.color, color: "#ffffff" }
          : { backgroundColor: "#fffdf7", borderColor: `${tab.color}55`, color: tab.color };
        return (
          <button
            key={tab.n}
            type="button"
            onClick={() => handleSelect(tab)}
            aria-label={`Ir a la lección ${tab.n}: ${tab.title}`}
            aria-current={active ? "page" : undefined}
            style={bodyStyle}
            className={`group relative flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 font-black uppercase shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 md:w-12 ${
              active ? "scale-105 shadow-md" : "hover:shadow"
            }`}
          >
            <span className={ringHoleClass} aria-hidden="true" />
            <span className="mt-1 text-sm leading-none">{tab.label}</span>
            <span className="mt-0.5 text-[8px] leading-none opacity-80">L{tab.n}</span>
          </button>
        );
      })}
    </nav>
  );
}
