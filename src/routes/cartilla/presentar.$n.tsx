import { useMemo } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { FlipchartHdPanel } from "@/components/cartilla/FlipchartHdPanel";
import "@/styles/kiosko.css";

/**
 * Teacher-only classroom presentation route.
 * Shows the real HD flipchart scans (FlipchartHdPanel) — never student workbook pages.
 * Gate mirrors /cartilla/teacher: seed demo session OR signed-in teacher/admin role.
 */
export const Route = createFileRoute("/cartilla/presentar/$n")({
  component: PresentarLesson,
  head: ({ params }) => ({
    meta: [
      { title: `Presentando Lección ${params.n} — La Cartilla de Gretel` },
      {
        name: "description",
        content: "Proyector del flipchart del maestro con navegación y puntero láser.",
      },
    ],
  }),
  beforeLoad: async ({ params }) => {
    // Students never enter the teacher presentation surface.
    if (getStudentSession()) {
      throw redirect({ to: "/cartilla/lecciones" });
    }

    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }

    // Local demo/seed lane (env-gated) — same bypass as /cartilla/teacher.
    if (isSeedSessionActive()) return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const hasRole = await hasTeacherOrAdminRole(data.session.user.id);
    if (!hasRole) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cartilla.auth.unauthorized", "1");
      }
      throw redirect({ to: "/login" });
    }
  },
});

function PresentarLesson() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === n),
    [n],
  );

  const handleExit = () => {
    // Stay in the teacher lane — never drop into the student workbook.
    navigate({ to: "/cartilla/teacher" });
  };

  if (!entry) return null;

  const accentColor = entry.color || "#c98c4f";

  return (
    <TeacherPresentationShell accentColor={accentColor} onExit={handleExit}>
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-2 sm:p-4 relative z-10 min-h-0">
        {/* Compact lesson chrome — keeps HD flipchart as large as possible */}
        <div className="w-full max-w-4xl shrink-0 flex justify-between items-center text-stone-800 dark:text-stone-100 bg-white/90 dark:bg-slate-900/85 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-600">
          <div className="text-left min-w-0">
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Lección {n} · Flipchart
            </span>
            <h2 className="text-base sm:text-lg font-black text-stone-800 dark:text-stone-50 truncate">
              {entry.title}
            </h2>
          </div>
        </div>

        {/* Real teacher flipchart only — presentation lane, not student workbook */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <FlipchartHdPanel lessonNumber={n} />
        </div>
      </div>
    </TeacherPresentationShell>
  );
}
