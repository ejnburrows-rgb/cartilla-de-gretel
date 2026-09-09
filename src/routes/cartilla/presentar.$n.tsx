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
 * Teacher-only classroom presentation route.
 * HD flipchart plates only (FlipchartHdPanel) — never the student workbook shell.
 * Gate mirrors /cartilla/teacher: seed demo session OR signed-in teacher/admin role.
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
    <TeacherPresentationShell
      accentColor={accentColor}
      onExit={handleExit}
      eyebrow={`Lección ${n} · Flipchart`}
      title={entry.title}
      subtitle={
        sheetCount > 0
          ? `${sheetCount} láminas HD · Proyector del maestro`
          : "Proyector del maestro"
      }
    >
      {/* Full-bleed board — no nested max-width chrome bars */}
      <FlipchartHdPanel lessonNumber={n} accentColor={accentColor} />
    </TeacherPresentationShell>
  );
}
