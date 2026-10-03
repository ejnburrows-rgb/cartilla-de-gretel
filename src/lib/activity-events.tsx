import { learnerStorageKey } from "./learner-storage";
import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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
export function useActivityState<T>(field: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(ActivityContext);
  const key = context?.activityId ? learnerStorageKey(`cartilla.activity-state.v1:${context.activityId}:${field}`) : undefined;
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
