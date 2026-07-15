export interface LocalErrorLog {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
}

const LOCAL_MONITOR_KEY = "cartilla:telemetry:errors";

export const localMonitor = {
  logError(error: Error | string) {
    if (typeof window === "undefined") return;

    try {
      const logs: LocalErrorLog[] = JSON.parse(localStorage.getItem(LOCAL_MONITOR_KEY) ?? "[]");

      const newLog: LocalErrorLog = {
        message: typeof error === "string" ? error : error.message,
        stack: typeof error === "string" ? undefined : error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Add to beginning of logs array and keep last 50 entries
      const updatedLogs = [newLog, ...logs].slice(0, 50);
      localStorage.setItem(LOCAL_MONITOR_KEY, JSON.stringify(updatedLogs));
    } catch {
      // ignore
    }
  },

  getErrors(): LocalErrorLog[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(LOCAL_MONITOR_KEY) ?? "[]");
    } catch {
      return [];
    }
  },

  clearErrors() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_MONITOR_KEY);
  },
};
export type LocalMonitor = typeof localMonitor;
