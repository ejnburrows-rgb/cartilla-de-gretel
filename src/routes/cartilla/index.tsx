import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/")({
  component: function CartillaRedirect() {
    return <Navigate to="/cartilla/lecciones" replace />;
  }
});
