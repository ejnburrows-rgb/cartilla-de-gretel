import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAssignments } from "@/lib/assignments.functions";
import { TaskList } from "../TaskList";

vi.mock("@/lib/assignments.functions", () => ({
  listAssignments: vi.fn(), createAssignment: vi.fn(), deleteAssignment: vi.fn(),
}));

let client: QueryClient;
beforeEach(() => {
  vi.resetAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => { cleanup(); client.clear(); });
const mount = () => render(<QueryClientProvider client={client}><TaskList classId="synthetic-class" /></QueryClientProvider>);
const assignment = {
  id: "synthetic-task", class_id: "synthetic-class", lesson_id: "1",
  title: "Tarea de prueba", due_at: null, time_limit_seconds: null, created_at: "2026-01-01T00:00:00Z",
};

describe("TaskList request recovery", () => {
  it("shows a fetch error instead of an empty classroom, then retries the actual query", async () => {
    let finishRetry!: (rows: typeof assignment[]) => void;
    vi.mocked(listAssignments).mockRejectedValueOnce(new Error("Synthetic outage"))
      .mockImplementationOnce(() => new Promise(resolve => { finishRetry = resolve; }));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Error al cargar asignaciones");
    expect(screen.queryByText("¡No hay tareas!")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(listAssignments).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Cargando asignaciones…")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Reintentar" })).toBeNull();
    finishRetry([assignment]);
    expect(await screen.findByText("Tarea de prueba")).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(listAssignments).toHaveBeenLastCalledWith({ data: { classId: "synthetic-class" } });
  });

  it("shows no assignments only after a successful empty response", async () => {
    vi.mocked(listAssignments).mockResolvedValue([]);
    mount();
    expect(await screen.findByText("¡No hay tareas!")).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not show the empty state while the initial query is pending", async () => {
    let finish!: (rows: typeof assignment[]) => void;
    vi.mocked(listAssignments).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    mount();
    expect(screen.getByText("Cargando asignaciones…")).toBeVisible();
    expect(screen.queryByText("¡No hay tareas!")).toBeNull();
    finish([assignment]);
    expect(await screen.findByText("Tarea de prueba")).toBeVisible();
  });

  it("shows a retryable error when refetch fails after a successful empty response", async () => {
    vi.mocked(listAssignments).mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("Synthetic outage"));
    mount();
    await screen.findByText("¡No hay tareas!");
    await client.refetchQueries({ queryKey: ["assignments", "synthetic-class"] });
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.queryByText("¡No hay tareas!")).toBeNull();
  });
});
