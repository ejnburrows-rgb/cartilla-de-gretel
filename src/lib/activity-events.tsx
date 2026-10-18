import { learnerStorageKey } from "./learner-storage";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { gretelEvent, type GretelBusDetail, type GretelBusEvent } from './gretel-bus';
import { recordEvent } from './student-session';

export type ActivityContextValue = GretelBusDetail & { isCurrent: () => boolean };
export const ActivityContext = createContext<ActivityContextValue | null>(null);

/** Bind delayed answers and reports to their originating activity, never focus. */
export function useActivityEvents() {
  const context = useContext(ActivityContext);
  const emit = useCallback((type: GretelBusEvent, detail?: GretelBusDetail) => {
    if (!context) { if (detail) gretelEvent(type, detail); else gretelEvent(type); return; }
    if (!context.isCurrent()) return;
    const { isCurrent: _isCurrent, ...identity } = context;
    gretelEvent(type, { ...detail, ...identity });
  }, [context]);
  const record = useCallback((input: Parameters<typeof recordEvent>[0]) => {
    if (context && !context.isCurrent()) return;
    const { isCurrent: _isCurrent, ...identity } = context ?? {};
    recordEvent({ ...input, meta: { ...input.meta, ...identity } });
  }, [context]);
  return { emit, record, context };
}

/** Preserve the existing control's state across page remounts, including Sets. */
export function useActivityState<T>(field: string, initial: T, enabled = true): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(ActivityContext);
  const key = enabled && context?.activityId ? learnerStorageKey(`cartilla.activity-state.v1:${context.activityId}:${field}`) : undefined;
  const [value, setValue] = useState<T>(() => {
    if (!key) return initial;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      if (initial instanceof Set) {
        return Array.isArray(parsed) && parsed.every(item => typeof item === "string" || typeof item === "number") ? new Set(parsed) as T : initial;
      }
      if (parsed !== null && typeof parsed === typeof initial && (Array.isArray(initial) === Array.isArray(parsed))) return parsed as T;
    } catch { /* unavailable storage must not block the activity */ }
    return initial;
  });
  useEffect(() => {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(value instanceof Set ? [...value] : value)); } catch { window.dispatchEvent(new Event("cartilla:work-save-failed")); }
  }, [key, value]);
  return [value, setValue];
}

/** Owner's Lesson 3 proof policy; other lessons retain their existing retries. */
export function useLesson3Retry(lessonId?: string) {
  const [counts, setCounts] = useActivityState<Record<string, number>>("lesson3Retries", {}, lessonId === "3");
  const current = useRef(counts);
  current.current = counts;
  const isProof = lessonId === "3";
  return {
    isProof,
    attempt(itemId: string): boolean {
      if (!isProof) return true;
      const count = current.current[itemId] ?? 0;
      if (count >= 3) return false;
      current.current = { ...current.current, [itemId]: count + 1 };
      setCounts(current.current);
      return true;
    },
    text(itemId: string): string | undefined {
      if (!isProof) return undefined;
      const count = current.current[itemId] ?? 0;
      return count >= 3
        ? "Casi. Escucha otra vez. Ya probaste 3 veces este dibujo; busca otro que comience con A."
        : `Casi. Escucha otra vez. Intento ${count} de 3.`;
    },
  };
}
