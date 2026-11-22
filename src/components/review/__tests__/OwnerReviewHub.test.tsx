import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OwnerReviewHub } from "../OwnerReviewHub";
import { AREA_STATUS, COMPARISONS, DOWNLOADS, QUICK_LINKS } from "../review-data";

const ROOT = resolve(process.cwd());
const readPublicReviewJson = <T,>(filename: string): T =>
  JSON.parse(readFileSync(resolve(ROOT, "public/review", filename), "utf8")) as T;

describe("OwnerReviewHub Option A lock and review data integrity", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("locks Option A across review-data and removes outdated Option B default claims", () => {
    const workbookQuickLinks = QUICK_LINKS.find((g) => g.group === "Student Workbook")?.links ?? [];
    expect(workbookQuickLinks.some((l) => l.label.includes("Option A default"))).toBe(true);
    expect(workbookQuickLinks.some((l) => l.label.includes("Option B default"))).toBe(false);

    expect(DOWNLOADS.some((d) => d.label.includes("Option A"))).toBe(true);
    expect(DOWNLOADS.some((d) => d.label.includes("Option B"))).toBe(false);

    const pageTurnComparison = COMPARISONS.find((c) => c.id === "workbook-page-turn");
    expect(pageTurnComparison?.summary).toContain("Option A corner-lift curl");
    expect(AREA_STATUS.length).toBeGreaterThan(0);
  });

  it("keeps public/review/owner-decisions-locked-b.json locked to Option A", () => {
    const ledger = readPublicReviewJson<{
      version: number;
      lockedDefault: string;
      history: { itemId: string; decision: string }[];
    }>("owner-decisions-locked-b.json");

    expect(ledger.version).toBe(1);
    expect(ledger.lockedDefault).toBe("A");
    expect(ledger.history.length).toBeGreaterThan(0);
    expect(ledger.history.every((entry) => entry.decision === "approve-a")).toBe(true);
  });

  it("provides valid JSON files for all review hub panels with zero unverified audio", () => {
    const audio = readPublicReviewJson<{ summary: Record<string, string>; rows: Record<string, string>[] }>(
      "audio-board.json",
    );
    const games = readPublicReviewJson<{ name: string; route: string; result: string; note: string }[]>("games.json");
    const timing = readPublicReviewJson<Record<string, string>>("page-turn-timing.json");

    expect(audio.summary["Voice policy"]).toContain("allowTts = false");
    expect(audio.rows.length).toBeGreaterThan(0);
    expect(audio.rows.every((r) => !r.file)).toBe(true);

    expect(games).toHaveLength(12);
    expect(games.find((g) => g.route === "/cartilla/juego/completar-palabras")?.result).toBe("WAITING");

    expect(timing["Workbook default"]).toContain("Option A");
    expect(timing["Flip Chart default"]).toContain("Candidate A");
  });

  it("renders OwnerReviewHub with Option A header and zero broken panels when review JSONs load", async () => {
    const fixtures: Record<string, unknown> = {
      "/review/audio-board.json": readPublicReviewJson("audio-board.json"),
      "/review/games.json": readPublicReviewJson("games.json"),
      "/review/page-turn-timing.json": readPublicReviewJson("page-turn-timing.json"),
      "/review/workbook-artwork-audit.json": { summary: { Total: "0" }, items: [] },
    };

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      if (url in fixtures) {
        return new Response(JSON.stringify(fixtures[url]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(null, { status: 404 });
    });

    render(<OwnerReviewHub />);

    expect(screen.getByText(/La Cartilla de Gretel · Owner review · Option A Locked Default/i)).toBeTruthy();
    expect(screen.queryByText(/incomplete local draft/i)).toBeNull();
    expect(screen.queryByText(/November 16, 2026/i)).toBeNull();

    await waitFor(() => {
      expect(screen.getByText(/2\.0 s corner-lift curl with mark-in-progress guard/i)).toBeTruthy();
      expect(screen.getByText(/59 vocabulario y pistas de voz humana/i)).toBeTruthy();
      expect(screen.getByText(/Live on desktop and phone; untouched\./i)).toBeTruthy();
    });

    expect(screen.queryByText(/not available in this draft/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Accept original" })).toBeNull();
  });
});
