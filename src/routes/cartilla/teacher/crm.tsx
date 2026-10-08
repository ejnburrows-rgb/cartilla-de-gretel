import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Pure pass-through layout for the whole /cartilla/teacher/crm/* drill-down
 * (Panel → Clase → Estudiante → Lección). Once any crm.$foo.tsx sibling
 * exists, this file becomes the mandatory layout route for that prefix —
 * without its own <Outlet/> here, every child page matches the URL but
 * never actually renders (this file's own component wins instead). The
 * real Panel dashboard lives in crm.index.tsx. */
export const Route = createFileRoute("/cartilla/teacher/crm")({
  component: () => <Outlet />,
});
