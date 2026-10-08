import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/teacher/paginas/$n")({
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }
  },
});
