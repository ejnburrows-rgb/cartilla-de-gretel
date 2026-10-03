import { PrintableWorkbook } from "@/components/teacher/PrintableWorkbook";
/**
 * imprimir.$n.tsx  — Lane A  (NEW)
 *
 * Print-only route: PDF page + printable worksheet of the three exercises.
 * CSS @page + @media print hide all chrome on print.
 * Route: /cartilla/imprimir/:n
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/imprimir/$n")({
  component: ImprimirPage,
  head: ({ params }) => ({
    meta: [{ title: `Imprimir Lección ${params.n} — La Cartilla de Gretel` }],
  }),
  beforeLoad: async ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }

    // Printable book content is public while open access is enabled.
    if (import.meta.env.VITE_CRM_REVIEW === "true") return;
    if (isSeedSessionActive()) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const hasRole = await hasTeacherOrAdminRole(data.session.user.id);
    if (!hasRole) {
      throw redirect({ to: "/login" });
    }
  },
});

function ImprimirPage() {
  const { n } = Route.useParams();
  return <PrintableWorkbook key={n} lesson={Number(n)} />;
}
