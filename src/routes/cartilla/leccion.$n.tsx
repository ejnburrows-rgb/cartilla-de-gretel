import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  beforeLoad: () => {
    throw redirect({
      to: "/cartilla/student/libro",
    });
  },
});
