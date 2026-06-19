// Crash reporting + privacy-friendly analytics, both off unless their env var is set.
// Keeps local dev and forks (no Sentry/Vercel project configured) silent and dependency-free at runtime.
import * as Sentry from "@sentry/react";
import { inject as injectVercelAnalytics } from "@vercel/analytics";

const STUDENT_NAME_KEYS = new Set(["name", "studentName", "student_name", "fullName", "full_name"]);

function scrubStudentNames(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const scrub = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(scrub);
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[key] = STUDENT_NAME_KEYS.has(key) ? "[redacted]" : scrub(val);
      }
      return out;
    }
    return value;
  };
  return scrub(event) as Sentry.ErrorEvent;
}

export function initMonitoring(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0,
      beforeSend: scrubStudentNames,
    });
  }

  if (import.meta.env.VITE_VERCEL_ANALYTICS === "1") {
    injectVercelAnalytics();
  }
}
