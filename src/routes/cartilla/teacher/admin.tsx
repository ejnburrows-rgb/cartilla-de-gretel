import { createFileRoute, redirect } from "@tanstack/react-router";
import { isSeedAdmin, isSeedSessionActive } from "@/lib/seed-data";

export const Route = createFileRoute("/cartilla/teacher/admin")({
  beforeLoad: async () => {
    if (isSeedSessionActive()) {
      if (!isSeedAdmin()) throw redirect({ to: "/cartilla/teacher/crm" });
      return;
    }
    const { isCurrentUserLiveAdmin } = await import("@/lib/admin-overview.functions");
    if (!(await isCurrentUserLiveAdmin())) {
      throw redirect({ to: "/cartilla/teacher/crm" });
    }
  },
  head: () => ({
    meta: [{ title: "Dirección — La Cartilla de Gretel" }],
  }),
});
