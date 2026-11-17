import { beforeEach, describe, expect, it } from "vitest";
import {
  historyToCsv,
  historyToJson,
  importHistory,
  latestDecisions,
  loadHistory,
  OWNER_REVIEW_BACKUP_KEY,
  OWNER_REVIEW_KEY,
  recordDecision,
} from "@/lib/owner-review-store";

describe("owner review store", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty: nothing is approved by default", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("keeps an append-only history and the latest decision per item", () => {
    recordDecision({ itemId: "wb-l3", decision: "approve-a", comment: "", revision: "x" });
    recordDecision({ itemId: "wb-l3", decision: "request-changes", comment: "más grande", revision: "x" });
    const history = loadHistory();
    expect(history).toHaveLength(2);
    expect(latestDecisions(history).get("wb-l3")?.decision).toBe("request-changes");
    expect(historyToCsv(history)).toContain('"más grande"');
  });

  it("recovers from the backup copy when the main copy is corrupted", () => {
    recordDecision({ itemId: "a", decision: "approve-b", comment: "", revision: "x" });
    recordDecision({ itemId: "b", decision: "reject-both", comment: "", revision: "x" });
    localStorage.setItem(OWNER_REVIEW_KEY, "{broken");
    expect(localStorage.getItem(OWNER_REVIEW_BACKUP_KEY)).toBeTruthy();
    expect(loadHistory().map((r) => r.itemId)).toEqual(["a"]);
  });

  it("restores an exported file without duplicating entries and validates replacement backups", () => {
    const h = recordDecision({ itemId: "a", decision: "approve-b", comment: "", revision: "x" });
    const json = JSON.stringify({ version: 1, history: h });
    localStorage.clear();
    expect(importHistory(json)).toHaveLength(1);
    expect(importHistory(json)).toHaveLength(1);
    expect(() => importHistory("{}")).toThrow();

    localStorage.clear();
    const replacement = { name: "owner.png", dataUrl: "data:image/png;base64,iVBORw0KGgo=" };
    const history = recordDecision({ itemId: "art:one", decision: "upload-replacement", comment: "", revision: "x", replacement });
    const backup = historyToJson(history);
    expect(historyToCsv(history)).toContain('"owner.png"');
    localStorage.clear();
    expect(importHistory(backup)[0].replacement).toEqual(replacement);
    expect(loadHistory()[0].replacement?.dataUrl).toBe(replacement.dataUrl);

    localStorage.clear();
    const bad = JSON.stringify({ version: 1, history: [{ itemId: "art:one", decision: "upload-replacement", at: "2026-11-16", replacement: { name: "bad", dataUrl: "javascript:alert(1)" } }] });
    expect(() => importHistory(bad)).toThrow();
    expect(loadHistory()).toEqual([]);
  });
});
