/** Verified immutable packs. One cache-pointer write commits a complete generation. */
import tutorLinesJson from "../content/tutor-lines.json";

export const TUTOR_PACK_CACHE_PREFIX = "cartilla:tutor:";
export const TUTOR_PACK_VERSION = "v1.1.0";
export const TUTOR_PACK_CACHE_NAME = `${TUTOR_PACK_CACHE_PREFIX}${TUTOR_PACK_VERSION}`;
export const TUTOR_PACK_CONTROL_CACHE = `${TUTOR_PACK_CACHE_PREFIX}control`;
export const TUTOR_PACK_POINTER = "/__tutor_active_pack__";
export const TUTOR_PACK_MARKER_KEY = "cartilla.tutor.pack.v1";
export const TUTOR_BUILD_ID = import.meta.env.VITE_TUTOR_BUILD_ID ?? "development";
export const VOSK_MODEL_PACK_PATH = "/models/vosk/vosk-model-small-es-0.42.bin";
export const GRETEL_MASTER_PACK_PATH = "/cartilla/images/gretel/gretel-approved-master.png";
const LAYERS_PATH = "/cartilla/images/gretel/layers/manifest.json";
const ASSETS_PATH = "/tutor-assets.json";
export const TUTOR_ROUTES = ["/tutor", "/tutor/1", "/tutor/2", "/tutor/3"] as const;

export function tutorPackFileList(): string[] {
  const files = new Set<string>([
    ...TUTOR_ROUTES,
    VOSK_MODEL_PACK_PATH,
    GRETEL_MASTER_PACK_PATH,
    LAYERS_PATH,
  ]);
  for (const entry of tutorLinesJson.approved) {
    if (entry.src) files.add(entry.src);
    if (entry.visemes) files.add(entry.visemes);
  }
  return [...files].sort();
}

export type TutorPackState =
  | { state: "idle" }
  | { state: "downloading"; receivedBytes: number; filesDone: number; filesTotal: number }
  | { state: "done"; version: string; filesTotal: number; skippedFiles: number }
  | { state: "cleared" };

interface Asset {
  url: string;
  bytes: number;
  sha256: string;
}
interface PackMarker {
  cacheName: string;
  version: string;
  buildId: string;
  resources: Asset[];
}
interface BuildManifest {
  buildId: string;
  files: Asset[];
}

function localPath(value: string): boolean {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\?#%]/.test(value) &&
    !value.split("/").includes("..")
  );
}
async function digest(bytes: ArrayBuffer): Promise<string> {
  const value = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function pointer(): Promise<PackMarker | null> {
  if (typeof caches === "undefined" || !(await caches.has(TUTOR_PACK_CONTROL_CACHE))) return null;
  try {
    const response = await (await caches.open(TUTOR_PACK_CONTROL_CACHE)).match(TUTOR_PACK_POINTER);
    if (!response) return null;
    const value = (await response.json()) as PackMarker;
    if (
      !value.cacheName?.startsWith(`${TUTOR_PACK_CACHE_NAME}:`) ||
      !Array.isArray(value.resources) ||
      value.resources.length === 0
    )
      return null;
    if (
      !value.resources.every(
        (asset) => localPath(asset.url) && asset.bytes > 0 && /^[a-f0-9]{64}$/.test(asset.sha256),
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
function workerControlsPage(): boolean {
  return Boolean(globalThis.navigator?.serviceWorker?.controller);
}

/** Verifies the active version and every required cache entry, even after eviction. */
export async function getTutorPackStatus(): Promise<TutorPackState> {
  if (typeof caches === "undefined") return { state: "idle" };
  const marker = await pointer();
  const names = await caches.keys();
  if (!marker)
    return {
      state: names.some((name) => name.startsWith(TUTOR_PACK_CACHE_PREFIX)) ? "cleared" : "idle",
    };
  if (
    !workerControlsPage() ||
    marker.version !== TUTOR_PACK_VERSION ||
    marker.buildId !== TUTOR_BUILD_ID ||
    !names.includes(marker.cacheName)
  )
    return { state: "cleared" };
  const resources = new Set(marker.resources.map((asset) => asset.url));
  if (!tutorPackFileList().every((url) => resources.has(url)) || !resources.has(ASSETS_PATH))
    return { state: "cleared" };
  const cache = await caches.open(marker.cacheName);
  for (const asset of marker.resources) {
    const response = await cache.match(asset.url);
    if (
      !response?.ok ||
      response.headers.get("x-tutor-sha256") !== asset.sha256 ||
      Number(response.headers.get("content-length")) !== asset.bytes
    )
      return { state: "cleared" };
  }
  return {
    state: "done",
    version: marker.version,
    filesTotal: marker.resources.length,
    skippedFiles: 0,
  };
}

async function fetchRequired(url: string): Promise<Response> {
  // Bypass an older active pack while preparing an update. SW honors this header.
  const response = await fetch(url, { cache: "reload", headers: { "x-tutor-prepare": "1" } });
  if (!response.ok) throw new Error(`Preparación incompleta: ${url} (${response.status})`);
  return response;
}

let preparing: Promise<TutorPackState> | null = null;
export function downloadTutorPack(
  onProgress?: (state: TutorPackState) => void,
): Promise<TutorPackState> {
  if (preparing) return preparing;
  preparing = preparePack(onProgress).finally(() => {
    preparing = null;
  });
  return preparing;
}

async function preparePack(onProgress?: (state: TutorPackState) => void): Promise<TutorPackState> {
  if (typeof caches === "undefined" || !workerControlsPage())
    throw new Error(
      "Preparación incompleta: vuelve a abrir el tutor para activar el uso sin internet.",
    );
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* best effort */
  }
  const manifestResponse = await fetchRequired(ASSETS_PATH);
  const manifest = (await manifestResponse.clone().json()) as BuildManifest;
  if (
    manifest.buildId !== TUTOR_BUILD_ID ||
    !Array.isArray(manifest.files) ||
    !manifest.files.length ||
    !manifest.files.every(
      (asset) => localPath(asset.url) && asset.bytes > 0 && /^[a-f0-9]{64}$/.test(asset.sha256),
    ) ||
    !manifest.files.some((asset) => asset.url === VOSK_MODEL_PACK_PATH) ||
    !manifest.files.some((asset) => /\/assets\/.+\.js$/.test(asset.url))
  ) {
    throw new Error("Preparación incompleta: falta el paquete de esta versión.");
  }
  const expected = new Map(manifest.files.map((asset) => [asset.url, asset]));
  const files = new Set([...tutorPackFileList(), ...expected.keys(), ASSETS_PATH]);
  // Keep manifest bytes and source approval metadata in the same transaction.
  const layersResponse = await fetchRequired(LAYERS_PATH);
  const layers = (await layersResponse.clone().json()) as {
    layers?: { src?: string; approval?: string }[];
  };
  for (const layer of layers.layers ?? []) {
    if (
      layer.approval &&
      layer.src &&
      localPath(layer.src) &&
      layer.src.startsWith("/cartilla/images/gretel/layers/")
    )
      files.add(layer.src);
  }
  const cacheName = `${TUTOR_PACK_CACHE_NAME}:${crypto.randomUUID()}`;
  const cache = await caches.open(cacheName);
  const resources: Asset[] = [];
  let receivedBytes = 0;
  try {
    for (const url of [...files].sort()) {
      const response =
        url === ASSETS_PATH
          ? manifestResponse
          : url === LAYERS_PATH
            ? layersResponse
            : await fetchRequired(url);
      const body = await response.arrayBuffer();
      if (!body.byteLength) throw new Error(`Preparación incompleta: ${url}`);
      const type = response.headers.get("content-type") ?? "";
      if (TUTOR_ROUTES.includes(url as (typeof TUTOR_ROUTES)[number])) {
        const html = new TextDecoder().decode(body);
        if (!type.includes("text/html") || !/<script[^>]+src=["'][^"']+\.js/.test(html))
          throw new Error(`Falta la aplicación: ${url}`);
      } else if (type.includes("text/html")) throw new Error(`Archivo ausente: ${url}`);
      if (url.endsWith(".json")) JSON.parse(new TextDecoder().decode(body));
      const hash = await digest(body);
      const expectedAsset = expected.get(url);
      if (
        expectedAsset &&
        (expectedAsset.bytes !== body.byteLength || expectedAsset.sha256 !== hash)
      )
        throw new Error(`Archivo incompleto: ${url}`);
      const headers = new Headers(response.headers);
      headers.delete("content-encoding");
      headers.delete("vary");
      headers.set("content-length", String(body.byteLength));
      headers.set("x-tutor-sha256", hash);
      await cache.put(url, new Response(body, { headers }));
      resources.push({ url, bytes: body.byteLength, sha256: hash });
      receivedBytes += body.byteLength;
      onProgress?.({
        state: "downloading",
        receivedBytes,
        filesDone: resources.length,
        filesTotal: files.size,
      });
    }
    // Confirm storage accepted every entry before publishing this generation.
    for (const asset of resources) {
      if (!(await cache.match(asset.url))?.ok) throw new Error(`No se pudo guardar: ${asset.url}`);
    }
    const marker: PackMarker = {
      cacheName,
      version: TUTOR_PACK_VERSION,
      buildId: TUTOR_BUILD_ID,
      resources,
    };
    const control = await caches.open(TUTOR_PACK_CONTROL_CACHE);
    await control.put(
      TUTOR_PACK_POINTER,
      new Response(JSON.stringify(marker), { headers: { "Content-Type": "application/json" } }),
    );
    try {
      localStorage.setItem(TUTOR_PACK_MARKER_KEY, JSON.stringify({ version: TUTOR_PACK_VERSION }));
    } catch {
      /* pointer is authoritative */
    }
    // Retain the previous verified generation for already-open old-build tabs.
    return {
      state: "done",
      version: TUTOR_PACK_VERSION,
      filesTotal: resources.length,
      skippedFiles: 0,
    };
  } catch (error) {
    await caches.delete(cacheName);
    const errName = (error as { name?: string } | null | undefined)?.name ?? "";
    if (errName === "QuotaExceededError") {
      throw new Error("Espacio insuficiente en el dispositivo para guardar el paquete sin internet.");
    }
    throw error;
  }
}

/** Progress/memory are intentionally independent of the downloadable pack. */
export async function clearTutorPack(): Promise<void> {
  if (preparing) throw new Error("Espera a que termine la preparación.");
  for (const name of await caches.keys())
    if (name.startsWith(TUTOR_PACK_CACHE_PREFIX)) await caches.delete(name);
  try {
    localStorage.removeItem(TUTOR_PACK_MARKER_KEY);
  } catch {
    /* unavailable storage */
  }
}
