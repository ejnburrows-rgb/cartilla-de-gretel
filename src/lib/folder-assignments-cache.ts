// folder-assignments-cache.ts — offline-safe local cache for a class's
// folder assignments, same pattern as lesson-progress.ts: a per-device
// localStorage mirror so the teacher's folder UI still shows the last-known
// assignments if Supabase is briefly unreachable, instead of a blank screen.
import type { FolderAssignment } from "./folder-assignments.functions";

const KEY_PREFIX = "cartilla.folder-assignments.v1.";

export function cacheFolderAssignments(classId: string, rows: FolderAssignment[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_PREFIX + classId, JSON.stringify(rows));
  } catch {
    /* ignore — offline cache is best-effort only */
  }
}

export function readCachedFolderAssignments(classId: string): FolderAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + classId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FolderAssignment[]) : [];
  } catch {
    return [];
  }
}
