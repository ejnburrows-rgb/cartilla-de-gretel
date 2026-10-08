import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/teacher/crm")({
  component: () => <Outlet />,
});
