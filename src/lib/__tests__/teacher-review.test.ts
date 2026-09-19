import { afterEach, expect, it, vi } from "vitest";
import {
  SEED_TEACHERS,
  isSeedSessionActive,
  startTeacherReview,
  getSeedClass,
} from "../seed-data";
import { normalizeFacultyDemoRoster } from "../demo-roster";
afterEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
});
it("does not enable local access when the open-access build flag is disabled", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "false");
  vi.stubEnv("PROD", true);
  expect(() => startTeacherReview()).toThrow();
  localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
  expect(isSeedSessionActive()).toBe(false);
});
it("opens only the local classroom in the production build when open access is enabled", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true");
  vi.stubEnv("PROD", true);
  startTeacherReview();
  normalizeFacultyDemoRoster();
  expect(isSeedSessionActive()).toBe(true);
  expect(localStorage.getItem("cartilla.seed.state.v1")).toBeTruthy();
});

it("seeds exactly two teachers and six deterministic demo students", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true");
  startTeacherReview();
  normalizeFacultyDemoRoster();
  const state = JSON.parse(localStorage.getItem("cartilla.seed.state.v1")!);
  expect(SEED_TEACHERS).toHaveLength(2);
  expect(state.classes).toHaveLength(2);
  expect(state.students).toHaveLength(6);
  expect(
    state.students.filter(
      (student: { class_id: string }) => student.class_id === "seed-class-demo",
    ),
  ).toHaveLength(3);
  expect(
    state.students.filter(
      (student: { class_id: string }) => student.class_id === "seed-class-emilio",
    ),
  ).toHaveLength(3);
});

it("migrates the two retired demo students out of an existing browser roster", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true");
  localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
  localStorage.setItem(
    "cartilla.seed.state.v1",
    JSON.stringify({
      classes: [
        {
          id: "seed-class-demo",
          teacher_id: "seed-teacher-leonor",
          name: "Clase de Prueba",
          join_code: "DEMO12",
          created_at: "2026-09-01T00:00:00.000Z",
        },
        {
          id: "seed-class-emilio",
          teacher_id: "seed-teacher-emilio",
          name: "Clase de Emilio",
          join_code: "EMIL12",
          created_at: "2026-09-01T00:00:00.000Z",
        },
      ],
      students: [
        "sofia",
        "mateo",
        "camila",
        "lucas",
        "emma",
        "nico",
        "valentina",
        "diego",
      ].map((name) => ({
        id: `seed-student-${name}`,
        class_id: ["lucas", "emma", "nico"].includes(name)
          ? "seed-class-emilio"
          : "seed-class-demo",
        display_name: name,
        student_code: name.toUpperCase(),
        created_at: "2026-09-01T00:00:00.000Z",
      })),
      events: [
        {
          id: "legacy-diego-event",
          student_id: "seed-student-diego",
          lesson_id: "1",
          event_kind: "exercise",
          score: 1,
          total: 10,
          time_seconds: null,
          meta: { exercise: "picture_grid" },
          created_at: "2026-09-01T00:00:00.000Z",
        },
      ],
      assignments: [],
    }),
  );
  startTeacherReview();
  normalizeFacultyDemoRoster();
  const state = JSON.parse(localStorage.getItem("cartilla.seed.state.v1")!);
  const ids = state.students.map((student: { id: string }) => student.id);
  expect(ids).not.toContain("seed-student-valentina");
  expect(ids).not.toContain("seed-student-diego");
  expect(state.events).toHaveLength(0);
});

it("reports the latest activity even when demo events were generated oldest first", () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true");
  startTeacherReview();
  normalizeFacultyDemoRoster();
  const state = JSON.parse(localStorage.getItem("cartilla.seed.state.v1")!);
  const student = getSeedClass("seed-class-demo").students[0];
  const latest = state.events
    .filter((e: { student_id: string }) => e.student_id === student.id)
    .map((e: { created_at: string }) => e.created_at)
    .sort()
    .at(-1);
  expect(student.lastSeen).toBe(latest);
});

it("updates local class and student lists immediately after creation", async () => {
  vi.stubEnv("VITE_CRM_REVIEW", "true");
  startTeacherReview();
  normalizeFacultyDemoRoster();
  const React = await import("react");
  const { render, fireEvent, cleanup } = await import("@testing-library/react");
  const { QueryClient, QueryClientProvider } =
    await import("@tanstack/react-query");
  const { ClassRoster } = await import("@/components/teacher/ClassRoster");
  const view = render(
    React.createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      React.createElement(ClassRoster),
    ),
  );
  fireEvent.change(view.getByRole("textbox", { name: "Nueva clase" }), {
    target: { value: "Prueba nueva" },
  });
  fireEvent.click(view.getByRole("button", { name: "Crear" }));
  expect(
    view.getByRole("option", { name: "Prueba nueva (0 alumnos)" }),
  ).toBeTruthy();
  fireEvent.change(view.getByRole("textbox", { name: "Nombre del alumno" }), {
    target: { value: "Alumna nueva" },
  });
  fireEvent.click(view.getByRole("button", { name: "+ Añadir Alumno" }));
  expect(
    view.getByRole("option", { name: "Prueba nueva (1 alumnos)" }),
  ).toBeTruthy();
  expect(view.getByRole("button", { name: "Alumna nueva" })).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: "Alumna nueva" }));
  const renameInput = view.getByDisplayValue("Alumna nueva");
  fireEvent.change(renameInput, { target: { value: "Nombre corregido" } });
  fireEvent.keyDown(renameInput, { key: "Enter" });
  expect(view.getByRole("button", { name: "Nombre corregido" })).toBeTruthy();
  cleanup();
});

it("uses the same attention flag for board columns as for the dashboard KPI", async () => {
  const React = await import("react");
  const { render, cleanup } = await import("@testing-library/react");
  const { PipelineBoard } =
    await import("@/features/teacher-crm/components/PipelineBoard");
  const view = render(
    React.createElement(PipelineBoard, {
      students: [
        {
          id: "new",
          name: "Principiante activo",
          progress: 5,
          lastActive: "hoy",
          alert: false,
        },
        {
          id: "help",
          name: "Necesita apoyo",
          progress: 85,
          lastActive: "hoy",
          alert: true,
        },
      ],
      selectedStudentId: null,
      onSelectStudent: () => {},
    }),
  );
  expect(
    view.getByText("Principiante activo").closest(".crm-pipeline-column")
      ?.textContent,
  ).toContain("En progreso normal");
  expect(
    view.getByText("Necesita apoyo").closest(".crm-pipeline-column")
      ?.textContent,
  ).toContain("Requieren atención");
  cleanup();
});
