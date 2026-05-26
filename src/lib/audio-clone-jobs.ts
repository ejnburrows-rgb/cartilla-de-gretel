export type CloneJobStatus = "queued" | "uploading" | "cloning" | "ready" | "failed";

export type AudioCloneJob = {
  id: string;
  lessonId: string;
  lineId: string;
  sourceBlob: Blob;
  sourceUrl: string;
  status: CloneJobStatus;
  clonedUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type StoredCloneJob = Omit<AudioCloneJob, "sourceUrl">;

const DB_NAME = "cartilla-audio-clone-jobs";
const STORE = "jobs";
const VERSION = 1;
const CHANGE_EVENT = "cartilla:audio-clone-jobs";

function now() {
  return new Date().toISOString();
}

function normalizeJob(job: StoredCloneJob): AudioCloneJob {
  return {
    ...job,
    sourceUrl: URL.createObjectURL(job.sourceBlob),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function normalizeLineId(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ]+/g, "-")
    .replace(/^-+|-+$/g, "") || "line";
}

export async function enqueue(file: Blob, lessonId: string, lineId: string): Promise<AudioCloneJob> {
  const timestamp = now();
  const job: StoredCloneJob = {
    id: crypto.randomUUID(),
    lessonId,
    lineId,
    sourceBlob: file,
    status: "queued",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await withStore("readwrite", (store) => store.put(job));
  emitChange();
  return normalizeJob(job);
}

export async function list(): Promise<AudioCloneJob[]> {
  const rows = await withStore<StoredCloneJob[]>("readonly", (store) => store.getAll());
  return rows
    .map(normalizeJob)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function markStatus(
  id: string,
  status: CloneJobStatus,
  partial: Partial<Omit<AudioCloneJob, "id" | "status" | "createdAt" | "updatedAt">> = {},
): Promise<AudioCloneJob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onerror = () => reject(getReq.error);
    getReq.onsuccess = () => {
      const existing = getReq.result as StoredCloneJob | undefined;
      if (!existing) {
        resolve(null);
        return;
      }
      const next: StoredCloneJob = {
        ...existing,
        ...partial,
        status,
        updatedAt: now(),
      };
      const putReq = store.put(next);
      putReq.onerror = () => reject(putReq.error);
      putReq.onsuccess = () => resolve(normalizeJob(next));
    };
    tx.oncomplete = () => {
      db.close();
      emitChange();
    };
  });
}

export async function remove(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
  emitChange();
}

export async function getReadyCloneUrlForLine(lineId: string): Promise<string | null> {
  const normalized = normalizeLineId(lineId);
  const jobs = await list();
  return jobs.find((job) => job.status === "ready" && normalizeLineId(job.lineId) === normalized && job.clonedUrl)?.clonedUrl ?? null;
}

export function onCloneJobsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
