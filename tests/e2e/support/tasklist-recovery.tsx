// Component browser fixture: real production component and query client;
// only assignments.functions is replaced by the spec's synthetic transport.
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskList } from "/src/features/teacher-crm/components/TaskList";
import "/src/styles.css";

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <main style={{ maxWidth: 700, margin: "24px auto", padding: 16 }}>
      <p>Prueba sintética · sin datos reales</p>
      <TaskList classId="synthetic-class" />
    </main>
  </QueryClientProvider>,
);
