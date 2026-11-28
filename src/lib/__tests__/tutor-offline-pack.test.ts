import { webcrypto, createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TUTOR_ALL_ROUTES,
  TUTOR_BUILD_ID,
  TUTOR_PACK_CACHE_NAME,
  TUTOR_PACK_CONTROL_CACHE,
  TUTOR_PACK_POINTER,
  TUTOR_PACK_REGISTRY_POINTER,
  TUTOR_PACK_CACHE_PREFIX,
  TUTOR_PACK_VERSION,
  VOSK_MODEL_PACK_PATH,
  GRETEL_MASTER_PACK_PATH,
  downloadTutorPack,
  downloadTutorPackSlot,
  getTutorPackStatus,
  listTutorPackSlots,
  tutorPackFileList,
  lessonPackFileList,
  clearTutorPack,
  clearTutorPackSlot,
  getTutorStorageSummary,
  recoverTutorPackStorage,
  loadLessonDialogueManifest,
  getLoadedDialogueLessons,
  clearLoadedDialogueCache,
  preloadLikelyNextLines,
} from "../tutor-offline-pack";

class FakeCache {
  store = new Map<string, Response>();
  async put(url: string | Request, response: Response) {
    this.store.set(String(url), response.clone());
  }
  async match(url: string | Request) {
    return this.store.get(String(url))?.clone();
  }
}

const stores = new Map<string, FakeCache>();
const cachesMock = {
  async open(name: string) {
    if (!stores.has(name)) stores.set(name, new FakeCache());
    return stores.get(name)!;
  },
  async keys() {
    return [...stores.keys()];
  },
  async has(name: string) {
    return stores.has(name);
  },
  async delete(name: string) {
    return stores.delete(name);
  },
};

const asset = (url: string, text: string) => ({
  url,
  bytes: Buffer.byteLength(text),
  sha256: createHash("sha256").update(text).digest("hex"),
});

const bodies = new Map<string, string>();
function response(url: string): Response {
  if (!bodies.has(url)) return new Response("absent", { status: 404 });
  return new Response(bodies.get(url), {
    headers: {
      "Content-Type":
        /^\/tutor(?:\/\d+)?$/.test(url)
          ? "text/html"
          : url.endsWith(".json")
            ? "application/json"
            : "application/octet-stream",
    },
  });
}

const fetchMock = vi.fn(async (url: string) => response(url));

beforeEach(() => {
  stores.clear();
  bodies.clear();
  localStorage.clear();
  clearLoadedDialogueCache();

  for (const url of tutorPackFileList()) bodies.set(url, url.endsWith(".json") ? "{}" : "binary");
  bodies.set("/cartilla/images/gretel/layers/manifest.json", '{"layers":[]}');
  for (const url of TUTOR_ALL_ROUTES) {
    bodies.set(url, '<html><script src="/assets/main.js"></script></html>');
  }
  bodies.set("/tutor-dialogue/universal.json", '{"version":2,"scope":"universal","entries":[]}');
  bodies.set("/tutor-dialogue/lesson-01.json", '{"version":2,"scope":"lesson","lesson":1,"entries":[]}');
  bodies.set("/tutor-dialogue/lesson-07.json", '{"version":2,"scope":"lesson","lesson":7,"entries":[]}');
  bodies.set("/tutor-dialogue/lesson-24.json", '{"version":2,"scope":"lesson","lesson":24,"entries":[]}');
  bodies.set("/assets/main.js", 'import("./lazy.js")');
  bodies.set("/assets/lazy.js", "export const lesson = 1");
  bodies.set("/assets/style.css", "body{color:black}");

  const allManifestFiles = [...bodies]
    .filter(
      ([url]) =>
        url.startsWith("/assets/") ||
        url === VOSK_MODEL_PACK_PATH ||
        url === GRETEL_MASTER_PACK_PATH ||
        url.startsWith("/tutor-dialogue/"),
    )
    .map(([url, text]) => asset(url, text));

  bodies.set(
    "/tutor-assets.json",
    JSON.stringify({
      buildId: TUTOR_BUILD_ID,
      packVersion: TUTOR_PACK_VERSION,
      files: allManifestFiles,
      packs: {
        universal: {
          id: "universal",
          files: allManifestFiles.filter(
            (a) => a.url.startsWith("/assets/") || a.url === "/tutor-dialogue/universal.json",
          ),
          totalBytes: 120,
        },
        avatar: {
          id: "avatar",
          files: [asset(GRETEL_MASTER_PACK_PATH, bodies.get(GRETEL_MASTER_PACK_PATH)!)],
          totalBytes: 6,
        },
        vosk: {
          id: "vosk",
          files: [asset(VOSK_MODEL_PACK_PATH, bodies.get(VOSK_MODEL_PACK_PATH)!)],
          totalBytes: 6,
        },
        lessons: {
          "1": {
            id: "lesson-1",
            lesson: 1,
            dialogueManifestUrl: "/tutor-dialogue/lesson-01.json",
            files: [asset("/tutor-dialogue/lesson-01.json", bodies.get("/tutor-dialogue/lesson-01.json")!)],
            totalBytes: 56,
            hasApprovedAudio: true,
          },
          "7": {
            id: "lesson-7",
            lesson: 7,
            dialogueManifestUrl: "/tutor-dialogue/lesson-07.json",
            files: [asset("/tutor-dialogue/lesson-07.json", bodies.get("/tutor-dialogue/lesson-07.json")!)],
            totalBytes: 56,
            hasApprovedAudio: false,
          },
          "24": {
            id: "lesson-24",
            lesson: 24,
            dialogueManifestUrl: "/tutor-dialogue/lesson-24.json",
            files: [asset("/tutor-dialogue/lesson-24.json", bodies.get("/tutor-dialogue/lesson-24.json")!)],
            totalBytes: 57,
            hasApprovedAudio: false,
          },
        },
      },
    }),
  );

  fetchMock.mockReset().mockImplementation(async (url) => response(url));
  vi.stubGlobal("caches", cachesMock);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("crypto", webcrypto);
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { controller: {} },
  });
  Object.defineProperty(navigator, "storage", {
    configurable: true,
    value: {
      persist: vi.fn(async () => true),
      estimate: vi.fn(async () => ({ usage: 42_000_000, quota: 500_000_000 })),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

async function active() {
  const pointer = await (await cachesMock.open(TUTOR_PACK_CONTROL_CACHE)).match(TUTOR_PACK_POINTER);
  return await pointer!.json();
}

async function registry() {
  const reg = await (await cachesMock.open(TUTOR_PACK_CONTROL_CACHE)).match(
    TUTOR_PACK_REGISTRY_POINTER,
  );
  return reg ? await reg.json() : null;
}

describe("verified tutor pack (all lessons)", () => {
  it("packs every required route, recording and lazy production chunk with MIME preserved", async () => {
    const shell = await cachesMock.open("cartilla:shell:existing");
    await shell.put("/", new Response("untouched"));
    expect((await downloadTutorPack()).state).toBe("done");
    const marker = await active();
    expect(marker.cacheName.startsWith(`${TUTOR_PACK_CACHE_NAME}:`)).toBe(true);
    const cache = await cachesMock.open(marker.cacheName);
    for (const url of [...tutorPackFileList(), "/assets/lazy.js"])
      expect(await cache.match(url)).toBeDefined();
    const cachedRoutes = [...cache.store.keys()].filter((url) => /^\/tutor(?:\/\d+)?$/.test(url));
    expect(new Set(cachedRoutes)).toEqual(
      new Set(["/tutor", ...Array.from({ length: 24 }, (_, index) => `/tutor/${index + 1}`)]),
    );
    expect((await cache.match("/tutor/24"))!.headers.get("content-type")).toBe("text/html");
    expect(await (await shell.match("/"))!.text()).toBe("untouched");
    expect(await getTutorPackStatus()).toMatchObject({
      state: "done",
      version: TUTOR_PACK_VERSION,
      skippedFiles: 0,
    });
  });

  it("rejects a missing model and never publishes a ready pointer", async () => {
    bodies.delete(VOSK_MODEL_PACK_PATH);
    await expect(downloadTutorPack()).rejects.toThrow("Preparación incompleta");
    expect((await getTutorPackStatus()).state).not.toBe("done");
    expect(
      [...stores.keys()].filter((name) => name.startsWith(`${TUTOR_PACK_CACHE_NAME}:`)),
    ).toEqual([]);
  });

  it("a failed update leaves the previous verified pack available", async () => {
    await downloadTutorPack();
    const prior = await active();
    bodies.delete("/assets/lazy.js");
    await expect(downloadTutorPack()).rejects.toThrow();
    expect(await active()).toEqual(prior);
    expect((await getTutorPackStatus()).state).toBe("done");
  });

  it("rejects a 200 HTML fallback pretending to be an asset", async () => {
    fetchMock.mockImplementation(async (url) =>
      url === VOSK_MODEL_PACK_PATH
        ? new Response("<html>SPA</html>", { headers: { "Content-Type": "text/html" } })
        : response(url),
    );
    await expect(downloadTutorPack()).rejects.toThrow("Archivo ausente");
  });

  it("rejects a changed/truncated file even with HTTP 200", async () => {
    bodies.set(VOSK_MODEL_PACK_PATH, "truncated");
    await expect(downloadTutorPack()).rejects.toThrow("Archivo incompleto");
  });

  it("detects individual-entry eviction and complete cache eviction", async () => {
    await downloadTutorPack();
    const marker = await active();
    stores.get(marker.cacheName)!.store.delete("/assets/lazy.js");
    expect(await getTutorPackStatus()).toEqual({ state: "cleared" });
    stores.delete(marker.cacheName);
    expect(await getTutorPackStatus()).toEqual({ state: "cleared" });
  });

  it("rejects a manifest from another build", async () => {
    const manifest = JSON.parse(bodies.get("/tutor-assets.json")!);
    manifest.buildId = "older";
    bodies.set("/tutor-assets.json", JSON.stringify(manifest));
    await expect(downloadTutorPack()).rejects.toThrow("falta el paquete");
  });

  it("requires actual service-worker control before claiming offline readiness", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { controller: null },
    });
    await expect(downloadTutorPack()).rejects.toThrow("activar");
  });

  it("clear removes packs without touching anonymous progress or app caches", async () => {
    localStorage.setItem("cartilla.tutor.memory.v1", "memory");
    await cachesMock.open("cartilla:assets:existing");
    await downloadTutorPack();
    await clearTutorPack();
    expect((await cachesMock.keys()).some((key) => key.startsWith(TUTOR_PACK_CACHE_PREFIX))).toBe(
      false,
    );
    expect(localStorage.getItem("cartilla.tutor.memory.v1")).toBe("memory");
    expect(await cachesMock.has("cartilla:assets:existing")).toBe(true);
  });

  it("rolls back the new cache and reports a clear Spanish error on QuotaExceededError", async () => {
    await downloadTutorPack();
    const prior = await active();
    const origOpen = cachesMock.open.bind(cachesMock);
    const spy = vi.spyOn(cachesMock, "open").mockImplementation(async (name: string) => {
      const cache = await origOpen(name);
      if (name !== prior.cacheName && name.startsWith(`${TUTOR_PACK_CACHE_NAME}:`)) {
        vi.spyOn(cache, "put").mockRejectedValueOnce(
          Object.assign(new Error("Storage full"), { name: "QuotaExceededError" }),
        );
      }
      return cache;
    });
    try {
      await expect(downloadTutorPack()).rejects.toThrow("Espacio insuficiente");
      expect(await active()).toEqual(prior);
    } finally {
      spy.mockRestore();
    }
  });

  it("reports actual bytes and counts all files only after storage accepts them", async () => {
    const progress = vi.fn();
    await downloadTutorPack(progress);
    const expectedFiles = [...new Set([...tutorPackFileList(), ...JSON.parse(bodies.get("/tutor-assets.json")!).files.map((f: { url: string }) => f.url), "/tutor-assets.json"])];
    expect(progress.mock.lastCall?.[0]).toMatchObject({
      state: "downloading",
      filesDone: expectedFiles.length,
      filesTotal: expectedFiles.length,
    });
  });
});

describe("modular per-lesson packs, Tier-3 isolation & storage recovery (Milestone 12)", () => {
  it("lists universal, avatar, Vosk, all 24 lessons, and 4 optional Tier-3 slots", async () => {
    const slots = await listTutorPackSlots();
    expect(slots.find((s) => s.id === "universal")).toBeDefined();
    expect(slots.find((s) => s.id === "avatar")).toBeDefined();
    expect(slots.find((s) => s.id === "vosk")).toBeDefined();
    expect(slots.filter((s) => s.kind === "lesson")).toHaveLength(24);
    const tier3 = slots.filter((s) => s.kind === "tier3");
    expect(tier3).toHaveLength(4);
    expect(tier3.every((s) => s.optInOnly && !s.requiredForOfflineCore)).toBe(true);
    expect(tier3.find((s) => s.id === "tier3-local-llm-qa")?.state).toBe("unavailable");
  });

  it("downloads and atomically commits individual modular slots (universal, avatar, vosk, lesson-7, lesson-24)", async () => {
    const universal = await downloadTutorPackSlot("universal");
    const avatar = await downloadTutorPackSlot("avatar");
    const vosk = await downloadTutorPackSlot("vosk");
    const l7 = await downloadTutorPackSlot("lesson-7");
    const l24 = await downloadTutorPackSlot("lesson-24");

    expect(universal.state).toBe("ready");
    expect(avatar.state).toBe("ready");
    expect(vosk.state).toBe("ready");
    expect(l7.state).toBe("ready");
    expect(l24.state).toBe("ready");

    const reg = await registry();
    expect(Object.keys(reg.slots).sort()).toEqual([
      "avatar",
      "lesson-24",
      "lesson-7",
      "universal",
      "vosk",
    ]);

    const slots = await listTutorPackSlots();
    expect(slots.find((s) => s.id === "lesson-7")?.state).toBe("ready");
    expect(slots.find((s) => s.id === "lesson-24")?.state).toBe("ready");
    expect(slots.find((s) => s.id === "lesson-12")?.state).toBe("idle");
  });

  it("refuses unverified Tier-3 heavy model slots without affecting Tier 1/2 readiness", async () => {
    await downloadTutorPackSlot("universal");
    await expect(downloadTutorPackSlot("tier3-local-llm-qa")).rejects.toThrow(
      /no se distribuye por defecto/i,
    );
    await expect(downloadTutorPackSlot("tier3-vision-handwriting")).rejects.toThrow(
      /no se distribuye por defecto/i,
    );
    const slots = await listTutorPackSlots();
    expect(slots.find((s) => s.id === "universal")?.state).toBe("ready");
  });

  it("detects per-slot eviction and preserves other slots when clearing one slot", async () => {
    localStorage.setItem("cartilla.tutor.memory.v1", "keep-me");
    localStorage.setItem("cartilla.tutor.progress.v1", "keep-progress");
    await downloadTutorPackSlot("lesson-7");
    await downloadTutorPackSlot("lesson-24");

    const reg = await registry();
    stores.get(reg.slots["lesson-7"].cacheName)!.store.delete("/tutor/7");

    const afterEviction = await listTutorPackSlots();
    expect(afterEviction.find((s) => s.id === "lesson-7")?.state).toBe("cleared");
    expect(afterEviction.find((s) => s.id === "lesson-24")?.state).toBe("ready");

    await clearTutorPackSlot("lesson-7");
    const afterClear = await listTutorPackSlots();
    expect(afterClear.find((s) => s.id === "lesson-7")?.state).toBe("idle");
    expect(afterClear.find((s) => s.id === "lesson-24")?.state).toBe("ready");
    expect(localStorage.getItem("cartilla.tutor.memory.v1")).toBe("keep-me");
    expect(localStorage.getItem("cartilla.tutor.progress.v1")).toBe("keep-progress");
  });

  it("recovers orphaned tutor caches while preserving active packs and learner memory", async () => {
    localStorage.setItem("cartilla.tutor.memory.v1", "preserved");
    await downloadTutorPackSlot("avatar");
    // Simulate two orphaned/stale tutor generations left behind after updates
    await cachesMock.open(`${TUTOR_PACK_CACHE_NAME}:stale-1`);
    await cachesMock.open(`${TUTOR_PACK_CACHE_NAME}:stale-2`);

    const before = await getTutorStorageSummary();
    expect(before.orphanedCacheCount).toBe(2);

    const recovered = await recoverTutorPackStorage();
    expect(recovered.reclaimedCaches).toBe(2);
    expect(recovered.preservedActiveCaches).toBeGreaterThanOrEqual(2);

    const after = await getTutorStorageSummary();
    expect(after.orphanedCacheCount).toBe(0);
    expect((await listTutorPackSlots()).find((s) => s.id === "avatar")?.state).toBe("ready");
    expect(localStorage.getItem("cartilla.tutor.memory.v1")).toBe("preserved");
  });

  it("never includes quarantined audio paths in any lesson pack file list", () => {
    for (let lesson = 1; lesson <= 24; lesson += 1) {
      const urls = lessonPackFileList(lesson);
      expect(urls.some((u) => u.includes("nina-sordita") || u.includes("rec_gretel_"))).toBe(false);
    }
  });
});

describe("lazy per-lesson dialogue loading & likely-next-line preloading", () => {
  it("loads ONLY the requested lesson dialogue manifest instead of all 24 lessons", async () => {
    expect(getLoadedDialogueLessons()).toEqual([]);

    const l7 = await loadLessonDialogueManifest(7);
    expect(l7.lesson).toBe(7);
    expect(l7.lessonManifest.lesson).toBe(7);
    expect(l7.lessonManifest.entries.length).toBeGreaterThan(0);
    expect(l7.universal.scope).toBe("universal");
    expect(getLoadedDialogueLessons()).toEqual([7]);

    const l1 = await loadLessonDialogueManifest(1);
    expect(l1.lesson).toBe(1);
    expect(getLoadedDialogueLessons()).toEqual([1, 7]);
  });

  it("preloads only the next likely approved audio/viseme lines and deduplicates fetches", async () => {
    const fetchedUrls: string[] = [];
    const customFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      fetchedUrls.push(url);
      return new Response("ok", { status: 200 });
    }) as unknown as typeof fetch;

    const warmed = await preloadLikelyNextLines(1, null, {
      maxAhead: 2,
      fetcher: customFetch,
    });
    expect(warmed.length).toBeGreaterThan(0);
    expect(warmed.length).toBeLessThanOrEqual(4); // 2 lines * (audio + visemes)
    expect(warmed.every((u) => !u.includes("nina-sordita"))).toBe(true);

    // Repeating the same window does not re-fetch already warmed URLs
    const secondPass = await preloadLikelyNextLines(1, null, {
      maxAhead: 2,
      fetcher: customFetch,
    });
    expect(secondPass).toEqual([]);
  });
});
