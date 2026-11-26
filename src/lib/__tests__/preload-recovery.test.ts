import { describe, expect, it } from "vitest";
import { shouldReloadAfterPreloadError } from "../preload-recovery";

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
    expect(shouldReloadAfterPreloadError(storage, 1_000_000)).toBe(true);
    expect(shouldReloadAfterPreloadError(storage, 1_030_000)).toBe(false);
  });

  it("allows another reload after the window passes", () => {
    const storage = memoryStorage();
    expect(shouldReloadAfterPreloadError(storage, 1_000_000)).toBe(true);
    expect(shouldReloadAfterPreloadError(storage, 1_061_000)).toBe(true);
  });

  it("does not reload when storage is unavailable", () => {
    const broken = { getItem: () => { throw new Error("blocked"); } } as unknown as Storage;
    expect(shouldReloadAfterPreloadError(broken)).toBe(false);
  });
});
