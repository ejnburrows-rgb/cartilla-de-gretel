import { useEffect, useState } from "react";

const KEY = "cartilla.lesson-progress.v1";

function read(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr.filter((n) => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

function write(set: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...set].sort((a, b) => a - b)));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  } catch {
    /* ignore */
  }
}

export function isLessonCompleted(n: number): boolean {
  return read().has(n);
}
/** Open access exposes every lesson; otherwise preserve the sequential rule. */
export function isLessonUnlocked(n: number): boolean {
  if (
    import.meta.env.VITE_CRM_REVIEW === "true" &&
    import.meta.env.MODE !== "test"
  ) {
    return true;
  }
  if (n <= 1) return true;
  return read().has(n - 1);
}
export function hydrateLessonProgress(completedLessons: number[]) {
  write(new Set(completedLessons.filter((n) => Number.isFinite(n) && n > 0)));
}

export function markLessonCompleted(n: number) {
  const s = read();
  s.add(n);
  write(s);
}
export function resetProgress() {
  write(new Set());
  writePages({});
}

/* ── Page-level completion (same progress model, finer grain) ──────────────
 * Records which required workbook activities of a printed page the student
 * finished, keyed by printed page number. Fed only by the existing
 * `activity:complete` events of the workbook activities (see page-completion.ts). */
const PAGE_KEY = "cartilla.page-completion.v1";

function readPages(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePages(value: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  } catch {
    /* ignore */
  }
}

export function getCompletedPageActivities(pageNumber: number): string[] {
  const list = readPages()[String(pageNumber)];
  return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
}

export function markPageActivityCompleted(pageNumber: number, activityId: string) {
  const all = readPages();
  const list = new Set(all[String(pageNumber)] ?? []);
  if (list.has(activityId)) return;
  list.add(activityId);
  all[String(pageNumber)] = [...list];
  writePages(all);
}

export function useLessonProgress() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("storage", h);
    window.addEventListener("cartilla:lesson-progress", h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("cartilla:lesson-progress", h);
    };
  }, []);
  return {
    completed: read(),
    isCompleted: (n: number) => read().has(n),
    isUnlocked: isLessonUnlocked,
    markCompleted: markLessonCompleted,
    reset: resetProgress,
  };
}
