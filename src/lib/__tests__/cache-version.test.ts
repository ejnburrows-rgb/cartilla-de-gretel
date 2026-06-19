import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CACHE_VERSION, CACHE_NAMES } from "@/lib/cache-version";

describe("cache-version", () => {
  it("stamps the version into every cache bucket name", () => {
    for (const name of Object.values(CACHE_NAMES)) {
      expect(name).toContain(CACHE_VERSION);
      expect(name.startsWith("cartilla:")).toBe(true);
    }
  });

  it("uses a distinct cache name per bucket", () => {
    const names = Object.values(CACHE_NAMES);
    expect(new Set(names).size).toBe(names.length);
  });

  // Regression guard for the exact failure this app has hit before: the service
  // worker and the app module each hard-code CACHE_VERSION, and they MUST agree —
  // a drift means the SW never drops the stale offline cache after a deploy.
  it("matches the CACHE_VERSION hard-coded in public/sw.js", () => {
    const swPath = fileURLToPath(new URL("../../../public/sw.js", import.meta.url));
    const sw = readFileSync(swPath, "utf-8");
    const match = sw.match(/CACHE_VERSION\s*=\s*["']([^"']+)["']/);
    expect(match, "could not find CACHE_VERSION in public/sw.js").not.toBeNull();
    expect(match![1]).toBe(CACHE_VERSION);
  });
});
