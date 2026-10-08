import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/recursos/$recursoId")({
  beforeLoad: () => {
    throw redirect({ to: "/cartilla/teacher/guia" });
  },
});
