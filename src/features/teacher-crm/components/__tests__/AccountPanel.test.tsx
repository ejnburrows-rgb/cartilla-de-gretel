/**
 * @vitest-environment jsdom
 *
 * Regression test for issue #863: CRM notes save failure falsely completes editing.
 * When the save (onUpdate) rejects, AccountPanel must keep the notes draft
 * editable and show the error — never exit editing mode as if the save worked.
 */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountPanel } from "../AccountPanel";
import type { DashboardStudent } from "../PipelineBoard";

const student: DashboardStudent = {
  id: "student-1",
  name: "Ana",
  progress: 42,
  lastActive: "hoy",
  teacher_notes: "nota previa",
};

function startEditing() {
  const textarea = screen.getByLabelText("Notas del alumno") as HTMLTextAreaElement;
  fireEvent.change(textarea, { target: { value: "nueva nota del maestro" } });
  return textarea;
}

describe("AccountPanel notes save failure (#863)", () => {
  it("keeps the draft editable and shows the error when the save rejects", async () => {
    const onUpdate = vi.fn().mockRejectedValueOnce(new Error("cloud down"));
    render(<AccountPanel student={student} onUpdate={onUpdate} />);

    const textarea = startEditing();
    fireEvent.click(screen.getByRole("button", { name: /guardar notas/i }));

    // Error path runs: visible error, draft preserved, still editing.
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/no se pudieron guardar las notas/i);
    expect(textarea).toHaveValue("nueva nota del maestro");
    expect(screen.getByRole("button", { name: /guardar notas/i })).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledWith("student-1", {
      teacher_notes: "nueva nota del maestro",
    });
  });

  it("exits editing mode after a retry succeeds", async () => {
    const onUpdate = vi
      .fn()
      .mockRejectedValueOnce(new Error("cloud down"))
      .mockResolvedValueOnce(undefined);
    render(<AccountPanel student={student} onUpdate={onUpdate} />);

    startEditing();
    fireEvent.click(screen.getByRole("button", { name: /guardar notas/i }));
    await screen.findByRole("alert");

    // Retry with a working save: editing exits, error clears.
    fireEvent.click(screen.getByRole("button", { name: /guardar notas/i }));
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /guardar notas/i })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });

  it("exits editing mode on a successful save", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<AccountPanel student={student} onUpdate={onUpdate} />);

    startEditing();
    fireEvent.click(screen.getByRole("button", { name: /guardar notas/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /guardar notas/i })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
