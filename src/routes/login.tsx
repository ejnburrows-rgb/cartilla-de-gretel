import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (import.meta.env.VITE_CRM_REVIEW === "true") {
      throw redirect({ to: "/cartilla/teacher/crm" });
    }
  },
  head: () => ({
    meta: [{ title: "Acceso del maestro — La Cartilla de Gretel" }],
  }),
});
