import { createFileRoute, redirect } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";

// Route configuration only — deliberately no component import here.
//
// TanStack's generated route tree imports every route module statically, so
// anything reachable from this file lands in the entry chunk a child downloads
// before the welcome screen can paint. The lesson view pulls the workbook
// renderer, the interaction widgets and their styles, none of which the first
// screen needs, so the component lives in `leccion.$n.lazy.tsx` and is fetched
// only when someone actually opens a lesson. Only `beforeLoad` stays eager,
// because the router has to be able to reject a bad lesson number before it
// loads anything.
export const Route = createFileRoute("/cartilla/leccion/$n")({
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});
