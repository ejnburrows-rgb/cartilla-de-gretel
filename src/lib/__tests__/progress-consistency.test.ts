/**
 * @vitest-environment jsdom
 *
 * Item 3 of the security/data-guardrails work: teacher progress, admin
 * summaries, student detail, CSV export and family reports must all report
 * the same numbers for the same child. This runs one fixture through the
 * seed-lane surfaces (which back the demo teacher progress/admin roll-up/
 * student-detail/family-report screens) and the CSV export formatter, and
 * asserts they agree. The live-database equivalent (getClassProgress
 * ignoring a stray event with no matching status row) is covered in
 * teacher.functions.test.ts; the admin roll-up reconciling against
 * getSeedClassProgress is covered in seed-admin-overview.test.ts — this file
 * adds the piece those two don't: student detail/family report vs. teacher
 * progress for the very same student.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.stubEnv("VITE_ALLOW_DEMO_MODE", "true");

import {
  signInSeedTeacher,
  createSeedClass,
  addSeedStudents,
  logSeedProgress,
  getSeedClassProgress,
  getSeedTeacherStudentProgress,
} from "../seed-data";
import { exportClassProgressCsv } from "../csv-export";

function captureDownload() {
  let capturedBlob: Blob | null = null;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    capturedBlob = blob;
    return "blob:mock-url";
  });
  URL.revokeObjectURL = vi.fn();
  const realCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = realCreateElement(tag);
    if (tag === "a") el.click = vi.fn();
    return el;
  });
  return { getBlob: () => capturedBlob };
}

describe("progress totals agree across surfaces (seed lane fixture)", () => {
  beforeEach(() => {
    localStorage.clear();
    signInSeedTeacher("leonore@cartilla.local", "Cartilla2026!");
  });

  it("student detail (family report source) matches teacher progress for the same child", () => {
    const cls = createSeedClass("Fixture 3ºA");
    const [ana, beto] = addSeedStudents(cls.id, ["Ana Synthetic", "Beto Synthetic"]);

    // Ana: lesson 1 completed, lesson 2 only attempted (no lesson_completed).
    logSeedProgress({ studentId: ana.id, lessonId: "1", kind: "lesson_completed" });
    logSeedProgress({ studentId: ana.id, lessonId: "2", kind: "exercise", score: 2, total: 4 });
    // Beto: nothing completed, one exercise attempt only.
    logSeedProgress({ studentId: beto.id, lessonId: "1", kind: "exercise", score: 1, total: 2 });

    const anaDetail = getSeedTeacherStudentProgress(ana.id);
    const betoDetail = getSeedTeacherStudentProgress(beto.id);
    const classProgress = getSeedClassProgress(cls.id);

    const anaInClass = classProgress.perStudent.find((s) => s.id === ana.id);
    const betoInClass = classProgress.perStudent.find((s) => s.id === beto.id);

    expect(anaDetail.summary.completedLessons).toBe(1);
    expect(anaDetail.summary.completedLessons).toBe(anaInClass?.lessonsCount);
    expect(betoDetail.summary.completedLessons).toBe(0);
    expect(betoDetail.summary.completedLessons).toBe(betoInClass?.lessonsCount);
  });

  it("the CSV export shows the exact same completed-lesson count as the teacher progress view", async () => {
    const cls = createSeedClass("Fixture 3ºB");
    const [carla] = addSeedStudents(cls.id, ["Carla Synthetic"]);
    logSeedProgress({ studentId: carla.id, lessonId: "1", kind: "lesson_completed" });
    logSeedProgress({ studentId: carla.id, lessonId: "2", kind: "lesson_completed" });

    const classProgress = getSeedClassProgress(cls.id);
    const carlaInClass = classProgress.perStudent.find((s) => s.id === carla.id)!;
    expect(carlaInClass.lessonsCount).toBe(2);

    const capture = captureDownload();
    exportClassProgressCsv(cls.name, [], { perStudent: classProgress.perStudent });
    const text = await capture.getBlob()!.text();
    const carlaLine = text.split("\n").find((line) => line.includes("Carla Synthetic"));
    expect(carlaLine).toContain(`,${carlaInClass.lessonsCount},`);
  });
});
