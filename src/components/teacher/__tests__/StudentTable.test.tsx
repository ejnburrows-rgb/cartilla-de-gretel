// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentTable } from "../StudentTable";

const baseProps = {
  searchQuery: "ana",
  editingId: null,
  editingName: "",
  busy: false,
  isSeed: false,
  setEditingName: vi.fn(),
  setEditingId: vi.fn(),
  handleSaveRename: vi.fn(),
  startEditing: vi.fn(),
  handleArchiveToggle: vi.fn(),
  handleDeleteStudent: vi.fn(),
};

afterEach(cleanup);

describe("StudentTable", () => {
  it("keeps the original no-matching-students message after extraction from ClassRoster", () => {
    render(<StudentTable {...baseProps} studentsList={[]} />);
    expect(screen.getByRole("status").textContent).toContain('Ningún alumno coincide con "ana".');
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("still renders a populated roster normally", () => {
    render(
      <StudentTable
        {...baseProps}
        studentsList={[
          {
            id: "student-1",
            display_name: "Ana",
            student_code: "1234",
            lessons: 2,
            lastSeen: null,
          },
        ]}
      />,
    );
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ana" })).toBeTruthy();
    expect(screen.getByText("1234")).toBeTruthy();
  });
});
