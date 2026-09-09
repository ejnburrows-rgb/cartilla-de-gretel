import { afterEach, expect, it, vi } from "vitest";
import { isSeedSessionActive, startTeacherReview } from "../seed-data";
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
