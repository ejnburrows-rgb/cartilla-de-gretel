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
/**
 * Sequential unlock (must complete L(n-1) before opening Ln).
 *
 * DEMO OVERRIDE: demo/full-show walkthrough unlocks every lesson so the
 * operator can jump to any of the 24 lessons without grinding L1→L23.
 * Product sequential gate remains one line away (set to false).
 */
const DEMO_UNLOCK_ALL = true;

export function isLessonUnlocked(n: number): boolean {
  if (DEMO_UNLOCK_ALL) return true;
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
