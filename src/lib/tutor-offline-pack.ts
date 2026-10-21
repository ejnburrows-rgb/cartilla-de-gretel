/**
 * Tutor offline pack (spec §18.1, milestone 6).
 *
 * A teacher-side one-time download ("Preparar sin internet") that puts the
 * whole tutor into a DEDICATED, versioned service-worker cache
 * `cartilla:tutor:<version>`, so /tutor runs with Wi-Fi off. The pack cache
 * is never mixed into the app's existing caches, and `public/sw.js` serves
 * pack entries cache-first while leaving every existing strategy untouched
 * when no pack exists.
 *
 * Pack contents:
 *  - /tutor route documents (app code is discovered from the /tutor HTML's
 *    script/link tags and cached too);
 *  - the Vosk model tarball;
 *  - Lecciones 1–3 line audio + viseme JSON, derived from
 *    src/content/tutor-lines.json (read-only; only approved entries have
 *    files — pending lines stay silent per spec §18.5);
 *  - the picture recordings the manifest references;
 *  - the Gretel puppet layers when an approved layer manifest exists,
 *    otherwise the approved master image.
 *
 * Status API covers: downloading (bytes), done (with version), and the
 * cleared-storage path ("Hay que preparar de nuevo"), never a broken screen.
 * `navigator.storage.persist()` is requested (best effort) so the browser is
 * less likely to evict the pack.
 */
import tutorLinesJson from "../content/tutor-lines.json";

/** Cache names are `cartilla:tutor:<version>` (never the app's caches). */
export const TUTOR_PACK_CACHE_PREFIX = "cartilla:tutor:";
/** Pack version — bump when pack contents change so teachers re-prepare. */
export const TUTOR_PACK_VERSION = "v1.0.0";
export const TUTOR_PACK_CACHE_NAME = `${TUTOR_PACK_CACHE_PREFIX}${TUTOR_PACK_VERSION}`;
/** localStorage marker proving a pack finished downloading (not a partial one). */
export const TUTOR_PACK_MARKER_KEY = "cartilla.tutor.pack.v1";

/** Vosk on-device model, fetched at build time by scripts/fetch-vosk-model.mjs. */
export const VOSK_MODEL_PACK_PATH = "/models/vosk/vosk-model-small-es-0.42.tar.gz";
/** Puppet fallback art: the approved master, shown intact (§17, until the pack is approved). */
export const GRETEL_MASTER_PACK_PATH = "/cartilla/images/gretel/gretel-approved-master.png";
/** Layer manifest the puppet reads; empty/absent until the owner approves the pack (§17). */
const GRETEL_LAYERS_MANIFEST_PATH = "/cartilla/images/gretel/layers/manifest.json";

/** /tutor entry documents for Lecciones 1–3. */
export const TUTOR_ROUTES = ["/tutor", "/tutor/1", "/tutor/2", "/tutor/3"] as const;

interface PackLineEntry {
  lineId: string;
  lesson: number;
  role: string;
  text: string;
  src?: string;
  visemes?: string;
}

interface PackLinesManifest {
  approved: PackLineEntry[];
  pending: PackLineEntry[];
}

/** Read-only use of the voice lane's finished manifest. */
const tutorLines = tutorLinesJson as unknown as PackLinesManifest;

/**
 * Deterministic core file list for the pack: tutor routes, the Vosk model,
 * the approved master, and every approved line's audio + viseme JSON
 * (approved entries are shared across lessons when lesson is 0; all are
 * included). Pending lines have no files (they stay silent). Hashed /tutor
 * app assets are added at download time from the /tutor document.
 */
export function tutorPackFileList(): string[] {
  const files = new Set<string>([...TUTOR_ROUTES]);
  files.add(VOSK_MODEL_PACK_PATH);
  files.add(GRETEL_MASTER_PACK_PATH);
  for (const entry of tutorLines.approved) {
    if (typeof entry.src === "string" && entry.src) files.add(entry.src);
    if (typeof entry.visemes === "string" && entry.visemes) files.add(entry.visemes);
  }
  return [...files].sort();
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type TutorPackState =
  | { state: "idle" }
  | {
      state: "downloading";
      receivedBytes: number;
      filesDone: number;
      filesTotal: number;
    }
  | { state: "done"; version: string; filesTotal: number; skippedFiles: number }
  /** Prepared before, but the pack is gone (browser cleared storage) → "Hay que preparar de nuevo". */
  | { state: "cleared" };

interface PackMarker {
  version: string;
  files: number;
  bytes: number;
  skipped: number;
  downloadedAt: string;
}

function readMarker(): PackMarker | null {
  try {
    const raw = globalThis.localStorage?.getItem(TUTOR_PACK_MARKER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "version" in parsed) {
      return parsed as PackMarker;
    }
    return null;
  } catch {
    return null;
  }
}

function writeMarker(marker: PackMarker): void {
  globalThis.localStorage?.setItem(TUTOR_PACK_MARKER_KEY, JSON.stringify(marker));
}

function removeMarker(): void {
  globalThis.localStorage?.removeItem(TUTOR_PACK_MARKER_KEY);
}

async function findPackCacheNames(): Promise<string[]> {
  if (typeof globalThis.caches === "undefined") return [];
  const keys = await globalThis.caches.keys();
  return keys.filter((key) => key.startsWith(TUTOR_PACK_CACHE_PREFIX));
}

/**
 * Current pack status. "done" requires BOTH the pack cache and the finished
 * marker; anything else that ever had a pack (cache without marker, or
 * marker without cache) is "cleared" → re-prepare, never a broken screen.
 */
export async function getTutorPackStatus(): Promise<TutorPackState> {
  const packNames = await findPackCacheNames();
  const marker = readMarker();
  if (packNames.length === 0) {
    return marker ? { state: "cleared" } : { state: "idle" };
  }
  if (!marker) {
    // Cache exists but never finished (interrupted, or storage was cleared
    // mid-flight) — treat as needing a re-prepare.
    return { state: "cleared" };
  }
  return {
    state: "done",
    version: marker.version,
    filesTotal: marker.files,
    skippedFiles: marker.skipped,
  };
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

/** Best-effort request so the browser is less likely to evict the pack. */
async function requestPersistentStorage(): Promise<void> {
  try {
    await globalThis.navigator?.storage?.persist?.();
  } catch {
    /* best effort only */
  }
}

/**
 * Collect every string under the layers manifest that is a same-origin path
 * inside the layers directory. Shape-agnostic on purpose: the layer loader
 * (`tutor-puppet-layers.ts`) lands with the puppet lane; this accepts any
 * manifest whose values point at layer files, and skips on any failure.
 */
async function collectLayerFiles(files: Set<string>): Promise<void> {
  try {
    if (typeof fetch === "undefined") return;
    const response = await fetch(GRETEL_LAYERS_MANIFEST_PATH, { cache: "reload" });
    if (!response.ok) return;
    const data: unknown = await response.json();
    const walk = (value: unknown): void => {
      if (typeof value === "string") {
        if (value.startsWith("/cartilla/images/gretel/layers/")) files.add(value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (value && typeof value === "object") {
        Object.values(value as Record<string, unknown>).forEach(walk);
      }
    };
    walk(data);
  } catch {
    /* no approved layer pack yet — master image is already in the list */
  }
}

/**
 * Discover the /tutor app code (hashed JS/CSS) from the /tutor document.
 * Tolerant: if /tutor is not deployed yet, the pack still downloads its
 * static files and the teacher can re-prepare later.
 */
async function collectTutorAppAssets(files: Set<string>): Promise<void> {
  try {
    if (typeof fetch === "undefined") return;
    const response = await fetch("/tutor", { cache: "reload" });
    if (!response.ok) return;
    const html = await response.text();
    const attrPattern = /(?:src|href)\s*=\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = attrPattern.exec(html)) !== null) {
      const url = match[1];
      if (!url || url.startsWith("http") || url.startsWith("data:") || url.startsWith("#")) {
        continue;
      }
      const path = url.startsWith("/") ? url : `/${url}`;
      if (/\.(?:m?js|css)(?:\?|$)/.test(path) || path.includes("/assets/")) {
        files.add(path);
      }
    }
  } catch {
    /* offline or route missing — static pack files still download */
  }
}

/**
 * Download the tutor pack into its dedicated cache.
 * Re-preparing is safe: previous pack caches are removed first so nothing
 * stale survives. Files that are missing (not yet built, e.g. visemes) are
 * skipped and counted; the pack still reports "done".
 * Returns the final status.
 */
export async function downloadTutorPack(
  onProgress?: (state: TutorPackState) => void,
): Promise<TutorPackState> {
  if (typeof globalThis.caches === "undefined" || typeof fetch === "undefined") {
    throw new Error("Offline pack requires Cache Storage and fetch (not available here)");
  }

  await requestPersistentStorage();

  const files = new Set<string>(tutorPackFileList());
  await collectLayerFiles(files);
  await collectTutorAppAssets(files);
  const list = [...files].sort();

  // Fresh pack: drop any previous pack caches (re-prepare semantics).
  for (const stale of await findPackCacheNames()) {
    await globalThis.caches.delete(stale);
  }
  const cache = await globalThis.caches.open(TUTOR_PACK_CACHE_NAME);

  let receivedBytes = 0;
  let filesDone = 0;
  let skippedFiles = 0;
  const report = (): void => {
    onProgress?.({
      state: "downloading",
      receivedBytes,
      filesDone,
      filesTotal: list.length,
    });
  };

  for (const url of list) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) {
        skippedFiles += 1;
      } else {
        const body = await response.arrayBuffer();
        receivedBytes += body.byteLength;
        await cache.put(url, new Response(body));
      }
    } catch {
      skippedFiles += 1;
    }
    filesDone += 1;
    report();
  }

  writeMarker({
    version: TUTOR_PACK_VERSION,
    files: list.length,
    bytes: receivedBytes,
    skipped: skippedFiles,
    downloadedAt: new Date().toISOString(),
  });

  return {
    state: "done",
    version: TUTOR_PACK_VERSION,
    filesTotal: list.length,
    skippedFiles,
  };
}

/** Remove the pack cache and marker (used by teacher controls / cleanup). */
export async function clearTutorPack(): Promise<void> {
  for (const name of await findPackCacheNames()) {
    await globalThis.caches.delete(name);
  }
  removeMarker();
}
