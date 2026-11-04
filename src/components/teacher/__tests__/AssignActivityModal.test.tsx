/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignActivityModal } from "../AssignActivityModal";
import * as FolderAssignmentsFunctions from "@/lib/folder-assignments.functions";
import "@testing-library/jest-dom";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<any>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useMutation: ({ mutationFn }: any) => ({
      mutate: mutationFn,
      isPending: false,
      isError: false,
    }),
    useQuery: (options: any) => {
      if (options.queryKey[0] === "teacher-classes") {
        return {
          data: [
            { id: "class-1", name: "Class 1", student_count: 2 },
            { id: "class-2", name: "Class 2", student_count: 1 },
          ],
          isLoading: false,
        };
      }
      if (options.queryKey[0] === "teacher-class") {
        const cId = options.queryKey[1];
        if (cId === "class-1") {
          return {
            data: { students: [{ id: "student-1", display_name: "Student 1" }] },
            isLoading: false,
          };
        }
        if (cId === "class-2") {
          return {
            data: { students: [{ id: "student-3", display_name: "Student 3" }] },
            isLoading: false,
          };
        }
      }
      return { data: null, isLoading: false };
    },
  };
});

vi.mock("@/lib/useServerFn", () => ({
  useServerFn: vi.fn((fn) => fn),
}));

vi.mock("@/lib/teacher.functions", () => ({
  listClasses: vi.fn(),
  getClass: vi.fn(),
}));

vi.mock("@/lib/folder-assignments.functions", () => ({
  createFolderAssignment: vi.fn(),
}));

describe("AssignActivityModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears selected students when class changes", async () => {
    render(
      <AssignActivityModal folderKey="guia" lessonId="1" activityLabel="Activity 1" onClose={vi.fn()} />
    );

    // Select class 1
    const classSelect = screen.getByRole("combobox");
    fireEvent.change(classSelect, { target: { value: "class-1" } });

    // Switch to "specific students"
    const specificStudentsBtn = screen.getByRole("button", { name: /estudiantes específicos/i });
    fireEvent.click(specificStudentsBtn);

    const student1Checkbox = screen.getByRole("checkbox"); // only 1 student rendered
    fireEvent.click(student1Checkbox);
    expect(student1Checkbox).toBeChecked();

    // Change to class 2
    fireEvent.change(classSelect, { target: { value: "class-2" } });

    // The checkboxes will re-render for class 2. There's 1 student (Student 3)
    const student3Checkbox = screen.getByRole("checkbox");
    expect(student3Checkbox).not.toBeChecked(); // Selection was cleared!

    // Select it
    fireEvent.click(student3Checkbox);
    expect(student3Checkbox).toBeChecked();

    const assignBtn = screen.getByRole("button", { name: "Asignar" });
    expect(assignBtn).not.toBeDisabled();

    // Submit
    vi.mocked(FolderAssignmentsFunctions.createFolderAssignment).mockResolvedValue({} as any);
    fireEvent.click(assignBtn);

    expect(FolderAssignmentsFunctions.createFolderAssignment).toHaveBeenCalledWith({
      data: expect.objectContaining({
        classId: "class-2",
        studentIds: ["student-3"],
      }),
    });
  });
});
