/**
 * Verified immutable offline packs + lazy per-lesson dialogue loading (Milestone 12).
 *
 * Guarantees:
 * - One cache-pointer write commits a complete generation atomically.
 * - Supports both the legacy full pack (`/__tutor_active_pack__`) and modular
 *   per-slot packs (`/__tutor_pack_registry__`): universal, avatar, Vosk,
 *   per-lesson packs (Lessons 1–24), and separate optional Tier-3 slots.
 * - Never bundles or auto-downloads unverified heavy Tier-3 models.
 * - Clearing or recovering pack storage NEVER touches learner memory, progress,
 *   session logs, or non-tutor app caches.
 * - Dialogue manifests load lazily per lesson with preloading of likely next lines.
 */
import tutorLinesJson from "../content/tutor-lines.json";
import type { DialogueLineV2, DialogueManifestFile } from "../content/tutor-dialogue/schema";

export const TUTOR_PACK_CACHE_PREFIX = "cartilla:tutor:";
export const TUTOR_PACK_VERSION = "v1.1.0";
export const TUTOR_PACK_CACHE_NAME = `${TUTOR_PACK_CACHE_PREFIX}${TUTOR_PACK_VERSION}`;
export const TUTOR_PACK_CONTROL_CACHE = `${TUTOR_PACK_CACHE_PREFIX}control`;
export const TUTOR_PACK_POINTER = "/__tutor_active_pack__";
export const TUTOR_PACK_REGISTRY_POINTER = "/__tutor_pack_registry__";
export const TUTOR_PACK_MARKER_KEY = "cartilla.tutor.pack.v1";
export const TUTOR_BUILD_ID = import.meta.env.VITE_TUTOR_BUILD_ID ?? "development";
export const VOSK_MODEL_PACK_PATH = "/models/vosk/vosk-model-small-es-0.42.bin";
export const GRETEL_MASTER_PACK_PATH = "/cartilla/images/gretel/gretel-approved-master.png";
const LAYERS_PATH = "/cartilla/images/gretel/layers/manifest.json";
const ASSETS_PATH = "/tutor-assets.json";

/** Core legacy routes required by the full offline pack. */
export const TUTOR_ROUTES = ["/tutor", "/tutor/1", "/tutor/2", "/tutor/3"] as const;

/** All 24 curriculum lesson numbers. */
export const ALL_PACK_LESSONS = Array.from({ length: 24 }, (_, idx) => idx + 1) as readonly number[];

/** All tutor routes across Lessons 1–24. */
export const TUTOR_ALL_ROUTES: readonly string[] = [
  "/tutor",
  ...ALL_PACK_LESSONS.map((n) => `/tutor/${n}`),
];

export type Tier3PackSlotId =
  | "tier3-vision-handwriting"
  | "tier3-local-llm-qa"
  | "tier3-handsfree-vad"
  | "tier3-av-recorder";

export type TutorPackSlotId =
  | "universal"
  | "avatar"
  | "vosk"
  | `lesson-${number}`
  | Tier3PackSlotId;

export type TutorPackSlotKind = "universal" | "avatar" | "vosk" | "lesson" | "tier3";

export type TutorPackSlotLifecycle =
  | "idle"
  | "downloading"
  | "ready"
  | "cleared"
  | "unavailable";

export interface TutorPackAsset {
  url: string;
  bytes: number;
  sha256: string;
}

export interface TutorPackSlotStatus {
  id: TutorPackSlotId;
  kind: TutorPackSlotKind;
  label: string;
  lesson?: number;
  version: string;
  state: TutorPackSlotLifecycle;
  estimatedBytes: number;
  downloadedBytes: number;
  filesDone: number;
  filesTotal: number;
  optInOnly: boolean;
  requiredForOfflineCore: boolean;
  tier: 1 | 2 | 3;
}

export interface TutorSlotDownloadProgress {
  slotId: TutorPackSlotId;
  state: "downloading" | "ready";
  receivedBytes: number;
  filesDone: number;
  filesTotal: number;
}

export interface TutorStorageSummary {
  usageBytes: number | null;
  quotaBytes: number | null;
  tutorPackBytes: number;
  activeCacheCount: number;
  orphanedCacheCount: number;
}

export interface TutorStorageRecoveryResult {
  reclaimedCaches: number;
  preservedActiveCaches: number;
}

export type TutorPackState =
  | { state: "idle" }
  | { state: "downloading"; receivedBytes: number; filesDone: number; filesTotal: number }
  | { state: "done"; version: string; filesTotal: number; skippedFiles: number }
  | { state: "cleared" };

interface PackMarker {
  cacheName: string;
  version: string;
  buildId: string;
  resources: TutorPackAsset[];
}

interface SlotRegistryMarker {
  version: string;
  buildId: string;
  slots: Record<string, PackMarker>;
}

interface BuildManifest {
  buildId: string;
  packVersion?: string;
  files: TutorPackAsset[];
  packs?: {
    universal?: { id: "universal"; files: TutorPackAsset[]; totalBytes: number };
    avatar?: { id: "avatar"; files: TutorPackAsset[]; totalBytes: number };
    vosk?: { id: "vosk"; files: TutorPackAsset[]; totalBytes: number };
    lessons?: Record<
      string,
      {
        id: string;
        lesson: number;
        dialogueManifestUrl: string;
        files: TutorPackAsset[];
        totalBytes: number;
        hasApprovedAudio: boolean;
      }
    >;
    tier3?: Array<{
      id: Tier3PackSlotId;
      label: string;
      optInOnly: true;
      available: boolean;
      estimatedBytes: number;
      files: TutorPackAsset[];
    }>;
  };
}

/** Optional Tier-3 slot catalog — never installed by default; Tier 1/2 are completely independent. */
export const TIER3_PACK_SLOTS: readonly {
  id: Tier3PackSlotId;
  label: string;
  estimatedBytes: number;
  available: boolean;
  description: string;
}[] = [
  {
    id: "tier3-vision-handwriting",
    label: "Visión local de trazos (solo captura)",
    estimatedBytes: 14_000_000,
    available: false,
    description: "No incluido por defecto; requiere evaluación de escritura infantil.",
  },
  {
    id: "tier3-local-llm-qa",
    label: "Modelo local de preguntas curriculares",
    estimatedBytes: 650_000_000,
    available: false,
    description: "No incluido por defecto; peso y memoria excesivos para móviles.",
  },
  {
    id: "tier3-handsfree-vad",
    label: "Interrupción manos libres por voz (VAD)",
    estimatedBytes: 3_000_000,
    available: false,
    description: "No incluido por defecto; el botón de hablar evita ecos en el aula.",
  },
  {
    id: "tier3-av-recorder",
    label: "Grabación audiovisual local con consentimiento",
    estimatedBytes: 0,
    available: true,
    description: "Usa MediaRecorder del navegador (0 MB); siempre desactivado por defecto.",
  },
];

function padLesson(lesson: number): string {
  return String(lesson).padStart(2, "0");
}

function isQuarantinedUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("nina-sordita") ||
    lower.includes("rec_gretel_") ||
    lower.includes("gretel_67_audio") ||
    lower.includes("tinywow")
  );
}

export function isTutorRouteUrl(url: string): boolean {
  return /^\/tutor(?:\/(?:[1-9]|1[0-9]|2[0-4]))?$/.test(url);
}

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

export function lessonPackFileList(lesson: number): string[] {
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 24) return [];
  const files = new Set<string>([
    `/tutor/${lesson}`,
    `/tutor-dialogue/lesson-${padLesson(lesson)}.json`,
  ]);
  for (const entry of tutorLinesJson.approved) {
    if (entry.lesson !== lesson) continue;
    if (entry.src && !isQuarantinedUrl(entry.src)) files.add(entry.src);
    if (entry.visemes && !isQuarantinedUrl(entry.visemes)) files.add(entry.visemes);
  }
  return [...files].sort();
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

function isValidMarker(value: PackMarker | null | undefined): value is PackMarker {
  if (
    !value ||
    !value.cacheName?.startsWith(`${TUTOR_PACK_CACHE_NAME}:`) ||
    !Array.isArray(value.resources) ||
    value.resources.length === 0
  ) {
    return false;
  }
  return value.resources.every(
    (asset) => localPath(asset.url) && asset.bytes > 0 && /^[a-f0-9]{64}$/.test(asset.sha256),
  );
}

async function pointer(): Promise<PackMarker | null> {
  if (typeof caches === "undefined" || !(await caches.has(TUTOR_PACK_CONTROL_CACHE))) return null;
  try {
    const response = await (await caches.open(TUTOR_PACK_CONTROL_CACHE)).match(TUTOR_PACK_POINTER);
    if (!response) return null;
    const value = (await response.json()) as PackMarker;
    return isValidMarker(value) ? value : null;
  } catch {
    return null;
  }
}

async function readSlotRegistry(): Promise<SlotRegistryMarker | null> {
  if (typeof caches === "undefined" || !(await caches.has(TUTOR_PACK_CONTROL_CACHE))) return null;
  try {
    const response = await (await caches.open(TUTOR_PACK_CONTROL_CACHE)).match(
      TUTOR_PACK_REGISTRY_POINTER,
    );
    if (!response) return null;
    const value = (await response.json()) as SlotRegistryMarker;
    if (!value || typeof value.slots !== "object" || value.slots === null) return null;
    return value;
  } catch {
    return null;
  }
}

async function writeSlotRegistry(registry: SlotRegistryMarker): Promise<void> {
  const control = await caches.open(TUTOR_PACK_CONTROL_CACHE);
  await control.put(
    TUTOR_PACK_REGISTRY_POINTER,
    new Response(JSON.stringify(registry), {
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function workerControlsPage(): boolean {
  return Boolean(globalThis.navigator?.serviceWorker?.controller);
}

async function verifyMarkerIntegrity(
  marker: PackMarker,
  cacheNames: string[],
  requiredUrls: readonly string[] = [],
): Promise<boolean> {
  if (
    !workerControlsPage() ||
    marker.version !== TUTOR_PACK_VERSION ||
    marker.buildId !== TUTOR_BUILD_ID ||
    !cacheNames.includes(marker.cacheName)
  ) {
    return false;
  }
  if (requiredUrls.length > 0) {
    const urls = new Set(marker.resources.map((asset) => asset.url));
    if (!requiredUrls.every((url) => urls.has(url))) return false;
  }
  const cache = await caches.open(marker.cacheName);
  for (const asset of marker.resources) {
    const response = await cache.match(asset.url);
    if (
      !response?.ok ||
      response.headers.get("x-tutor-sha256") !== asset.sha256 ||
      Number(response.headers.get("content-length")) !== asset.bytes
    ) {
      return false;
    }
  }
  return true;
}

/** Verifies the active version and every required cache entry, even after eviction. */
export async function getTutorPackStatus(): Promise<TutorPackState> {
  if (typeof caches === "undefined") return { state: "idle" };
  const marker = await pointer();
  const names = await caches.keys();
  if (!marker) {
    return {
      state: names.some((name) => name.startsWith(TUTOR_PACK_CACHE_PREFIX)) ? "cleared" : "idle",
    };
  }
  const required = [...tutorPackFileList(), ASSETS_PATH];
  const intact = await verifyMarkerIntegrity(marker, names, required);
  if (!intact) return { state: "cleared" };
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

async function fetchAndValidateManifest(): Promise<{
  manifestResponse: Response;
  manifest: BuildManifest;
  expected: Map<string, TutorPackAsset>;
}> {
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
  return {
    manifestResponse,
    manifest,
    expected: new Map(manifest.files.map((asset) => [asset.url, asset])),
  };
}

async function stageVerifiedAssets(
  cacheName: string,
  urls: readonly string[],
  expected: Map<string, TutorPackAsset>,
  preloaded: Map<string, Response>,
  onFileDone?: (receivedBytes: number, filesDone: number, filesTotal: number) => void,
): Promise<{ resources: TutorPackAsset[]; totalBytes: number }> {
  const cache = await caches.open(cacheName);
  const resources: TutorPackAsset[] = [];
  let receivedBytes = 0;
  const sorted = [...new Set(urls)].sort();
  try {
    for (const url of sorted) {
      if (isQuarantinedUrl(url)) {
        throw new Error(`Archivo bloqueado por cuarentena: ${url}`);
      }
      const response = preloaded.get(url) ?? (await fetchRequired(url));
      const body = await response.arrayBuffer();
      if (!body.byteLength) throw new Error(`Preparación incompleta: ${url}`);
      const type = response.headers.get("content-type") ?? "";
      if (isTutorRouteUrl(url)) {
        const html = new TextDecoder().decode(body);
        if (!type.includes("text/html") || !/<script[^>]+src=["'][^"']+\.js/.test(html)) {
          throw new Error(`Falta la aplicación: ${url}`);
        }
      } else if (type.includes("text/html")) {
        throw new Error(`Archivo ausente: ${url}`);
      }
      if (url.endsWith(".json")) JSON.parse(new TextDecoder().decode(body));
      const hash = await digest(body);
      const expectedAsset = expected.get(url);
      if (
        expectedAsset &&
        (expectedAsset.bytes !== body.byteLength || expectedAsset.sha256 !== hash)
      ) {
        throw new Error(`Archivo incompleto: ${url}`);
      }
      const headers = new Headers(response.headers);
      headers.delete("content-encoding");
      headers.delete("vary");
      headers.set("content-length", String(body.byteLength));
      headers.set("x-tutor-sha256", hash);
      await cache.put(url, new Response(body, { headers }));
      resources.push({ url, bytes: body.byteLength, sha256: hash });
      receivedBytes += body.byteLength;
      onFileDone?.(receivedBytes, resources.length, sorted.length);
    }
    // Confirm storage accepted every entry before publishing this generation.
    for (const asset of resources) {
      if (!(await cache.match(asset.url))?.ok) {
        throw new Error(`No se pudo guardar: ${asset.url}`);
      }
    }
    return { resources, totalBytes: receivedBytes };
  } catch (error) {
    await caches.delete(cacheName);
    const errName = (error as { name?: string } | null | undefined)?.name ?? "";
    if (errName === "QuotaExceededError") {
      throw new Error(
        "Espacio insuficiente en el dispositivo para guardar el paquete sin internet.",
      );
    }
    throw error;
  }
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
  if (typeof caches === "undefined" || !workerControlsPage()) {
    throw new Error(
      "Preparación incompleta: vuelve a abrir el tutor para activar el uso sin internet.",
    );
  }
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* best effort */
  }
  const { manifestResponse, expected } = await fetchAndValidateManifest();
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
    ) {
      files.add(layer.src);
    }
  }
  const cacheName = `${TUTOR_PACK_CACHE_NAME}:${crypto.randomUUID()}`;
  const preloaded = new Map<string, Response>([
    [ASSETS_PATH, manifestResponse],
    [LAYERS_PATH, layersResponse],
  ]);
  const { resources } = await stageVerifiedAssets(
    cacheName,
    [...files],
    expected,
    preloaded,
    (receivedBytes, filesDone, filesTotal) => {
      onProgress?.({
        state: "downloading",
        receivedBytes,
        filesDone,
        filesTotal,
      });
    },
  );
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
  return {
    state: "done",
    version: TUTOR_PACK_VERSION,
    filesTotal: resources.length,
    skippedFiles: 0,
  };
}

function parseLessonSlot(slotId: TutorPackSlotId): number | null {
  const match = /^lesson-(\d+)$/.exec(slotId);
  if (!match) return null;
  const lesson = Number(match[1]);
  return Number.isInteger(lesson) && lesson >= 1 && lesson <= 24 ? lesson : null;
}

function describeSlotBase(slotId: TutorPackSlotId): Omit<TutorPackSlotStatus, "state" | "downloadedBytes" | "filesDone" | "filesTotal"> {
  if (slotId === "universal") {
    return {
      id: "universal",
      kind: "universal",
      label: "Paquete universal (aplicación y diálogos base)",
      version: TUTOR_PACK_VERSION,
      estimatedBytes: 1_500_000,
      optInOnly: false,
      requiredForOfflineCore: true,
      tier: 1,
    };
  }
  if (slotId === "avatar") {
    return {
      id: "avatar",
      kind: "avatar",
      label: "Avatar de Gretel y capas aprobadas",
      version: TUTOR_PACK_VERSION,
      estimatedBytes: 1_200_000,
      optInOnly: false,
      requiredForOfflineCore: true,
      tier: 1,
    };
  }
  if (slotId === "vosk") {
    return {
      id: "vosk",
      kind: "vosk",
      label: "Modelo local de voz en español (Vosk)",
      version: TUTOR_PACK_VERSION,
      estimatedBytes: 39_000_000,
      optInOnly: false,
      requiredForOfflineCore: true,
      tier: 2,
    };
  }
  const lesson = parseLessonSlot(slotId);
  if (lesson !== null) {
    return {
      id: slotId,
      kind: "lesson",
      label: `Lección ${lesson}`,
      lesson,
      version: TUTOR_PACK_VERSION,
      estimatedBytes: 550_000,
      optInOnly: false,
      requiredForOfflineCore: false,
      tier: 1,
    };
  }
  const tier3 = TIER3_PACK_SLOTS.find((slot) => slot.id === slotId);
  return {
    id: slotId,
    kind: "tier3",
    label: tier3?.label ?? slotId,
    version: TUTOR_PACK_VERSION,
    estimatedBytes: tier3?.estimatedBytes ?? 0,
    optInOnly: true,
    requiredForOfflineCore: false,
    tier: 3,
  };
}

/** List all modular pack slots (universal, avatar, Vosk, Lessons 1–24, and optional Tier-3 slots). */
export async function listTutorPackSlots(): Promise<TutorPackSlotStatus[]> {
  const allSlotIds: TutorPackSlotId[] = [
    "universal",
    "avatar",
    "vosk",
    ...ALL_PACK_LESSONS.map((n) => `lesson-${n}` as TutorPackSlotId),
    ...TIER3_PACK_SLOTS.map((slot) => slot.id),
  ];

  const registry = await readSlotRegistry();
  const fullMarker = await pointer();
  const cacheNames = typeof caches === "undefined" ? [] : await caches.keys();
  const fullIntact = fullMarker ? await verifyMarkerIntegrity(fullMarker, cacheNames) : false;
  const fullUrls = new Set(fullIntact && fullMarker ? fullMarker.resources.map((r) => r.url) : []);

  const statuses: TutorPackSlotStatus[] = [];
  for (const slotId of allSlotIds) {
    const base = describeSlotBase(slotId);
    if (base.kind === "tier3") {
      const descriptor = TIER3_PACK_SLOTS.find((s) => s.id === slotId);
      statuses.push({
        ...base,
        state: descriptor?.available ? "idle" : "unavailable",
        downloadedBytes: 0,
        filesDone: 0,
        filesTotal: 0,
      });
      continue;
    }

    const slotMarker = registry?.slots?.[slotId];
    if (slotMarker && isValidMarker(slotMarker)) {
      const intact = await verifyMarkerIntegrity(slotMarker, cacheNames);
      const totalBytes = slotMarker.resources.reduce((sum, item) => sum + item.bytes, 0);
      statuses.push({
        ...base,
        estimatedBytes: totalBytes || base.estimatedBytes,
        state: intact ? "ready" : "cleared",
        downloadedBytes: intact ? totalBytes : 0,
        filesDone: intact ? slotMarker.resources.length : 0,
        filesTotal: slotMarker.resources.length,
      });
      continue;
    }

    // If the full legacy pack is active and covers this slot's core assets, reflect readiness.
    if (fullIntact && fullMarker) {
      const covered =
        (slotId === "vosk" && fullUrls.has(VOSK_MODEL_PACK_PATH)) ||
        (slotId === "avatar" &&
          fullUrls.has(GRETEL_MASTER_PACK_PATH) &&
          fullUrls.has(LAYERS_PATH)) ||
        (slotId === "universal" && fullUrls.has("/tutor") && fullUrls.has(ASSETS_PATH)) ||
        (base.lesson !== undefined &&
          fullUrls.has(`/tutor/${base.lesson}`) &&
          lessonPackFileList(base.lesson)
            .filter((u) => !u.startsWith("/tutor-dialogue/"))
            .every((u) => fullUrls.has(u)));
      if (covered) {
        const matched = fullMarker.resources.filter((asset) => {
          if (slotId === "vosk") return asset.url === VOSK_MODEL_PACK_PATH;
          if (slotId === "avatar") return asset.url.startsWith("/cartilla/images/gretel/");
          if (slotId === "universal")
            return (
              asset.url === "/tutor" ||
              asset.url === ASSETS_PATH ||
              asset.url.startsWith("/assets/") ||
              asset.url === "/tutor-dialogue/universal.json"
            );
          if (base.lesson !== undefined) {
            return (
              asset.url === `/tutor/${base.lesson}` ||
              asset.url === `/tutor-dialogue/lesson-${padLesson(base.lesson)}.json` ||
              lessonPackFileList(base.lesson).includes(asset.url)
            );
          }
          return false;
        });
        const bytes = matched.reduce((sum, item) => sum + item.bytes, 0);
        statuses.push({
          ...base,
          estimatedBytes: bytes || base.estimatedBytes,
          state: "ready",
          downloadedBytes: bytes,
          filesDone: matched.length,
          filesTotal: matched.length,
        });
        continue;
      }
    }

    statuses.push({
      ...base,
      state: "idle",
      downloadedBytes: 0,
      filesDone: 0,
      filesTotal: 0,
    });
  }
  return statuses;
}

const slotPreparing = new Map<TutorPackSlotId, Promise<TutorPackSlotStatus>>();

/** Download, checksum-verify, and atomically commit a single modular pack slot. */
export function downloadTutorPackSlot(
  slotId: TutorPackSlotId,
  onProgress?: (progress: TutorSlotDownloadProgress) => void,
): Promise<TutorPackSlotStatus> {
  const inflight = slotPreparing.get(slotId);
  if (inflight) return inflight;
  const run = prepareSlotPack(slotId, onProgress).finally(() => {
    slotPreparing.delete(slotId);
  });
  slotPreparing.set(slotId, run);
  return run;
}

async function prepareSlotPack(
  slotId: TutorPackSlotId,
  onProgress?: (progress: TutorSlotDownloadProgress) => void,
): Promise<TutorPackSlotStatus> {
  const base = describeSlotBase(slotId);
  if (base.kind === "tier3") {
    const descriptor = TIER3_PACK_SLOTS.find((slot) => slot.id === slotId);
    if (!descriptor?.available) {
      throw new Error(
        "Este módulo opcional de Nivel 3 no se distribuye por defecto y no está disponible para descarga.",
      );
    }
    return {
      ...base,
      state: "ready",
      downloadedBytes: 0,
      filesDone: 0,
      filesTotal: 0,
    };
  }

  if (typeof caches === "undefined" || !workerControlsPage()) {
    throw new Error(
      "Preparación incompleta: vuelve a abrir el tutor para activar el uso sin internet.",
    );
  }
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* best effort */
  }

  const { manifestResponse, manifest, expected } = await fetchAndValidateManifest();
  const preloaded = new Map<string, Response>([[ASSETS_PATH, manifestResponse]]);
  const urls = new Set<string>();

  if (slotId === "universal") {
    urls.add("/tutor");
    urls.add(ASSETS_PATH);
    for (const asset of manifest.packs?.universal?.files ?? manifest.files) {
      if (
        asset.url.startsWith("/assets/") ||
        asset.url === "/tutor-dialogue/universal.json"
      ) {
        urls.add(asset.url);
      }
    }
  } else if (slotId === "avatar") {
    urls.add(GRETEL_MASTER_PACK_PATH);
    urls.add(LAYERS_PATH);
    const layersResponse = await fetchRequired(LAYERS_PATH);
    preloaded.set(LAYERS_PATH, layersResponse);
    const layers = (await layersResponse.clone().json()) as {
      layers?: { src?: string; approval?: string }[];
    };
    for (const layer of layers.layers ?? []) {
      if (
        layer.approval &&
        layer.src &&
        localPath(layer.src) &&
        layer.src.startsWith("/cartilla/images/gretel/layers/")
      ) {
        urls.add(layer.src);
      }
    }
  } else if (slotId === "vosk") {
    urls.add(VOSK_MODEL_PACK_PATH);
  } else {
    const lesson = parseLessonSlot(slotId);
    if (lesson === null) {
      throw new Error(`Paquete desconocido: ${slotId}`);
    }
    urls.add(`/tutor/${lesson}`);
    const manifestLesson = manifest.packs?.lessons?.[String(lesson)];
    if (manifestLesson) {
      for (const asset of manifestLesson.files) urls.add(asset.url);
    } else {
      for (const url of lessonPackFileList(lesson)) urls.add(url);
    }
  }

  const cacheName = `${TUTOR_PACK_CACHE_NAME}:${slotId}:${crypto.randomUUID()}`;
  const { resources, totalBytes } = await stageVerifiedAssets(
    cacheName,
    [...urls],
    expected,
    preloaded,
    (receivedBytes, filesDone, filesTotal) => {
      onProgress?.({
        slotId,
        state: "downloading",
        receivedBytes,
        filesDone,
        filesTotal,
      });
    },
  );

  const existing = await readSlotRegistry();
  const nextSlots: Record<string, PackMarker> = {
    ...(existing?.slots ?? {}),
    [slotId]: {
      cacheName,
      version: TUTOR_PACK_VERSION,
      buildId: TUTOR_BUILD_ID,
      resources,
    },
  };
  await writeSlotRegistry({
    version: TUTOR_PACK_VERSION,
    buildId: TUTOR_BUILD_ID,
    slots: nextSlots,
  });

  onProgress?.({
    slotId,
    state: "ready",
    receivedBytes: totalBytes,
    filesDone: resources.length,
    filesTotal: resources.length,
  });

  return {
    ...base,
    estimatedBytes: totalBytes,
    downloadedBytes: totalBytes,
    filesDone: resources.length,
    filesTotal: resources.length,
    state: "ready",
  };
}

/** Removes a single modular pack slot without touching learner memory, progress, or other slots. */
export async function clearTutorPackSlot(slotId: TutorPackSlotId): Promise<void> {
  if (slotPreparing.has(slotId)) throw new Error("Espera a que termine la preparación.");
  if (typeof caches === "undefined") return;
  const existing = await readSlotRegistry();
  const marker = existing?.slots?.[slotId];
  if (marker?.cacheName) {
    await caches.delete(marker.cacheName);
  }
  if (existing && slotId in existing.slots) {
    const remaining = { ...existing.slots };
    delete remaining[slotId];
    await writeSlotRegistry({
      version: existing.version,
      buildId: existing.buildId,
      slots: remaining,
    });
  }
}

/** Progress/memory are intentionally independent of the downloadable pack. */
export async function clearTutorPack(): Promise<void> {
  if (preparing || slotPreparing.size > 0) throw new Error("Espera a que termine la preparación.");
  if (typeof caches !== "undefined") {
    for (const name of await caches.keys()) {
      if (name.startsWith(TUTOR_PACK_CACHE_PREFIX)) await caches.delete(name);
    }
  }
  try {
    localStorage.removeItem(TUTOR_PACK_MARKER_KEY);
  } catch {
    /* unavailable storage */
  }
}

/** Collects active cache references (full pack + committed modular slots). */
async function collectActivePackCacheNames(): Promise<Set<string>> {
  const active = new Set<string>([TUTOR_PACK_CONTROL_CACHE]);
  const full = await pointer();
  if (full?.cacheName) active.add(full.cacheName);
  const registry = await readSlotRegistry();
  for (const marker of Object.values(registry?.slots ?? {})) {
    if (marker?.cacheName) active.add(marker.cacheName);
  }
  return active;
}

/** Reports storage usage/quota and orphaned tutor caches for storage recovery UI. */
export async function getTutorStorageSummary(): Promise<TutorStorageSummary> {
  let usageBytes: number | null = null;
  let quotaBytes: number | null = null;
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (typeof estimate?.usage === "number") usageBytes = estimate.usage;
    if (typeof estimate?.quota === "number") quotaBytes = estimate.quota;
  } catch {
    /* estimate unavailable */
  }

  if (typeof caches === "undefined") {
    return {
      usageBytes,
      quotaBytes,
      tutorPackBytes: 0,
      activeCacheCount: 0,
      orphanedCacheCount: 0,
    };
  }

  const activeNames = await collectActivePackCacheNames();
  const allTutorCaches = (await caches.keys()).filter((name) =>
    name.startsWith(TUTOR_PACK_CACHE_PREFIX),
  );
  const full = await pointer();
  const registry = await readSlotRegistry();

  const seenCaches = new Set<string>();
  let tutorPackBytes = 0;
  if (full && !seenCaches.has(full.cacheName)) {
    seenCaches.add(full.cacheName);
    tutorPackBytes += full.resources.reduce((sum, item) => sum + item.bytes, 0);
  }
  for (const marker of Object.values(registry?.slots ?? {})) {
    if (marker && !seenCaches.has(marker.cacheName)) {
      seenCaches.add(marker.cacheName);
      tutorPackBytes += marker.resources.reduce((sum, item) => sum + item.bytes, 0);
    }
  }

  const orphanedCacheCount = allTutorCaches.filter((name) => !activeNames.has(name)).length;
  return {
    usageBytes,
    quotaBytes,
    tutorPackBytes,
    activeCacheCount: seenCaches.size,
    orphanedCacheCount,
  };
}

/** Deletes stale/orphaned tutor caches without touching active packs or learner memory. */
export async function recoverTutorPackStorage(): Promise<TutorStorageRecoveryResult> {
  if (typeof caches === "undefined") {
    return { reclaimedCaches: 0, preservedActiveCaches: 0 };
  }
  const activeNames = await collectActivePackCacheNames();
  const allTutorCaches = (await caches.keys()).filter((name) =>
    name.startsWith(TUTOR_PACK_CACHE_PREFIX),
  );
  let reclaimedCaches = 0;
  let preservedActiveCaches = 0;
  for (const name of allTutorCaches) {
    if (activeNames.has(name)) {
      preservedActiveCaches += 1;
    } else {
      await caches.delete(name);
      reclaimedCaches += 1;
    }
  }
  return { reclaimedCaches, preservedActiveCaches };
}

// ---------------------------------------------------------------------------
// Lazy Per-Lesson Dialogue Loading & Preloading of Likely Next Lines
// ---------------------------------------------------------------------------

export interface LazyLessonDialogueBundle {
  lesson: number;
  universal: DialogueManifestFile;
  lessonManifest: DialogueManifestFile;
  entries: readonly DialogueLineV2[];
}

// Vite splits every lesson-XX.json into its own async chunk — NEVER eager.
const LAZY_LESSON_DIALOGUE_LOADERS = import.meta.glob<{ default: DialogueManifestFile }>(
  "../content/tutor-dialogue/lesson-*.json",
);
const LAZY_UNIVERSAL_DIALOGUE_LOADER = import.meta.glob<{ default: DialogueManifestFile }>(
  "../content/tutor-dialogue/universal.json",
);

let cachedUniversalDialogue: DialogueManifestFile | null = null;
const loadedLessonDialogues = new Map<number, LazyLessonDialogueBundle>();
const preloadedAssetUrls = new Set<string>();

async function loadUniversalDialogueLazy(): Promise<DialogueManifestFile> {
  if (cachedUniversalDialogue) return cachedUniversalDialogue;
  const loader = LAZY_UNIVERSAL_DIALOGUE_LOADER["../content/tutor-dialogue/universal.json"];
  if (!loader) {
    throw new Error("Falta el manifiesto universal de diálogo del tutor.");
  }
  const mod = await loader();
  cachedUniversalDialogue = mod.default;
  return cachedUniversalDialogue;
}

/**
 * Loads ONLY the requested lesson's dialogue manifest (plus universal once),
 * rather than loading all 24 lessons at once.
 */
export async function loadLessonDialogueManifest(
  lesson: number,
): Promise<LazyLessonDialogueBundle> {
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 24) {
    throw new RangeError(`Lección fuera de rango (1–24): ${lesson}`);
  }
  const existing = loadedLessonDialogues.get(lesson);
  if (existing) return existing;

  const key = `../content/tutor-dialogue/lesson-${padLesson(lesson)}.json`;
  const loader = LAZY_LESSON_DIALOGUE_LOADERS[key];
  if (!loader) {
    throw new Error(`No se encontró el manifiesto de diálogo para la lección ${lesson}.`);
  }

  const [universal, lessonMod] = await Promise.all([loadUniversalDialogueLazy(), loader()]);
  const lessonManifest = lessonMod.default;
  const bundle: LazyLessonDialogueBundle = {
    lesson,
    universal,
    lessonManifest,
    entries: [...lessonManifest.entries, ...universal.entries],
  };
  loadedLessonDialogues.set(lesson, bundle);
  return bundle;
}

/** Returns which lesson dialogue manifests have been lazily loaded into memory. */
export function getLoadedDialogueLessons(): number[] {
  return [...loadedLessonDialogues.keys()].sort((a, b) => a - b);
}

/** Resets the in-memory lazy dialogue & preload caches (for tests or memory recovery). */
export function clearLoadedDialogueCache(): void {
  cachedUniversalDialogue = null;
  loadedLessonDialogues.clear();
  preloadedAssetUrls.clear();
}

/**
 * Preloads likely next approved audio + viseme assets for the active lesson
 * (default: next 3 playable lines after `currentLineId`), deduplicated and
 * strictly skipping unapproved or quarantined sources.
 */
export async function preloadLikelyNextLines(
  lesson: number,
  currentLineId: string | null = null,
  options: { maxAhead?: number; fetcher?: typeof fetch } = {},
): Promise<string[]> {
  const maxAhead = Math.max(1, options.maxAhead ?? 3);
  const fetcher = options.fetcher ?? globalThis.fetch;
  const bundle = await loadLessonDialogueManifest(lesson);

  const candidates: Array<{ id: string; urls: string[] }> = [];

  // 1. Legacy approved lines for this lesson (live playable audio + visemes)
  for (const entry of tutorLinesJson.approved) {
    if (entry.lesson !== lesson && entry.lesson !== 0) continue;
    const urls = [entry.src, entry.visemes].filter(
      (u): u is string => typeof u === "string" && u.startsWith("/") && !isQuarantinedUrl(u),
    );
    if (urls.length > 0) {
      candidates.push({ id: entry.lineId, urls });
    }
  }

  // 2. Approved entries from the lazily loaded lesson manifest
  for (const entry of bundle.lessonManifest.entries) {
    if (entry.status !== "approved") continue;
    const urls = [entry.audio?.src, entry.audio?.visemes].filter(
      (u): u is string => typeof u === "string" && u.startsWith("/") && !isQuarantinedUrl(u),
    );
    if (urls.length > 0) {
      candidates.push({ id: entry.id, urls });
    }
  }

  const startIdx =
    currentLineId === null
      ? 0
      : Math.max(0, candidates.findIndex((c) => c.id === currentLineId) + 1);
  const windowItems = candidates.slice(startIdx, startIdx + maxAhead);

  const warmed: string[] = [];
  if (typeof fetcher !== "function") return warmed;

  for (const item of windowItems) {
    for (const url of item.urls) {
      if (preloadedAssetUrls.has(url)) continue;
      preloadedAssetUrls.add(url);
      try {
        const res = await fetcher(url, { cache: "force-cache" });
        if (res.ok) warmed.push(url);
      } catch {
        // Best-effort preload; offline or missing optional assets never break the session.
      }
    }
  }
  return warmed;
}
