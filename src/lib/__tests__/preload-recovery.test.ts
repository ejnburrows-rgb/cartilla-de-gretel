import { describe, expect, it, vi } from "vitest";
import { installPreloadRecovery, shouldReloadAfterPreloadError } from "../preload-recovery";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

describe("shouldReloadAfterPreloadError", () => {
  it("reloads once, then not again within a minute", () => {
    const storage = memoryStorage();
    expect(shouldReloadAfterPreloadError(() => storage, 1_000_000)).toBe(true);
    expect(shouldReloadAfterPreloadError(() => storage, 1_030_000)).toBe(false);
  });

  it("allows another reload after the window passes", () => {
    const storage = memoryStorage();
    expect(shouldReloadAfterPreloadError(() => storage, 1_000_000)).toBe(true);
    expect(shouldReloadAfterPreloadError(() => storage, 1_061_000)).toBe(true);
  });

  it("does not reload when storage is unavailable", () => {
    const broken = { getItem: () => { throw new Error("blocked"); } } as unknown as Storage;
    expect(shouldReloadAfterPreloadError(() => broken)).toBe(false);
  });

  it("does not throw when reading sessionStorage itself is blocked", () => {
    const listeners: Array<(e: Event) => void> = [];
    const reload = vi.fn();
    const win = {
      addEventListener: (_type: string, fn: (e: Event) => void) => listeners.push(fn),
      get sessionStorage(): Storage {
        throw new DOMException("blocked", "SecurityError");
      },
      location: { reload },
    } as unknown as Window;
    installPreloadRecovery(win);
    const event = new Event("vite:preloadError", { cancelable: true });
    expect(() => listeners[0](event)).not.toThrow();
    expect(event.defaultPrevented).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads once through the installed listener", () => {
    const listeners: Array<(e: Event) => void> = [];
    const reload = vi.fn();
    const storage = memoryStorage();
    const win = {
      addEventListener: (_type: string, fn: (e: Event) => void) => listeners.push(fn),
      sessionStorage: storage,
      location: { reload },
    } as unknown as Window;
    installPreloadRecovery(win);
    const first = new Event("vite:preloadError", { cancelable: true });
    listeners[0](first);
    listeners[0](new Event("vite:preloadError", { cancelable: true }));
    expect(first.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
