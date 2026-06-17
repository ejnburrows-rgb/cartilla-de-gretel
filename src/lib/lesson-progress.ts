import { useEffect, useState } from "react";
import { useServerFn } from "@/lib/useServerFn";
import { getMyProgress } from "@/lib/student.functions";

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
export function isLessonUnlocked(n: number): boolean {
  if (n <= 1) return true;
  return read().has(n - 1);
}
/**
 * Merge cloud-completed lessons into local progress.
 *
 * Union (not overwrite): a lesson completed locally OR in the cloud stays
 * completed. There is no "un-complete" flow in the product, so cloud state
 * must never erase a local completion — this guards against a slow cloud
 * fetch racing a fresh local `markLessonCompleted` (e.g. flaky network at the
 * moment of finishing a lesson). An empty cloud result is a no-op.
 */
export function hydrateLessonProgress(completedLessons: number[]) {
  const incoming = completedLessons.filter((n) => Number.isFinite(n) && n > 0);
  if (incoming.length === 0) return;
  write(new Set([...read(), ...incoming]));
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

/**
 * Hydrate local lesson progress from the cloud for a signed-in student.
 *
 * Fire-and-forget on mount. Pulls completed lessons from both the
 * `student_lesson_progress` rows and raw `lesson_completed` events returned by
 * `get_student_progress`, then merges them into local state via the union-safe
 * `hydrateLessonProgress`. Safe to call on any student route — it short-circuits
 * when there is no session (anonymous students stay local-only by design).
 *
 * This is the shared version of the logic that lived inline in the lecciones
 * index; the single-lesson routes call it so a student who deep-links or
 * refreshes straight into a lesson still gets their real completion state
 * (otherwise lessons could appear locked that were already finished).
 */
export function useCloudLessonHydration(
  session: { studentId: string; studentCode: string } | null,
) {
  const fetchMyProgress = useServerFn(getMyProgress);
  useEffect(() => {
    if (!session) return;
    fetchMyProgress({ data: { studentId: session.studentId, studentCode: session.studentCode } })
      .then((data) => {
        const fromRows = (
          (data as { lessonProgress?: Array<{ lesson_id: string; status: string }> })
            .lessonProgress ?? []
        )
          .filter((row) => row.status === "completed")
          .map((row) => Number(row.lesson_id))
          .filter((n) => Number.isFinite(n));
        const fromEvents = (
          (data as { events?: Array<{ lesson_id: string; event_kind: string }> }).events ?? []
        )
          .filter((event) => event.event_kind === "lesson_completed")
          .map((event) => Number(event.lesson_id))
          .filter((n) => Number.isFinite(n));
        hydrateLessonProgress(Array.from(new Set([...fromRows, ...fromEvents])));
      })
      .catch(() => undefined);
  }, [fetchMyProgress, session]);
}
