import { countsForLiteracy } from "./progress-semantics";
import { useEffect, useState } from "react";

export type ExerciseStat = {
  attempts: number;
  hits: number;
  lastUpdated: number;
  completedRounds: number;
  meta?: Record<string, unknown>;
};

export type LessonStats = Record<string, ExerciseStat>;
export type AllStats = Record<string, LessonStats>;

const KEY = "cartilla.exercise-stats.v1";
const EVENT = "cartilla:exercise-stats";

function read(): AllStats {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AllStats) : {};
  } catch {
    return {};
  }
}

function write(s: AllStats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function recordExerciseStat(input: {
  lessonId: string;
  exercise: string;
  score: number;
  total: number;
  completed?: boolean;
  meta?: Record<string, unknown>;
}) {
  if (!input.lessonId || !input.exercise) return;
  const all = read();
  const lesson = all[input.lessonId] ?? {};
  const prev = lesson[input.exercise] ?? {
    attempts: 0,
    hits: 0,
    lastUpdated: 0,
    completedRounds: 0,
  };
  // Use latest snapshot as authoritative for this round (recordEvent sends cumulative per session)
  lesson[input.exercise] = {
    attempts: input.total ?? 0,
    hits: input.score ?? 0,
    completedRounds: prev.completedRounds + (input.completed ? 1 : 0),
    lastUpdated: Date.now(),
    meta: input.meta,
  };
  all[input.lessonId] = lesson;
  write(all);
}

export function getStats(): AllStats {
  return read();
}

export function resetStats() {
  write({});
}

/** A lesson is "weak" if any exercise has accuracy < 0.7 with at least 3 attempts. */
export function isLessonWeak(lessonId: string, stats: AllStats = read()): boolean {
  const lesson = stats[lessonId];
  if (!lesson) return false;
  return Object.entries(lesson).some(
    ([exercise, s]) => countsForLiteracy({ ...s.meta, exercise }) && s.attempts >= 3 && s.hits / Math.max(s.attempts, 1) < 0.7,
  );
}

export function lessonAccuracy(lessonId: string, stats: AllStats = read()): number | null {
  const lesson = stats[lessonId];
  if (!lesson) return null;
  let h = 0,
    a = 0;
  for (const [exercise, s] of Object.entries(lesson)) {
    if (!countsForLiteracy({ ...s.meta, exercise })) continue;
    h += s.hits;
    a += s.attempts;
  }
  return a > 0 ? h / a : null;
}

export function useExerciseStats() {
  const [stats, setStats] = useState<AllStats>({});
  useEffect(() => {
    setStats(read());
    const h = () => setStats(read());
    window.addEventListener("storage", h);
    window.addEventListener(EVENT, h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener(EVENT, h);
    };
  }, []);
  return stats;
}
