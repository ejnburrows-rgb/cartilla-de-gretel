import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/teacher/paginas/$n")({
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !(n >= 1 && n <= CATALOG.length)) {
      throw redirect({ to: "/cartilla/teacher" });
    }
  },
});
