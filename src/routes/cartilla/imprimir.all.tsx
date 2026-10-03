import { PrintableWorkbook } from "@/components/teacher/PrintableWorkbook";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import "@/styles/student-print.css";

export const Route = createFileRoute("/cartilla/imprimir/all")({
  component: ImprimirAllPage,
  head: () => ({
    meta: [{ title: "Cuaderno Completo Para Imprimir (24 Lecciones) — La Cartilla de Gretel" }],
  }),
  beforeLoad: async () => {
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

function ImprimirAllPage() { return <PrintableWorkbook />; }
