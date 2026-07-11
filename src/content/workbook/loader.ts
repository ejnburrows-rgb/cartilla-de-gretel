import type { PhysicalPage, WorkbookManifest } from "./types";

/**
 * Where the real manifest will live once Grok/the art pipeline publishes it.
 * Not published yet — this loader is a stub so LivingWorkbookPage consumers
 * can be written today against the real future data path.
 */
const MANIFEST_URL = "/cartilla/content/workbook-manifest.json";

let cache: WorkbookManifest | null = null;

/**
 * Loads the real workbook manifest. Until it exists, returns an honestly
 * empty, clearly-versioned stub manifest rather than inventing any page
 * content — callers must handle `pages: []`.
 */
export async function loadWorkbookManifest(): Promise<WorkbookManifest> {
  if (cache) return cache;
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`workbook-manifest.json not found (HTTP ${res.status})`);
    const data = (await res.json()) as WorkbookManifest;
    cache = data;
    return data;
  } catch {
    return { version: "0.0.0-stub-no-manifest-yet", pages: [] };
  }
}

export async function loadPhysicalPage(pageId: string): Promise<PhysicalPage | null> {
  const manifest = await loadWorkbookManifest();
  return manifest.pages.find((p) => p.id === pageId) ?? null;
}

/** Clears the in-memory cache — useful for tests or a future "reload content" action. */
export function clearWorkbookManifestCache(): void {
  cache = null;
}
