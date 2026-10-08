import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Pure pass-through layout for /cartilla/teacher/crm/$classId/$studentId/* —
 * the actual Estudiante detail page (tile grid + account panel) lives in
 * crm.$classId.$studentId.index.tsx. Required once
 * crm.$classId.$studentId.$lessonId.tsx and crm.$classId.$studentId.reporte.tsx
 * exist as siblings sharing this prefix (see the same fix at crm.tsx and
 * crm.$classId.tsx). */
export const Route = createFileRoute("/cartilla/teacher/crm/$classId/$studentId")({
  component: () => <Outlet />,
});
