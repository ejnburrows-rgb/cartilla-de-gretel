import { useEffect, useState } from "react";
import { clearEarnedRewards, earnLessonReward } from "@/lib/rewards";
import { getStudentSession } from "@/lib/student-session";

const KEY = "cartilla.lesson-progress.v1";

function activeKey() {
  const session = getStudentSession();
  return session ? `${KEY}.${session.classId}.${session.studentId}` : KEY;
}

function read(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(activeKey());
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
    localStorage.setItem(activeKey(), JSON.stringify([...set].sort((a, b) => a - b)));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  } catch {
    /* ignore */
  }
}

function completedList(set: Set<number>) {
  return [...set].filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
}

export function isLessonCompleted(n: number): boolean {
  return read().has(n);
}

export function isLessonUnlocked(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n <= 24;
}

export function hydrateLessonProgress(completedLessons: number[]) {
  const completed = new Set(completedLessons.filter((n) => Number.isFinite(n) && n > 0));
  write(completed);
  completedList(completed).forEach((lessonNumber) => earnLessonReward(lessonNumber, completedList(completed)));
}

export function markLessonCompleted(n: number) {
  const s = read();
  s.add(n);
  write(s);
  earnLessonReward(n, completedList(s));
}
export function resetProgress() {
  write(new Set());
  clearEarnedRewards();
}

export function useLessonProgress() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("storage", h);
    window.addEventListener("cartilla:lesson-progress", h);
    window.addEventListener("cartilla:rewards", h);
    window.addEventListener("cartilla:student-session", h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("cartilla:lesson-progress", h);
      window.removeEventListener("cartilla:rewards", h);
      window.removeEventListener("cartilla:student-session", h);
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
