/**
 * @vitest-environment jsdom
 */

// Mock localStorage globally for testing environment
if (typeof window !== "undefined") {
  const store: Record<string, string> = {};
  Object.defineProperty(window, "localStorage", {
    value: {
      clear: () => { for (const k in store) delete store[k]; },
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = String(value); },
      removeItem: (key: string) => { delete store[key]; },
      length: 0,
      key: (index: number) => "",
    },
    writable: true,
  });
}
if (typeof global !== "undefined") {
  const store: Record<string, string> = {};
  Object.defineProperty(global, "localStorage", {
    value: {
      clear: () => { for (const k in store) delete store[k]; },
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = String(value); },
      removeItem: (key: string) => { delete store[key]; },
      length: 0,
      key: (index: number) => "",
    },
    writable: true,
  });
}

import { describe, it, expect, beforeEach } from "vitest";
import { joinClass, logProgress, getMyProgress } from "../student.functions";

describe("student.functions intercept tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should intercept joinClass for DEMO joinCode", async () => {
    // Setup initial seed state in localStorage
    const demoState = {
      classes: [
        {
          id: "seed-class-demo",
          teacher_id: "seed-teacher-leonor",
          name: "Clase de Prueba (Demo Local)",
          join_code: "DEMO12",
          created_at: new Date().toISOString(),
        }
      ],
      students: [
        {
          id: "seed-student-demo",
          class_id: "seed-class-demo",
          display_name: "Estudiante Demo (Local)",
          student_code: "DEMO1",
          created_at: new Date().toISOString(),
        }
      ],
      events: [],
      assignments: [],
    };
    localStorage.setItem("cartilla.seed.state.v1", JSON.stringify(demoState));

    const result = await joinClass({
      data: {
        joinCode: "DEMO12",
        studentCode: "DEMO1",
      },
    });

    expect(result.studentId).toBe("seed-student-demo");
    expect(result.studentName).toBe("Estudiante Demo (Local)");
    expect(result.classId).toBe("seed-class-demo");
  });

  it("should intercept logProgress for demo student ID", async () => {
    const demoState = {
      classes: [],
      students: [],
      events: [],
      assignments: [],
    };
    localStorage.setItem("cartilla.seed.state.v1", JSON.stringify(demoState));

    const result = await logProgress({
      data: {
        studentId: "seed-student-demo",
        studentCode: "DEMO1",
        lessonId: "1",
        kind: "lesson_completed",
      },
    });

    expect(result.ok).toBe(true);

    const updatedStateRaw = localStorage.getItem("cartilla.seed.state.v1");
    expect(updatedStateRaw).toBeDefined();
    const updatedState = JSON.parse(updatedStateRaw!);
    expect(updatedState.events).toHaveLength(1);
    expect(updatedState.events[0].student_id).toBe("seed-student-demo");
    expect(updatedState.events[0].event_kind).toBe("lesson_completed");
  });

  it("should intercept getMyProgress for demo student ID", async () => {
    const demoState = {
      classes: [],
      students: [
        {
          id: "seed-student-demo",
          class_id: "seed-class-demo",
          display_name: "Estudiante Demo (Local)",
          student_code: "DEMO1",
          created_at: new Date().toISOString(),
        }
      ],
      events: [
        {
          id: "event-1",
          student_id: "seed-student-demo",
          lesson_id: "1",
          event_kind: "lesson_completed",
          score: null,
          total: null,
          time_seconds: null,
          meta: null,
          created_at: new Date().toISOString(),
        }
      ],
      assignments: [],
    };
    localStorage.setItem("cartilla.seed.state.v1", JSON.stringify(demoState));

    const result = (await getMyProgress({
      data: {
        studentId: "seed-student-demo",
        studentCode: "DEMO1",
      },
    })) as any;

    expect(result.events).toHaveLength(1);
    expect(result.events[0].event_kind).toBe("lesson_completed");
    expect(result.lessonProgress).toHaveLength(1);
    expect(result.lessonProgress[0].lesson_id).toBe("1");
  });
});
