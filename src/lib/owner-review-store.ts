/**
 * Owner review decisions for the November 16 review hub.
 * Stored only in this browser (same mechanism as the demo class), with an
 * append-only history plus JSON/CSV export and JSON restore. Nothing is ever
 * recorded on the owner's behalf: a decision exists only after he presses a button.
 */
export type OwnerDecision =
  | "approve-a"
  | "approve-b"
  | "reject-both"
  | "request-changes"
  | "keep-current"
  | "upload-replacement"
  | "accept-original"
  | "accept-alternate"
  | "needs-rerecording"
  | "reject";

export interface DecisionRecord {
  itemId: string;
  decision: OwnerDecision;
  comment: string;
  at: string;
  /** Revision of the review build the owner was looking at. */
  revision: string;
}

export const OWNER_REVIEW_KEY = "cartilla:owner-review:v1";
export const OWNER_REVIEW_BACKUP_KEY = "cartilla:owner-review:v1:backup";

interface Stored {
  version: 1;
  history: DecisionRecord[];
}

function read(key: string): Stored | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    return parsed && parsed.version === 1 && Array.isArray(parsed.history) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadHistory(): DecisionRecord[] {
  if (typeof window === "undefined") return [];
  return (read(OWNER_REVIEW_KEY) ?? read(OWNER_REVIEW_BACKUP_KEY))?.history ?? [];
}

function write(history: DecisionRecord[]) {
  const data: Stored = { version: 1, history };
  const json = JSON.stringify(data);
  // Keep the previous good copy as a backup before replacing it.
  const previous = localStorage.getItem(OWNER_REVIEW_KEY);
  if (previous) localStorage.setItem(OWNER_REVIEW_BACKUP_KEY, previous);
  localStorage.setItem(OWNER_REVIEW_KEY, json);
}

export function recordDecision(record: Omit<DecisionRecord, "at">): DecisionRecord[] {
  const next = [...loadHistory(), { ...record, at: new Date().toISOString() }];
  write(next);
  return next;
}

/** Latest decision per item; earlier ones stay in the history. */
export function latestDecisions(history: DecisionRecord[]): Map<string, DecisionRecord> {
  const map = new Map<string, DecisionRecord>();
  for (const r of history) map.set(r.itemId, r);
  return map;
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
export function historyToCsv(history: DecisionRecord[]): string {
  const head = ["itemId", "decision", "comment", "at", "revision"];
  return [head.join(","), ...history.map((r) => head.map((k) => csvCell(String(r[k as keyof DecisionRecord] ?? ""))).join(","))].join("\n");
}
export function historyToJson(history: DecisionRecord[]): string {
  return JSON.stringify({ version: 1, history }, null, 2);
}

/** Restore from an exported JSON file. Returns the merged history (deduplicated). */
export function importHistory(json: string): DecisionRecord[] {
  const parsed = JSON.parse(json) as Partial<Stored>;
  if (!parsed || !Array.isArray(parsed.history)) throw new Error("Not a review export");
  const valid = parsed.history.filter(
    (r): r is DecisionRecord => !!r && typeof r.itemId === "string" && typeof r.decision === "string" && typeof r.at === "string",
  );
  const seen = new Set<string>();
  const merged = [...loadHistory(), ...valid]
    .filter((r) => {
      const k = `${r.itemId}|${r.decision}|${r.at}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.at.localeCompare(b.at));
  write(merged);
  return merged;
}

export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
