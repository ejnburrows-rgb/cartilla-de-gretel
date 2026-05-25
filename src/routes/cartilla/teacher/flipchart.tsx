import { createFileRoute, Outlet } from "@tanstack/react-router";

// Require teacher role: currently rendering unconditionally per instructions
// WARNING: Teacher role guard needs to be implemented.
export const Route = createFileRoute("/cartilla/teacher/flipchart")({
  component: FlipchartLayout,
});

function FlipchartLayout() {
  return <Outlet />;
}
