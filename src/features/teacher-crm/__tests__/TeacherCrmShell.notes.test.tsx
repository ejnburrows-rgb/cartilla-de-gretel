import "@testing-library/jest-dom/vitest";
import type { PropsWithChildren } from "react";
import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listClasses, getClass, updateStudent } from "@/lib/teacher.functions";
import { TeacherCrmShell } from "../TeacherCrmShell";

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(), getClass: vi.fn(), updateStudent: vi.fn(), createClass: vi.fn(), addStudents: vi.fn(),
}));
vi.mock("@/lib/seed-data", () => ({ isSeedSessionActive: () => false }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: PropsWithChildren) => <a>{children}</a> }));
// Keep the production shell callback and AccountPanel together. Unrelated
// navigation, chart and assignment rendering are outside this save contract.
vi.mock("../components/Sidebar", () => ({ Sidebar: () => null }));
vi.mock("../components/AnalyticsPanel", () => ({ AnalyticsPanel: () => null }));
vi.mock("../components/TaskList", () => ({ TaskList: () => null }));

let client: QueryClient;
let storedNotes: string;
// Initial queries can take over one second while browser/typecheck workers
// share this machine; wait for observable state instead of adding sleeps.
configure({ asyncUtilTimeout: 10_000 });
beforeEach(() => {
  vi.resetAllMocks();
  storedNotes = "Nota anterior sintética";
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.mocked(listClasses).mockResolvedValue([{
    id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", student_count: 1, created_at: "2026-01-01",
  }]);
  vi.mocked(getClass).mockImplementation(async () => ({
    class: { id: "synthetic-class", name: "Clase sintética", join_code: "DEMO01", created_at: "2026-01-01" },
    students: [{ id: "synthetic-student", display_name: "Alumno sintético", student_code: "SYN01", created_at: "2026-01-01",
      archived_at: null, teacher_notes: storedNotes, events: 0, lessons: 0, lastSeen: null, completionPercent: 0 }],
  }));
  vi.mocked(updateStudent).mockImplementation(async ({ data }) => {
    storedNotes = data.teacherNotes!;
    return { ok: true };
  });
});
afterEach(() => { cleanup(); client.clear(); });
const mount = () => render(<QueryClientProvider client={client}><TeacherCrmShell /></QueryClientProvider>);

describe("TeacherCrmShell + AccountPanel notes recovery", () => {
  it("retains the rejected draft and save button, retries unchanged text, and reads the saved note after remount", async () => {
    vi.mocked(updateStudent).mockRejectedValueOnce(new Error("Synthetic update rejection"));
    const view = mount();
    const notes = await screen.findByRole("textbox", { name: "Notas del alumno" });
    await waitFor(() => expect(notes).toHaveValue("Nota anterior sintética"));
    fireEvent.change(notes, { target: { value: "Nota nueva sintética" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar Notas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron guardar las notas");
    expect(notes).toHaveValue("Nota nueva sintética");
    expect(notes).toBeEnabled();
    expect(storedNotes).toBe("Nota anterior sintética");
    fireEvent.click(screen.getByRole("button", { name: "Guardar Notas" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Guardando…" })).toBeNull());
    await waitFor(() => expect(screen.queryByRole("button", { name: "Guardar Notas" })).toBeNull());
    expect(screen.queryByRole("alert")).toBeNull();
    expect(updateStudent).toHaveBeenCalledTimes(2);
    expect(updateStudent).toHaveBeenLastCalledWith({ data: { id: "synthetic-student", teacherNotes: "Nota nueva sintética" } });
    view.unmount(); client.clear();
    mount();
    const restored = await screen.findByRole("textbox", { name: "Notas del alumno" });
    await waitFor(() => expect(restored).toHaveValue("Nota nueva sintética"));
  });

  it("disables editing and repeated save clicks while pending, then closes editing on success", async () => {
    let finish!: (value: { ok: boolean }) => void;
    vi.mocked(updateStudent).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    mount();
    const notes = await screen.findByRole("textbox", { name: "Notas del alumno" });
    await waitFor(() => expect(notes).toHaveValue("Nota anterior sintética"));
    fireEvent.change(notes, { target: { value: "Nota pendiente" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar Notas" }));
    const saving = screen.getByRole("button", { name: "Guardando…" });
    expect(saving).toBeDisabled(); expect(notes).toBeDisabled();
    fireEvent.click(saving);
    expect(updateStudent).toHaveBeenCalledTimes(1);
    finish({ ok: true });
    await waitFor(() => expect(screen.queryByRole("button", { name: "Guardando…" })).toBeNull());
    expect(notes).toBeEnabled();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
