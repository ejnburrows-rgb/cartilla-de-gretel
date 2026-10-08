import { endDemoStudentSession } from "@/lib/demo-student-session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStudentSession } from "@/lib/student-session";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import {
  isSeedSessionActive,
  startTeacherReview,
} from "@/lib/seed-data";
import { normalizeFacultyDemoRoster } from "@/lib/demo-roster";

// Public access opens an isolated local classroom. Cloud reads still require
// their own authenticated teacher session in the service layer.
export const Route = createFileRoute("/cartilla/teacher")({
  beforeLoad: async () => {
    if (import.meta.env.VITE_CRM_REVIEW === "true") {
      endDemoStudentSession();
      startTeacherReview();
      normalizeFacultyDemoRoster();
      return;
    }
    if (isSeedSessionActive()) return;
    const studentSession = getStudentSession();
    if (studentSession) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const hasRole = await hasTeacherOrAdminRole(data.session.user.id);
    if (!hasRole) {
      try {
        if (typeof window !== "undefined" && window.sessionStorage) {
          window.sessionStorage.setItem("cartilla.auth.unauthorized", "1");
        }
      } catch {
        /* storage unavailable in some test runners — still redirect */
      }
      throw redirect({ to: "/login" });
    }
  },
});
