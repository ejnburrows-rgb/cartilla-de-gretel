// Actual changed shell, which currently has no importing app route.
// Component check only: do not report routed/production verification.
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, createRouter, createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { TeacherCrmShell } from "/src/features/teacher-crm/TeacherCrmShell";
import "/src/styles.css";
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const router = createRouter({ routeTree: createRootRoute({ component: TeacherCrmShell }), history: createMemoryHistory({ initialEntries: ["/"] }) });
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>,
);
