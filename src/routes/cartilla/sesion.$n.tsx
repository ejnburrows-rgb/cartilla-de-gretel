import { useEffect, useMemo } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { useSessionStore, sessionStore } from "@/lib/session-store";
import { SessionStepRail } from "@/components/cartilla/SessionStepRail";
import { SessionProjector } from "@/components/cartilla/SessionProjector";
import { SessionTimer } from "@/components/cartilla/SessionTimer";
import { AudioNarrationDock } from "@/components/cartilla/AudioNarrationDock";
import { AccessibilityPanel } from "@/components/cartilla/AccessibilityPanel";
import { SessionShareCard } from "@/components/cartilla/SessionShareCard";
import { ArrowLeft, Laptop } from "lucide-react";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/sesion/$n")({
  component: SesionInteractiva,
  head: ({ params }) => ({
    meta: [
      { title: `Aula de Sesión En Vivo Lección ${params.n} — La Cartilla de Gretel` },
      { name: "description", content: "Consola de control docente de la clase para proyecciones." },
    ],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/sesiones" });
    }
  },
});

const getActiveColorStyle = (color: string) => ({
  color: color,
});

const threeColGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px 1fr 320px",
  gap: "1.5rem",
  alignItems: "start",
};

export function SesionInteractiva() {
  const { n: nParam } = Route.useParams();
  const n = Number(nParam);
  
  const entry = useMemo(() => {
    return CATALOG.find((e) => e.n === n) || CATALOG[0]!;
  }, [n]);

  const { stepIdx } = useSessionStore();

  useEffect(() => {
    // Sync active lesson with store
    sessionStore.update({ lessonN: n });
  }, [n]);

  const handleStepChange = (idx: number) => {
    sessionStore.update({ stepIdx: idx });
  };

  const activeColor = getActiveColorStyle(entry.color);

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col p-6 w-full">
      {/* Top Banner Navigation */}
      <header className="mb-6 max-w-7xl mx-auto w-full flex items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/cartilla/sesiones"
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
            aria-label="Volver al panel de sesiones"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Consola del Profesor
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-800">
                {entry.title}
              </h1>
              <span className="text-xs font-bold font-mono" style={activeColor}>
                págs. {entry.pages}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-500 font-semibold text-xs">
          <Laptop className="w-4 h-4" />
          <span className="hidden sm:inline">Aula Activa</span>
        </div>
      </header>

      {/* Grid Layouts */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        {/* Desktop View (3 Columns) */}
        <div className="hidden lg:grid w-full" style={threeColGridStyle}>
          {/* Column 1 — Rails */}
          <aside className="h-[calc(100vh-140px)] sticky top-6">
            <SessionStepRail
              entry={entry}
              activeStepIdx={stepIdx}
              onStepChange={handleStepChange}
            />
          </aside>

          {/* Column 2 — Projector */}
          <main className="w-full">
            <SessionProjector
              entry={entry}
              activeStepIdx={stepIdx}
              key={stepIdx}
            />
          </main>

          {/* Column 3 — Teacher Docks */}
          <aside className="flex flex-col gap-5 h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <SessionTimer />
            <AudioNarrationDock entry={entry} activeStepIdx={stepIdx} />
            <AccessibilityPanel />
            <SessionShareCard />
          </aside>
        </div>

        {/* Mobile View (Single Stacked Column) */}
        <div className="lg:hidden flex flex-col gap-6 w-full">
          <div className="w-full">
            <SessionProjector entry={entry} activeStepIdx={stepIdx} key={stepIdx} />
          </div>

          <div className="w-full">
            <SessionStepRail
              entry={entry}
              activeStepIdx={stepIdx}
              onStepChange={handleStepChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <SessionTimer />
            <AudioNarrationDock entry={entry} activeStepIdx={stepIdx} />
            <AccessibilityPanel />
            <SessionShareCard />
          </div>
        </div>
      </div>
    </div>
  );
}
