import { useMemo } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { FlipchartHdPanel } from "@/components/cartilla/FlipchartHdPanel";
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

export function PresentarLesson() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === n),
    [n]
  );

  const handleExit = () => {
    navigate({ to: "/cartilla/leccion/$n", params: { n: String(n) } });
  };

  if (!entry) return null;

  const accentColor = entry.color || "#c98c4f";

  return (
    <TeacherPresentationShell accentColor={accentColor} onExit={handleExit}>
      <GardenScene>
        <div className="w-full h-full flex flex-col items-center justify-between p-8 relative z-10">

          {/* Top Info bar — the flipchart panel below shows its own page count */}
          <div className="w-full flex justify-between items-center text-stone-800 z-50 bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border border-stone-200">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                Lección {n}
              </span>
              <h2 className="text-lg font-black text-stone-800">{entry.title}</h2>
            </div>
          </div>

          {/* Real teacher flipchart, presentation lane only — not the student workbook */}
          <div className="flex-1 flex items-center justify-center p-4 w-full">
            <FlipchartHdPanel lessonNumber={n} />
          </div>
        </div>
      </GardenScene>
    </TeacherPresentationShell>
  );
}
