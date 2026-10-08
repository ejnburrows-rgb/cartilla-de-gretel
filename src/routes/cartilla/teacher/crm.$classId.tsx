import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Pure pass-through layout for /cartilla/teacher/crm/$classId/* — the
 * actual Clase overview page lives in crm.$classId.index.tsx. Required
 * once crm.$classId.$studentId.tsx (and its own children) exist as
 * siblings sharing this prefix; without this <Outlet/> the deeper routes
 * match the URL but this file's own component would render instead (see
 * the same fix one level up in crm.tsx). */
export const Route = createFileRoute("/cartilla/teacher/crm/$classId")({
  component: () => <Outlet />,
});
