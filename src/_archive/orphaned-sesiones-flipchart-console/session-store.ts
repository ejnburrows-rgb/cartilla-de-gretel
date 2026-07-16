import { useSyncExternalStore } from "react";

export interface SessionState {
  lessonN: number;
  stepIdx: number;
  fontScale: 100 | 125 | 150;
  dyslexic: boolean;
  highContrast: boolean;
  lineSpacing: "normal" | "tight" | "loose";
}

const DEFAULT_STATE: SessionState = {
  lessonN: 1,
  stepIdx: 0,
  fontScale: 100,
  dyslexic: false,
  highContrast: false,
  lineSpacing: "normal",
};

const KEY = "cartilla:session:v1";

let currentState: SessionState = (() => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    /* ignore fallback */
  }
  return DEFAULT_STATE;
})();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function applyAccessibility(state: SessionState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-ax-scale", String(state.fontScale));
  root.setAttribute("data-ax-dyslexic", String(state.dyslexic));
  root.setAttribute("data-ax-contrast", String(state.highContrast));
  root.setAttribute("data-ax-line-spacing", state.lineSpacing);
}

export const sessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return currentState;
  },
  update(next: Partial<SessionState>) {
    currentState = { ...currentState, ...next };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEY, JSON.stringify(currentState));
      } catch {
        /* ignore fallback */
      }
      applyAccessibility(currentState);
    }
    emit();
  },
};

export function useSessionStore() {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    () => DEFAULT_STATE,
  );
}

// Apply initially on load
if (typeof window !== "undefined") {
  applyAccessibility(currentState);
}
