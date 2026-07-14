import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LivingWorkbookPage, type InteractionResult } from "@/components/cartilla/LivingWorkbookPage";
import { TapToHear } from "@/cartilla/interactions/TapToHear";
import { MarkCircle } from "@/cartilla/interactions/MarkCircle";
import type { PhysicalPage, WorkbookObject } from "@/content/workbook/types";

export const Route = createFileRoute("/dev-living-workbook")({
  component: DevLivingWorkbookSandbox,
});

/**
 * ⚠️ SAMPLE DATA — none of this is real book content. Three fake
 * PhysicalPage records, one per major interaction shape, proving the
 * LivingWorkbookPage engine end-to-end: percent-positioned objects, real
 * web text, ambient motion, and a graded interaction slot.
 */
const SAMPLE_PAGES: PhysicalPage[] = [
  {
    id: "sample-tap-select",
    pageNumber: null,
    lessonNumber: null,
    backgroundSrc: null,
    status: "sample",
    source: "FAKE sample record — engine proof only, not real book content",
    interaction: { kind: "tap-select" },
    objects: [
      {
        id: "shape-a",
        text: "🔺",
        box: { xPct: 8, yPct: 30, wPct: 22, hPct: 40 },
        interaction: { kind: "tap-select", data: { correct: false } },
      },
      {
        id: "shape-b",
        text: "🟦",
        box: { xPct: 39, yPct: 30, wPct: 22, hPct: 40 },
        interaction: { kind: "tap-select", data: { correct: true } },
      },
      {
        id: "shape-c",
        text: "🟨",
        box: { xPct: 70, yPct: 30, wPct: 22, hPct: 40 },
        interaction: { kind: "tap-select", data: { correct: false } },
      },
      {
        id: "prompt",
        text: "Sample prompt: tap the square.",
        box: { xPct: 5, yPct: 5, wPct: 90, hPct: 15 },
        motion: { kind: "none" },
      },
    ],
  },
  {
    id: "sample-drag-place",
    pageNumber: null,
    lessonNumber: null,
    backgroundSrc: null,
    status: "sample",
    source: "FAKE sample record — engine proof only, not real book content",
    interaction: { kind: "drag-place" },
    objects: [
      {
        id: "prompt-2",
        text: "Sample prompt: drag each shape onto its matching outline.",
        box: { xPct: 5, yPct: 3, wPct: 90, hPct: 12 },
      },
      {
        id: "drag-star",
        text: "⭐",
        box: { xPct: 10, yPct: 60, wPct: 18, hPct: 30 },
        motion: { kind: "float", delayMs: 0, durationMs: 2600 },
        interaction: { kind: "drag-place", data: { role: "draggable", targetId: "target-star" } },
      },
      {
        id: "drag-heart",
        text: "❤️",
        box: { xPct: 40, yPct: 60, wPct: 18, hPct: 30 },
        motion: { kind: "float", delayMs: 300, durationMs: 2600 },
        interaction: { kind: "drag-place", data: { role: "draggable", targetId: "target-heart" } },
      },
      {
        id: "target-heart",
        text: "🤍",
        box: { xPct: 20, yPct: 20, wPct: 18, hPct: 30 },
        interaction: { kind: "drag-place", data: { role: "target" } },
      },
      {
        id: "target-star",
        text: "☆",
        box: { xPct: 55, yPct: 20, wPct: 18, hPct: 30 },
        interaction: { kind: "drag-place", data: { role: "target" } },
      },
    ],
  },
  {
    id: "sample-pair-match",
    pageNumber: null,
    lessonNumber: null,
    backgroundSrc: null,
    status: "sample",
    source: "FAKE sample record — engine proof only, not real book content",
    interaction: { kind: "pair-match" },
    objects: [
      {
        id: "prompt-3",
        text: "Sample prompt: match each animal to its sound.",
        box: { xPct: 5, yPct: 3, wPct: 90, hPct: 12 },
      },
      {
        id: "left-cat",
        text: "🐱",
        box: { xPct: 10, yPct: 25, wPct: 18, hPct: 22 },
        interaction: { kind: "pair-match", data: { role: "left", pairId: "cat" } },
      },
      {
        id: "left-dog",
        text: "🐶",
        box: { xPct: 10, yPct: 55, wPct: 18, hPct: 22 },
        interaction: { kind: "pair-match", data: { role: "left", pairId: "dog" } },
      },
      {
        id: "right-woof",
        text: "\"Woof\"",
        box: { xPct: 70, yPct: 25, wPct: 22, hPct: 22 },
        interaction: { kind: "pair-match", data: { role: "right", pairId: "dog" } },
      },
      {
        id: "right-meow",
        text: "\"Meow\"",
        box: { xPct: 70, yPct: 55, wPct: 22, hPct: 22 },
        interaction: { kind: "pair-match", data: { role: "right", pairId: "cat" } },
      },
    ],
  },
];

/** Bonus standalone proofs for the two interactions that don't need a full
 * page record to demonstrate (tap-to-hear, mark-circle) — same components
 * LivingWorkbookPage would dispatch to, wired directly for this sandbox. */
const TAP_TO_HEAR_OBJECTS: WorkbookObject[] = [
  { id: "hear-a", text: "🔔", box: { xPct: 5, yPct: 10, wPct: 25, hPct: 80 }, audio: { src: "", label: "campana (sample, no audio file yet)" } },
  { id: "hear-b", text: "🎵", box: { xPct: 37, yPct: 10, wPct: 25, hPct: 80 }, audio: { src: "", label: "nota (sample, no audio file yet)" } },
  { id: "hear-c", text: "🥁", box: { xPct: 69, yPct: 10, wPct: 25, hPct: 80 }, audio: { src: "", label: "tambor (sample, no audio file yet)" } },
];

const MARK_CIRCLE_OBJECTS: WorkbookObject[] = [
  { id: "mark-a", text: "🍎", box: { xPct: 5, yPct: 10, wPct: 20, hPct: 80 }, interaction: { kind: "mark-circle", data: { correct: true } } },
  { id: "mark-b", text: "🚗", box: { xPct: 28, yPct: 10, wPct: 20, hPct: 80 }, interaction: { kind: "mark-circle", data: { correct: false } } },
  { id: "mark-c", text: "🍌", box: { xPct: 51, yPct: 10, wPct: 20, hPct: 80 }, interaction: { kind: "mark-circle", data: { correct: true } } },
  { id: "mark-d", text: "🚲", box: { xPct: 74, yPct: 10, wPct: 20, hPct: 80 }, interaction: { kind: "mark-circle", data: { correct: false } } },
];

function ResultLog({ label, log, done }: { label: string; log: string[]; done: boolean }) {
  return (
    <div className="text-xs font-mono mt-2 text-foreground/70">
      <div className="font-bold">{label}: {done ? "✅ complete" : "in progress"}</div>
      {log.slice(-4).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}

function DevLivingWorkbookSandbox() {
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const makeHandlers = (pageId: string) => ({
    onInteractionResult: (r: InteractionResult) => {
      setLogs((prev) => ({
        ...prev,
        [pageId]: [...(prev[pageId] ?? []), `${r.objectId}: ${r.result}`],
      }));
    },
    onComplete: () => setDone((prev) => ({ ...prev, [pageId]: true })),
  });

  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-3xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Living Workbook Page — engine sandbox</h1>
        <p className="text-sm text-foreground/60 mt-1">
          ⚠️ Every record on this page is FAKE sample data used only to prove the data-driven page
          engine (types.ts + LivingWorkbookPage.tsx + src/cartilla/interactions/*). Nothing here is
          real book content, and nothing here is wired into any real lesson route.
        </p>
      </header>

      {SAMPLE_PAGES.map((page) => {
        const handlers = makeHandlers(page.id);
        return (
          <section key={page.id}>
            <h2 className="text-lg font-bold mb-1">{page.id}</h2>
            <p className="text-xs text-foreground/50 mb-2">interaction: {page.interaction?.kind} · source: {page.source}</p>
            <LivingWorkbookPage page={page} {...handlers} />
            <ResultLog label={page.id} log={logs[page.id] ?? []} done={Boolean(done[page.id])} />
          </section>
        );
      })}

      <section>
        <h2 className="text-lg font-bold mb-1">bonus: tap-to-hear (standalone proof)</h2>
        <p className="text-xs text-foreground/50 mb-2">
          audio.src is "" for all three — safe no-op per project convention; tapping still gives visual feedback.
        </p>
        <div className="relative w-full" style={{ aspectRatio: "4 / 1.2" }}>
          <TapToHear
            objects={TAP_TO_HEAR_OBJECTS}
            reducedMotion={false}
            onComplete={() => setDone((prev) => ({ ...prev, "tap-to-hear": true }))}
          />
        </div>
        <ResultLog label="tap-to-hear" log={[]} done={Boolean(done["tap-to-hear"])} />
      </section>

      <section>
        <h2 className="text-lg font-bold mb-1">bonus: mark-circle (standalone proof)</h2>
        <p className="text-xs text-foreground/50 mb-2">Circle the two food items.</p>
        <div className="relative w-full" style={{ aspectRatio: "4 / 1.2" }}>
          <MarkCircle
            objects={MARK_CIRCLE_OBJECTS}
            reducedMotion={false}
            onResult={(r) =>
              setLogs((prev) => ({ ...prev, "mark-circle": [...(prev["mark-circle"] ?? []), `${r.objectId}: ${r.result}`] }))
            }
            onComplete={() => setDone((prev) => ({ ...prev, "mark-circle": true }))}
          />
        </div>
        <ResultLog label="mark-circle" log={logs["mark-circle"] ?? []} done={Boolean(done["mark-circle"])} />
      </section>
    </div>
  );
}
