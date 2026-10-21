/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GRETEL_MASTER_PACK_PATH,
  TUTOR_PACK_CACHE_NAME,
  TUTOR_PACK_CACHE_PREFIX,
  TUTOR_PACK_MARKER_KEY,
  TUTOR_PACK_VERSION,
  VOSK_MODEL_PACK_PATH,
  downloadTutorPack,
  getTutorPackStatus,
  tutorPackFileList,
} from "../tutor-offline-pack";

// ---------------------------------------------------------------------------
// Mocked Cache Storage
// ---------------------------------------------------------------------------

class FakeCache {
  readonly store = new Map<string, Response>();

  async put(url: string | Request, response: Response): Promise<void> {
    this.store.set(String(url), response);
  }

  async match(url: string | Request): Promise<Response | undefined> {
    return this.store.get(String(url));
  }
}

const cacheStore = new Map<string, FakeCache>();

const fakeCaches = {
  open: async (name: string): Promise<FakeCache> => {
    let cache = cacheStore.get(name);
    if (!cache) {
      cache = new FakeCache();
      cacheStore.set(name, cache);
    }
    return cache;
  },
  keys: async (): Promise<string[]> => [...cacheStore.keys()],
  has: async (name: string): Promise<boolean> => cacheStore.has(name),
  delete: async (name: string): Promise<boolean> => cacheStore.delete(name),
};

const persistMock = vi.fn(async () => true);

// /tutor HTML padded to exactly 1024 bytes so byte-count assertions stay exact.
const TUTOR_HTML =
  '<!doctype html><html><head><link rel="stylesheet" href="/assets/tutor-style-1.css">' +
  '</head><body><script type="module" src="/assets/tutor-app-2.js"></script>' +
  '<script src="https://cdn.example.com/nope.js"></script></body></html>';
const TUTOR_HTML_PADDED = TUTOR_HTML + "<!--" + "x".repeat(1024 - TUTOR_HTML.length - 7) + "-->";
if (new TextEncoder().encode(TUTOR_HTML_PADDED).byteLength !== 1024) {
  throw new Error("test fixture drift: /tutor HTML must stay exactly 1024 bytes");
}

const fetchMock = vi.fn(async (url: string): Promise<Response> => {
  if (url === "/tutor") {
    return new Response(TUTOR_HTML_PADDED, {
      headers: { "Content-Type": "text/html" },
    });
  }
  if (url.includes("layers/manifest.json")) {
    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  }
  return new Response(new Uint8Array(1024), { status: 200 });
});

function seedExistingCaches(): { shell: FakeCache; audio: FakeCache } {
  const shell = new FakeCache();
  shell.store.set("/", new Response("home"));
  const audio = new FakeCache();
  audio.store.set("/audio/lecciones/1.mp3", new Response("lesson audio"));
  cacheStore.set("cartilla:shell:v2.0.0", shell);
  cacheStore.set("cartilla:assets:v2.0.0", new FakeCache());
  cacheStore.set("cartilla:audio:v2.0.0", audio);
  cacheStore.set("cartilla:book:v2.0.0", new FakeCache());
  return { shell, audio };
}

beforeEach(() => {
  cacheStore.clear();
  localStorage.clear();
  vi.stubGlobal("caches", fakeCaches);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  persistMock.mockClear();
  Object.defineProperty(window.navigator, "storage", {
    configurable: true,
    value: { persist: persistMock },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tutorPackFileList (derived from src/content/tutor-lines.json)", () => {
  it("includes the tutor routes, the Vosk model, the approved master, and all 43 approved recordings", () => {
    const files = tutorPackFileList();
    expect(files).toContain("/tutor");
    expect(files).toContain("/tutor/3");
    expect(files).toContain(VOSK_MODEL_PACK_PATH);
    expect(files).toContain(GRETEL_MASTER_PACK_PATH);
    const mp3s = files.filter((file) => file.endsWith(".mp3"));
    expect(mp3s).toHaveLength(43);
    expect(files).toContain("/audio/voz/vocabulario/oso.mp3");
    expect(files).toContain("/audio/voz/vocabulario/abanico.mp3");
  });

  it("uses the dedicated pack cache name, never an app cache name", () => {
    expect(TUTOR_PACK_CACHE_NAME).toBe(`${TUTOR_PACK_CACHE_PREFIX}${TUTOR_PACK_VERSION}`);
    expect(TUTOR_PACK_CACHE_NAME.startsWith("cartilla:tutor:")).toBe(true);
  });
});

describe("downloadTutorPack", () => {
  it("downloads every pack file into the dedicated cartilla:tutor:<version> cache", async () => {
    const status = await downloadTutorPack();
    expect(status.state).toBe("done");
    if (status.state !== "done") return;
    expect(status.version).toBe(TUTOR_PACK_VERSION);

    expect(cacheStore.has(TUTOR_PACK_CACHE_NAME)).toBe(true);
    const pack = cacheStore.get(TUTOR_PACK_CACHE_NAME)!;
    for (const file of tutorPackFileList()) {
      expect(await pack.match(file)).toBeDefined();
    }
    // /tutor app code discovered from the /tutor document:
    expect(await pack.match("/assets/tutor-app-2.js")).toBeDefined();
    expect(await pack.match("/assets/tutor-style-1.css")).toBeDefined();
    // External CDN scripts are never packed:
    expect(fetchMock).not.toHaveBeenCalledWith("https://cdn.example.com/nope.js");
    expect(await pack.match("https://cdn.example.com/nope.js")).toBeUndefined();
  });

  it("leaves every existing app cache untouched", async () => {
    const { shell, audio } = seedExistingCaches();
    await downloadTutorPack();

    // Exactly one new cache appears — the pack. Nothing else.
    expect([...cacheStore.keys()].sort()).toEqual(
      [
        "cartilla:assets:v2.0.0",
        "cartilla:audio:v2.0.0",
        "cartilla:book:v2.0.0",
        "cartilla:shell:v2.0.0",
        TUTOR_PACK_CACHE_NAME,
      ].sort(),
    );
    // Pre-existing entries unchanged:
    expect(await shell.match("/")).toBeDefined();
    expect(await audio.match("/audio/lecciones/1.mp3")).toBeDefined();
    expect(audio.store.size).toBe(1);
    // Pack audio (the 43 picture recordings) never leaks into the app audio cache:
    expect(await audio.match("/audio/voz/vocabulario/oso.mp3")).toBeUndefined();
  });

  it("requests persistent storage so the browser is less likely to clear the pack", async () => {
    await downloadTutorPack();
    expect(persistMock).toHaveBeenCalledTimes(1);
  });

  it("reports downloading progress with real byte counts", async () => {
    const progress: {
      state: string;
      receivedBytes?: number;
      filesDone?: number;
      filesTotal?: number;
    }[] = [];
    await downloadTutorPack((state) => progress.push(state as never));
    const downloading = progress.filter((state) => state.state === "downloading");
    expect(downloading.length).toBeGreaterThan(0);
    expect(downloading[0].receivedBytes).toBe(1024); // first file fetched, then reported
    const last = downloading[downloading.length - 1];
    expect(last.filesDone).toBe(last.filesTotal);
    expect(last.receivedBytes).toBe(last.filesTotal! * 1024); // every file mocked at 1024 bytes
  });

  it("skips missing files instead of failing, and reports the skipped count", async () => {
    fetchMock.mockImplementation(async (url: string | unknown): Promise<Response> => {
      if (url === VOSK_MODEL_PACK_PATH) {
        return new Response("missing", { status: 404 });
      }
      return new Response(new Uint8Array(10), { status: 200 });
    });
    const status = await downloadTutorPack();
    expect(status.state).toBe("done");
    if (status.state !== "done") return;
    expect(status.skippedFiles).toBeGreaterThanOrEqual(1);
    expect(status.filesTotal).toBeGreaterThanOrEqual(1);
  });
});

describe("getTutorPackStatus — cleared storage", () => {
  it("is idle before any download", async () => {
    expect(await getTutorPackStatus()).toEqual({ state: "idle" });
  });

  it("is done (with version) after a download", async () => {
    await downloadTutorPack();
    const status = await getTutorPackStatus();
    expect(status).toEqual({
      state: "done",
      version: TUTOR_PACK_VERSION,
      filesTotal: expect.any(Number),
      skippedFiles: expect.any(Number),
    });
  });

  it("shows the re-prepare state when the browser cleared the pack cache", async () => {
    await downloadTutorPack();
    expect((await getTutorPackStatus()).state).toBe("done");

    // Browser storage cleanup removes the cache but the marker remains:
    await fakeCaches.delete(TUTOR_PACK_CACHE_NAME);
    expect(await getTutorPackStatus()).toEqual({ state: "cleared" });

    // Re-preparing works and returns to done:
    const again = await downloadTutorPack();
    expect(again.state).toBe("done");
    expect((await getTutorPackStatus()).state).toBe("done");
  });

  it("shows the re-prepare state for an interrupted download (cache without marker)", async () => {
    const cache = await fakeCaches.open(TUTOR_PACK_CACHE_NAME);
    await cache.put("/tutor", new Response("partial"));
    expect(await getTutorPackStatus()).toEqual({ state: "cleared" });
  });

  it("returns to idle when both the cache and the marker are gone", async () => {
    await downloadTutorPack();
    await fakeCaches.delete(TUTOR_PACK_CACHE_NAME);
    localStorage.removeItem(TUTOR_PACK_MARKER_KEY);
    expect(await getTutorPackStatus()).toEqual({ state: "idle" });
  });
});
