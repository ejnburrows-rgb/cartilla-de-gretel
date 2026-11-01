import { webcrypto, createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TUTOR_BUILD_ID,
  TUTOR_PACK_CACHE_NAME,
  TUTOR_PACK_CONTROL_CACHE,
  TUTOR_PACK_POINTER,
  TUTOR_PACK_CACHE_PREFIX,
  TUTOR_PACK_VERSION,
  VOSK_MODEL_PACK_PATH,
  downloadTutorPack,
  getTutorPackStatus,
  tutorPackFileList,
  clearTutorPack,
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
        url.startsWith("/tutor") && url !== "/tutor-assets.json"
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
  for (const url of tutorPackFileList()) bodies.set(url, url.endsWith(".json") ? "{}" : "binary");
  bodies.set("/cartilla/images/gretel/layers/manifest.json", '{"layers":[]}');
  for (const url of ["/tutor", "/tutor/1", "/tutor/2", "/tutor/3"])
    bodies.set(url, '<html><script src="/assets/main.js"></script></html>');
  bodies.set("/assets/main.js", 'import("./lazy.js")');
  bodies.set("/assets/lazy.js", "export const lesson = 1");
  bodies.set("/assets/style.css", "body{color:black}");
  bodies.set(
    "/tutor-assets.json",
    JSON.stringify({
      buildId: TUTOR_BUILD_ID,
      files: [...bodies]
        .filter(([url]) => url.startsWith("/assets/") || url === VOSK_MODEL_PACK_PATH)
        .map(([url, text]) => asset(url, text)),
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
    value: { persist: vi.fn(async () => true) },
  });
});
afterEach(() => vi.unstubAllGlobals());
async function active() {
  const pointer = await (await cachesMock.open(TUTOR_PACK_CONTROL_CACHE)).match(TUTOR_PACK_POINTER);
  return await pointer!.json();
}

describe("verified tutor pack", () => {
  it("packs every required route, recording and lazy production chunk with MIME preserved", async () => {
    const shell = await cachesMock.open("cartilla:shell:existing");
    await shell.put("/", new Response("untouched"));
    expect((await downloadTutorPack()).state).toBe("done");
    const marker = await active();
    expect(marker.cacheName.startsWith(`${TUTOR_PACK_CACHE_NAME}:`)).toBe(true);
    const cache = await cachesMock.open(marker.cacheName);
    for (const url of [...tutorPackFileList(), "/assets/lazy.js"])
      expect(await cache.match(url)).toBeDefined();
    expect((await cache.match("/tutor"))!.headers.get("content-type")).toBe("text/html");
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
    expect(progress.mock.lastCall?.[0]).toMatchObject({
      state: "downloading",
      filesDone: bodies.size,
      filesTotal: bodies.size,
    });
    expect(progress.mock.lastCall?.[0].receivedBytes).toBe(
      [...bodies.values()].reduce((sum, body) => sum + Buffer.byteLength(body), 0),
    );
  });
});
