import { useMemo } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { FlipchartHdPanel } from "@/components/cartilla/FlipchartHdPanel";
import { getFlipchartPagesForLesson } from "@/lib/flipchart-hd";

/**
 * Teacher classroom presentation route.
 * Uses the native Flip Chart e-learning surface — never the student workbook shell.
 * Existing access behavior is preserved; this route does not add new auth requirements.
 */
export const Route = createFileRoute("/cartilla/presentar/$n")({
  component: PresentarLesson,
  head: ({ params }) => ({
    meta: [
      { title: `Presentando Lección ${params.n} — La Cartilla de Gretel` },
      {
        name: "description",
        content:
          "Proyector profesional del flipchart del maestro con navegación y puntero.",
      },
    ],
  }),
  beforeLoad: async ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }

    if (import.meta.env.VITE_CRM_REVIEW === "true") return;

    if (getStudentSession()) {
      throw redirect({ to: "/cartilla/lecciones" });
    }

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

  const sheetCount = useMemo(() => getFlipchartPagesForLesson(n).length, [n]);

  const handleExit = () => {
    navigate({ to: "/cartilla/teacher" });
  };

  if (!entry) return null;

  const accentColor = entry.color || "#c98c4f";

  return (
    <>
      <TeacherPresentationShell
        accentColor={accentColor}
        onExit={handleExit}
        bare
        eyebrow={`Lección ${n} · Flipchart`}
        title={entry.title}
        subtitle={
        sheetCount > 0
          ? `${sheetCount} láminas digitales · Proyector del maestro`
          : "Proyector del maestro"
        }
      >
        {/* Full-bleed native board — zero chrome, the page IS the book page. */}
        <FlipchartHdPanel key={n} lessonNumber={n} accentColor={accentColor} chrome="bare" />
      </TeacherPresentationShell>
    </>
  );
}
