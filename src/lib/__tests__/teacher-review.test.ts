import { afterEach, expect, it, vi } from "vitest";
import { isSeedSessionActive, startTeacherReview, getSeedClass } from "../seed-data";
afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); });
it("does not enable a password-free teacher session in the production build", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "false"); vi.stubEnv("PROD", true);
  expect(() => startTeacherReview()).toThrow();
  localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
  expect(isSeedSessionActive()).toBe(false);
});
it("opens only the local seed session in a review build", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true"); vi.stubEnv("PROD", true);
  startTeacherReview();
  expect(isSeedSessionActive()).toBe(true);
  expect(localStorage.getItem("cartilla.seed.state.v1")).toBeTruthy();
});

it("reports the latest activity even when demo events were generated oldest first", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true"); startTeacherReview();
  const state = JSON.parse(localStorage.getItem("cartilla.seed.state.v1")!);
  const student = getSeedClass("seed-class-demo").students[0];
  const latest = state.events.filter((e: {student_id: string}) => e.student_id === student.id)
    .map((e: {created_at: string}) => e.created_at).sort().at(-1);
  expect(student.lastSeen).toBe(latest);
});

it("updates local class and student lists immediately after creation", async () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true"); startTeacherReview();
  const React = await import("react");
  const { render, fireEvent, cleanup } = await import("@testing-library/react");
  const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
  const { ClassRoster } = await import("@/components/teacher/ClassRoster");
  const view = render(React.createElement(QueryClientProvider, { client: new QueryClient() }, React.createElement(ClassRoster)));
  fireEvent.change(view.getByRole("textbox", { name: "Nueva clase" }), { target: { value: "Prueba nueva" } });
  fireEvent.click(view.getByRole("button", { name: "Crear" }));
  expect(view.getByRole("option", { name: "Prueba nueva (0 alumnos)" })).toBeTruthy();
  fireEvent.change(view.getByRole("textbox", { name: "Nombre del alumno" }), { target: { value: "Alumna nueva" } });
  fireEvent.click(view.getByRole("button", { name: "+ Añadir Alumno" }));
  expect(view.getByRole("option", { name: "Prueba nueva (1 alumnos)" })).toBeTruthy();
  expect(view.getByRole("button", { name: "Alumna nueva" })).toBeTruthy();
  cleanup();
});

it("uses the same attention flag for board columns as for the dashboard KPI", async () => {
  const React = await import("react");
  const { render, cleanup } = await import("@testing-library/react");
  const { PipelineBoard } = await import("@/features/teacher-crm/components/PipelineBoard");
  const view = render(React.createElement(PipelineBoard, { students: [
    { id: "new", name: "Principiante activo", progress: 5, lastActive: "hoy", alert: false },
    { id: "help", name: "Necesita apoyo", progress: 85, lastActive: "hoy", alert: true },
  ], selectedStudentId: null, onSelectStudent: () => {} }));
  expect(view.getByText("Principiante activo").closest(".crm-pipeline-column")?.textContent).toContain("En progreso normal");
  expect(view.getByText("Necesita apoyo").closest(".crm-pipeline-column")?.textContent).toContain("Requieren atención");
  cleanup();
});
