import { learnerStorageKey } from "./learner-storage";
import { KEYS } from "./storage-keys";

export type LearnerResume = { lesson: number; page: number; printedPage?: number; pageId?: string };
export function readLearnerResume(lesson?: number): LearnerResume | null {
  try {
    const key = learnerStorageKey(KEYS.learnerResume + (lesson ? `:${lesson}` : ""));
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return value && Number.isInteger(value.lesson) && value.lesson >= 1 && value.lesson <= 24 &&
      Number.isInteger(value.page) && value.page >= 0 ? value : null;
  } catch { return null; }
}
export function saveLearnerResume(lesson: number, page: number, printedPage?: number, pageId?: string) {
  try {
    const value = JSON.stringify({ lesson, page, ...(typeof printedPage === "number" && Number.isInteger(printedPage) ? { printedPage } : {}), ...(pageId ? { pageId } : {}) });
    localStorage.setItem(learnerStorageKey(`${KEYS.learnerResume}:${lesson}`), value);
    localStorage.setItem(learnerStorageKey(KEYS.learnerResume), value);
  } catch {
    window.dispatchEvent(new Event("cartilla:work-save-failed"));
  }
}
