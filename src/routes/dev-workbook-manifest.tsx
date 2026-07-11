import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LivingWorkbookPage } from "@/components/cartilla/LivingWorkbookPage";
import {
  getWorkbookPage,
  listAvailablePhysicalPages,
  getWorkbookManifest,
} from "@/content/workbook/loader";
import {
  getQueuedProgressEvents,
  flushProgressEvents,
  clearProgressEventsQueue,
  type ProgressEvent,
} from "@/lib/progress-events";

export const Route = createFileRoute("/dev-workbook-manifest")({
  component: DevWorkbookManifestSandbox,
});

/**
 * Renders every real physical page currently in
 * src/content/workbook/workbook-manifest.json through the LivingWorkbookPage
 * engine — background, positioned illustrations, and whichever interaction
 * (TapSelect/TapToHear/DragPlace/PairMatch/MarkCircle) each page declares —
 * proving the manifest → engine wiring end-to-end with real content. Also
 * offers an arbitrary page-number loader below for testing pages outside
 * the current seed/census. Until real census data exists for a given page
 * number, "no census data for this page yet" is the correct, honest result
 * — never invented content.
 */
function DevWorkbookManifestSandbox() {
  const [pageInput, setPageInput] = useState("1");
  const [loadedPage, setLoadedPage] = useState(Number(pageInput));
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const manifest = getWorkbookManifest();
  const available = listAvailablePhysicalPages();
  const page = getWorkbookPage(loadedPage);

  // Polls the local queue so the panel reflects events fired by
  // LivingWorkbookPage/interactions without needing a callback wired
  // through every layer just for this dev view.
  useEffect(() => {
    const interval = setInterval(() => setEvents(getQueuedProgressEvents()), 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Workbook manifest sandbox</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Renders every real physical page from{" "}
          <code>src/content/workbook/workbook-manifest.json</code> through the LivingWorkbookPage
          engine. Manifest version: <code>{manifest.version}</code> · {manifest.pages.length}{" "}
          page(s) currently in the manifest.
        </p>
      </header>

      <section className="space-y-8">
        <h2 className="text-lg font-bold">
          All real pages currently in the manifest ({available.length})
        </h2>
        {available.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-foreground/20 p-8 text-center text-foreground/60">
            No pages in the manifest yet — this is the correct, honest result until real content
            lands. Nothing is invented here.
          </div>
        ) : (
          available.map((n) => {
            const p = getWorkbookPage(n);
            if (!p) return null;
            return (
              <div key={n} className="space-y-1">
                <h3 className="text-sm font-bold text-foreground/70">
                  Physical page {n} · Lección {p.lessonNumber} · {p.interaction?.kind ?? "static"} ·{" "}
                  {p.status}
                </h3>
                <LivingWorkbookPage page={p} />
              </div>
            );
          })
        )}
      </section>

      <section className="border-t-2 border-foreground/10 pt-6 space-y-3">
        <h2 className="text-lg font-bold">Load an arbitrary page number</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="page-number" className="text-sm font-bold">
            Physical page (1-92):
          </label>
          <input
            id="page-number"
            type="number"
            min={1}
            max={92}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            className="w-20 px-2 py-1 rounded border-2 border-foreground/15"
          />
          <button
            type="button"
            onClick={() => setLoadedPage(Number(pageInput))}
            className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold text-sm"
          >
            Load
          </button>
        </div>

        {page ? (
          <LivingWorkbookPage page={page} />
        ) : (
          <div className="rounded-xl border-2 border-dashed border-foreground/20 p-8 text-center text-foreground/60">
            No census data for physical page {loadedPage} yet. This is the correct, honest result
            until real content lands for it — nothing is invented here.
          </div>
        )}
      </section>

      <section className="border-t-2 border-foreground/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Progress event log</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs px-3 py-1 rounded bg-secondary font-bold"
              onClick={() =>
                void flushProgressEvents().then(() => setEvents(getQueuedProgressEvents()))
              }
            >
              Flush now
            </button>
            <button
              type="button"
              className="text-xs px-3 py-1 rounded bg-destructive/10 text-destructive font-bold"
              onClick={() => {
                clearProgressEventsQueue();
                setEvents([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-xs text-foreground/50 mb-2">
          Events emitted by interacting with the page above, queued locally until a real student
          session exists to flush them through the existing log_student_progress RPC. No student
          session in this dev sandbox, so they'll stay queued here — that's expected.
        </p>
        {events.length === 0 ? (
          <div className="text-xs text-foreground/40 italic">
            No events queued yet — tap or drag something above.
          </div>
        ) : (
          <div className="text-xs font-mono space-y-1 max-h-64 overflow-y-auto">
            {events.map((e, i) => (
              <div key={i}>
                {e.timestamp} — {e.type} — page {e.physicalPage} — lesson {e.lesson ?? "?"} —{" "}
                {e.mechanic ?? "?"}
                {e.attempt !== undefined ? ` — attempt ${e.attempt}` : ""}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
