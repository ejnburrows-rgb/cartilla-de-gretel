import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/lecciones")({
  beforeLoad: () => {
    throw redirect({
      to: "/cartilla/student/libro",
    });
  },
});
