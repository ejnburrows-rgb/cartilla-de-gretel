import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/cartilla/teacher/guia/$n")({
  head: ({ params }) => {
    const n = Number(params.n);
    const catalogEntry = CATALOG.find((e) => e.n === n);
    const title = catalogEntry
      ? `${catalogEntry.title} — Guía del Maestro`
      : `Lección ${n} — Guía del Maestro`;
    return {
      meta: [{ title: `${title} — La Cartilla de Gretel` }],
    };
  },
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/teacher" });
    }
  },
});
