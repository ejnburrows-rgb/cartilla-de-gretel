/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Demo mode is env-gated; force it on for these tests before importing.
vi.stubEnv("VITE_ALLOW_DEMO_MODE", "true");

import {
  SEED_TEACHERS,
  getSeedAdminOverview,
  getSeedClassProgress,
  isSeedAdmin,
  listSeedClasses,
} from "../seed-data";

const AUTH_KEY = "cartilla.seed.teacher.v1";
const STATE_KEY = "cartilla.seed.state.v1";

describe("admin cross-teacher overview (demo lane, D7)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("covers every seed teacher and only their own classes", () => {
    const overview = getSeedAdminOverview();
    expect(overview.teachers.map((t) => t.teacherId).sort()).toEqual(
      SEED_TEACHERS.map((t) => t.id).sort(),
    );
    // Both demo teachers ship with exactly one class each.
    for (const t of overview.teachers) {
      expect(t.classes.length).toBe(1);
    }
    expect(overview.totals.classCount).toBe(2);
    expect(overview.totals.teacherCount).toBe(2);
  });

  it("roll-up numbers match each class's own CRM progress view", () => {
    const overview = getSeedAdminOverview();
    for (const t of overview.teachers) {
      for (const c of t.classes) {
        const progress = getSeedClassProgress(c.classId);
        expect(c.studentCount).toBe(progress.perStudent.length);
        expect(c.lessonsCompleted).toBe(
          progress.perStudent.reduce((sum, s) => sum + s.lessonsCount, 0),
        );
        expect(c.attentionCount).toBe(
          Object.values(progress.attentionByStudent).filter((a) => a.flagged).length,
        );
      }
    }
  });

  it("global totals aggregate across teachers", () => {
    const overview = getSeedAdminOverview();
    const perTeacherStudents = overview.teachers.reduce((sum, t) => sum + t.studentCount, 0);
    expect(overview.totals.studentCount).toBe(perTeacherStudents);
    expect(overview.totals.studentCount).toBeGreaterThanOrEqual(8); // 5 Leonor + 3 Emilio
    expect(overview.totals.accuracy).not.toBeNull();
    expect(overview.totals.attentionCount).toBeGreaterThan(0); // Diego/Camila/Nicolás
  });

  it("migrates pre-admin stored demo states to include the second class", () => {
    // Simulate a demo state saved before the emilio slice existed.
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        classes: [
          {
            id: "seed-class-demo",
            teacher_id: "seed-teacher-leonor",
            name: "Clase de Prueba (Demo Local)",
            join_code: "DEMO12",
            created_at: new Date().toISOString(),
          },
        ],
        students: [],
        events: [],
        assignments: [],
      }),
    );
    const overview = getSeedAdminOverview();
    const allClassIds = overview.teachers.flatMap((t) => t.classes.map((c) => c.classId));
    expect(allClassIds).toContain("seed-class-emilio");
    // Leonor's (possibly user-edited) class is preserved, not reset.
    expect(allClassIds).toContain("seed-class-demo");
    // And a signed-in teacher still only lists their OWN classes.
    localStorage.setItem(AUTH_KEY, "seed-teacher-emilio");
    const emilioClasses = listSeedClasses() as { id: string }[];
    expect(emilioClasses.map((c) => c.id)).toEqual(["seed-class-emilio"]);
  });

  it("isSeedAdmin is true only for the admin seed account", () => {
    expect(isSeedAdmin()).toBe(false); // signed out
    localStorage.setItem(AUTH_KEY, "seed-teacher-emilio");
    expect(isSeedAdmin()).toBe(false); // regular teacher
    localStorage.setItem(AUTH_KEY, "seed-teacher-leonor");
    expect(isSeedAdmin()).toBe(true); // admin
  });
});
