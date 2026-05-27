import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/libro")({
  beforeLoad: () => {
    throw redirect({
      to: "/cartilla/student/libro",
    });
  },
});
