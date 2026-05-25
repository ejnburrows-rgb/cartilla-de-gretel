import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { Reader } from "@/components/Reader";
import { InteractiveWorkbookLayer } from "@/components/cartilla/InteractiveWorkbookLayer";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: LeccionStudentRoute,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function LeccionStudentRoute() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  
  const entry = CATALOG.find((e) => e.n === n);
  if (!entry) return null;

  const pages = getLessonPageNumbers(entry.pages);
  const startPage = pages.length > 0 ? Math.min(...pages) : undefined;
  const endPage = pages.length > 0 ? Math.max(...pages) : undefined;

  const isLast = n >= TOTAL_LESSONS;

  return (
    <div className="flex flex-col h-screen overflow-hidden cartilla-crm-bg">
      <header className="flex-none p-3 border-b border-amber-900/10 bg-white/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => n > 1 ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } }) : navigate({ to: "/cartilla/lecciones" })}
            className="flex items-center gap-1.5 text-sm font-bold text-amber-950/70 hover:text-amber-950"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>
          
          <select 
            value={n} 
            onChange={(e) => navigate({ to: "/cartilla/leccion/$n", params: { n: e.target.value } })}
            className="bg-white border border-amber-900/20 rounded-md px-2 py-1 text-sm font-bold text-amber-950"
          >
            {CATALOG.map((item) => (
              <option key={item.n} value={item.n}>Lección {item.n}: {item.title}</option>
            ))}
          </select>

          <button 
            onClick={() => !isLast && navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } })}
            disabled={isLast}
            className="flex items-center gap-1.5 text-sm font-bold text-amber-950/70 hover:text-amber-950 disabled:opacity-50"
          >
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm font-black text-amber-900">
          {entry.title} <span className="text-amber-950/50">· Pág. {entry.pages}</span>
        </div>
      </header>
      
      <main className="flex-1 relative">
        <Reader startPage={startPage} endPage={endPage} />
        
        {/* Transparent overlay that handles coloring and interactions on top of the PDF */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* InteractiveWorkbookLayer typically expects to be inside the page rendering context, 
               but we provide it globally scoped to the lesson here */}
           <div className="opacity-40 mix-blend-multiply w-full h-full" style={{ backgroundColor: entry.color }}></div>
           <InteractiveWorkbookLayer lessonNumber={n} pageNumbers={pages} activePageNumber={startPage || 1} accent={entry.color} />
        </div>
      </main>
    </div>
  );
}
