import { useState, useMemo } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { TeacherFlipChart } from "@/components/cartilla/TeacherFlipChart";
import { GardenScene } from "@/components/cartilla/GardenScene";
import "@/styles/kiosko.css";

export const Route = createFileRoute("/cartilla/presentar/$n")({
  component: PresentarLesson,
  head: ({ params }) => ({
    meta: [
      { title: `Presentando Lección ${params.n} — La Cartilla de Gretel` },
      { name: "description", content: "Proyector interactivo de lección con control remoto y puntero láser." },
    ],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function getPagesArray(pagesStr: string): number[] {
  const parts = pagesStr.split("-").map(Number);
  const from = parts[0] || 1;
  const to = parts[1] || from;
  const pages: number[] = [];
  for (let i = from; i <= to; i++) {
    pages.push(i);
  }
  return pages;
}

export function PresentarLesson() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === n),
    [n]
  );

  const pages = useMemo<number[]>(() => {
    if (!entry) return [1];
    return getPagesArray(entry.pages);
  }, [entry]);

  const [activePageIndex, setActivePageIndex] = useState(0);

  const handleExit = () => {
    navigate({ to: "/cartilla/leccion/$n", params: { n: String(n) } });
  };

  if (!entry) return null;

  const accentColor = entry.color || "#c98c4f";

  return (
    <TeacherPresentationShell accentColor={accentColor} onExit={handleExit}>
      <GardenScene>
        <div className="w-full h-full flex flex-col items-center justify-between p-8 relative z-10">
          
          {/* Top Info bar */}
          <div className="w-full flex justify-between items-center text-stone-800 z-50 bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-stone-200">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                Lección {n}
              </span>
              <h2 className="text-lg font-black text-stone-800">{entry.title}</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full border border-stone-200 shadow-inner text-stone-600">
              Página {pages[activePageIndex]} (Slide {activePageIndex + 1} de {pages.length})
            </span>
          </div>

          {/* Page Render via TeacherFlipChart */}
          <div className="flex-1 flex items-center justify-center p-4 w-full">
            <TeacherFlipChart 
              pages={pages} 
              lessonNumber={n} 
              initialPage={0} 
              onPageChange={setActivePageIndex} 
              accentColor={accentColor} 
            />
          </div>
        </div>
      </GardenScene>
    </TeacherPresentationShell>
  );
}
