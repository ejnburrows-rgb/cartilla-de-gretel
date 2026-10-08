import { createFileRoute, redirect } from "@tanstack/react-router";
import { isSeedAdmin, isSeedSessionActive } from "@/lib/seed-data";
import { isCurrentUserLiveAdmin } from "@/lib/admin-overview.functions";

export const Route = createFileRoute("/cartilla/teacher/admin")({
  beforeLoad: async () => {
    if (isSeedSessionActive()) {
      if (!isSeedAdmin()) throw redirect({ to: "/cartilla/teacher/crm" });
      return;
    }
    if (!(await isCurrentUserLiveAdmin())) {
      throw redirect({ to: "/cartilla/teacher/crm" });
    }
  },
  head: () => ({
    meta: [{ title: "Dirección — La Cartilla de Gretel" }],
  }),
});
