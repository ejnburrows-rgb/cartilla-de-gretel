/**
 * TutorFlipchartPresenter — Milestone 7 Flip Chart Choreography surface.
 *
 * Reuses the existing canonical Flip Chart renderer (`FlipchartReplicaSheet`
 * via `FlipchartNativeBoard`, never duplicating or modifying Candidate A
 * internals) and overlays verified highlight regions computed from
 * `src/data/flipchart-art-placement.json` and
 * `src/data/flipchart-art-content-bounds.json`.
 *
 * Cue timing (`"before" | "atStart" | "atWord"`) is driven by real media
 * playback boundaries (`TutorPlaybackPosition`), never wall-clock guesses,
 * so highlighted regions appear before or right at speech start.
 */
import { useMemo, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FlipchartNativeBoard } from "@/components/cartilla/FlipchartNativeBoard";
import { FLIPCHART_PAGES, getFlipchartPagesForLesson } from "@/lib/flipchart-hd";
import { getReplicaSheet } from "@/lib/flipchart-replica";
import {
  resolveActiveFlipchartCues,
  resolveVerifiedFlipchartRegions,
  type FlipchartChoreographyCue,
  type FlipchartHighlightRegion,
} from "@/lib/tutor-tools";
import type { TutorPlaybackPosition } from "@/lib/tutor-voice";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface TutorFlipchartPresenterProps {
  /** Canonical Flip Chart sheet number (1–62). */
  sheetNumber: number;
  /** Optional lesson number for sheet navigation strip. */
  lesson?: number;
  /** Scheduled choreography cues for this sheet. */
  cues?: readonly FlipchartChoreographyCue[];
  /** Explicit highlighted regionId (always shown in addition to active cues). */
  highlightedRegionId?: string | null;
  /** Real media playback position from `tutor-voice.ts` (drives cue timing). */
  playbackPosition?: TutorPlaybackPosition | null;
  /** Whether Gretel's approved recording is currently playing. */
  isSpeaking?: boolean;
  /** Optional callback when the student or tutor switches sheets. */
  onSheetChange?: (sheetNumber: number) => void;
  /** Optional callback when the student taps a verified highlight region. */
  onRegionSelect?: (region: FlipchartHighlightRegion) => void;
  /** Hide navigation chrome when embedded in tight PiP/split layouts. */
  compact?: boolean;
  className?: string;
}

/**
 * Compute normalized (0–100%) bounding rects of important sheet regions so
 * `TutorCallShell` Mode C PiP Gretel can avoid covering active content.
 */
export function getFlipchartImportantRects(
  sheetNumber: number,
  activeRegionIds: readonly string[] = [],
): ReadonlyArray<{ regionId: string; xPct: number; yPct: number; wPct: number; hPct: number }> {
  const regions = resolveVerifiedFlipchartRegions(sheetNumber);
  if (activeRegionIds.length > 0) {
    const activeSet = new Set(activeRegionIds);
    const active = regions.filter((r) => activeSet.has(r.regionId));
    if (active.length > 0) {
      return active.map(({ regionId, xPct, yPct, wPct, hPct }) => ({
        regionId,
        xPct,
        yPct,
        wPct,
        hPct,
      }));
    }
  }
  return regions
    .filter((r) => r.kind === "art" || r.kind === "scene" || r.kind === "letter")
    .map(({ regionId, xPct, yPct, wPct, hPct }) => ({
      regionId,
      xPct,
      yPct,
      wPct,
      hPct,
    }));
}

function regionOverlayStyle(region: FlipchartHighlightRegion): CSSProperties {
  return {
    left: `${region.xPct}%`,
    top: `${region.yPct}%`,
    width: `${region.wPct}%`,
    height: `${region.hPct}%`,
  };
}

function sheetAspectStyle(width: number, height: number): CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
  };
}

export function TutorFlipchartPresenter({
  sheetNumber,
  lesson,
  cues = [],
  highlightedRegionId = null,
  playbackPosition = null,
  isSpeaking = false,
  onSheetChange,
  onRegionSelect,
  compact = false,
  className = "",
}: TutorFlipchartPresenterProps) {
  const reducedMotion = useReducedMotion();

  const page = useMemo(
    () => FLIPCHART_PAGES.find((p) => p.flipchartPage === sheetNumber) ?? null,
    [sheetNumber],
  );

  const lessonSheets = useMemo(() => {
    const targetLesson = lesson ?? page?.lesson;
    if (!targetLesson) return [];
    return getFlipchartPagesForLesson(targetLesson).map((p) => p.flipchartPage);
  }, [lesson, page?.lesson]);

  const replica = useMemo(() => getReplicaSheet(sheetNumber), [sheetNumber]);
  const regions = useMemo(() => resolveVerifiedFlipchartRegions(sheetNumber), [sheetNumber]);

  const activeCues = useMemo(
    () =>
      resolveActiveFlipchartCues(
        cues.filter((cue) => cue.sheetNumber === sheetNumber),
        {
          isPlaying: isSpeaking || Boolean(playbackPosition && playbackPosition.currentTime > 0),
          currentTime: playbackPosition?.currentTime ?? 0,
          lineId: playbackPosition?.lineId ?? null,
        },
      ),
    [cues, sheetNumber, isSpeaking, playbackPosition],
  );

  const activeRegions = useMemo(() => {
    const byId = new Map(regions.map((r) => [r.regionId, r]));
    const picked = new Map<string, { region: FlipchartHighlightRegion; cueTiming?: string }>();

    for (const cue of activeCues) {
      const region = byId.get(cue.regionId);
      if (region) {
        picked.set(region.regionId, { region, cueTiming: cue.cueTiming });
      }
    }

    if (highlightedRegionId) {
      const direct = byId.get(highlightedRegionId);
      if (direct && !picked.has(direct.regionId)) {
        picked.set(direct.regionId, { region: direct, cueTiming: "before" });
      }
    }

    return Array.from(picked.values());
  }, [regions, activeCues, highlightedRegionId]);

  if (!page) {
    return (
      <section
        className={`flex h-full w-full items-center justify-center rounded-3xl border border-stone-200/80 bg-[#fcfaf5] p-6 text-center text-stone-600 ${className}`}
        data-testid="tutor-flipchart-unavailable"
        aria-label="Rotafolio no disponible"
      >
        <p className="text-sm font-semibold">
          La lámina {sheetNumber} del rotafolio no está disponible.
        </p>
      </section>
    );
  }

  const sheetIdx = lessonSheets.indexOf(sheetNumber);
  const prevSheet = sheetIdx > 0 ? lessonSheets[sheetIdx - 1] : null;
  const nextSheet =
    sheetIdx >= 0 && sheetIdx < lessonSheets.length - 1 ? lessonSheets[sheetIdx + 1] : null;
  const aspectWidth = replica?.width ?? 1000;
  const aspectHeight = replica?.height ?? 1380;

  return (
    <section
      className={`flex h-full min-h-0 w-full flex-col rounded-3xl border border-[#e5d8c5] bg-[#faf6ee] shadow-sm ${className}`}
      data-testid="tutor-flipchart-presenter"
      data-sheet-number={sheetNumber}
      data-active-cue-count={activeRegions.length}
      aria-label={`Rotafolio — Lámina ${sheetNumber}`}
    >
      {!compact && (
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[#e8dcc8] bg-white/75 px-4 py-2.5 rounded-t-3xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="rounded-full bg-[#bb0733]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#bb0733]">
              Rotafolio · Lámina {sheetNumber}
            </span>
            <span className="truncate text-xs font-semibold text-stone-600">
              Lección {page.lesson}
            </span>
          </div>

          {onSheetChange && lessonSheets.length > 1 && (
            <div className="flex items-center gap-1" role="group" aria-label="Navegación del rotafolio">
              <button
                type="button"
                disabled={prevSheet === null}
                onClick={() => prevSheet !== null && onSheetChange(prevSheet)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-40"
                aria-label="Lámina anterior"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="px-2 text-xs font-bold text-stone-600">
                {sheetIdx + 1} / {lessonSheets.length}
              </span>
              <button
                type="button"
                disabled={nextSheet === null}
                onClick={() => nextSheet !== null && onSheetChange(nextSheet)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-40"
                aria-label="Lámina siguiente"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </header>
      )}

      {/* Aspect-ratio preserving stage hosting the real Flip Chart renderer */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-3">
        <div
          className="relative max-h-full max-w-full w-auto h-full overflow-hidden rounded-2xl bg-white shadow-md"
          style={sheetAspectStyle(aspectWidth, aspectHeight)}
        >
          <div className="absolute inset-0 h-full w-full [&>.fc-native-board]:h-full [&>.fc-native-board]:w-full">
            <FlipchartNativeBoard page={page} />
          </div>

          {/* Verified choreography highlight overlay layer (pointer-events-none except interactive targets) */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            data-testid="tutor-flipchart-highlights"
            aria-live="polite"
          >
            {activeRegions.map(({ region, cueTiming }) => (
              <button
                key={region.regionId}
                type="button"
                onClick={onRegionSelect ? () => onRegionSelect(region) : undefined}
                tabIndex={onRegionSelect ? 0 : -1}
                style={regionOverlayStyle(region)}
                data-testid="tutor-flipchart-highlight"
                data-region-id={region.regionId}
                data-cue-timing={cueTiming ?? "before"}
                data-bounds-verified={region.contentBoundsVerified ? "true" : "false"}
                className={`absolute rounded-2xl border-[3px] border-[#d97706] bg-[#fef3c7]/25 shadow-[0_0_0_4px_rgba(217,119,6,0.22)] ${
                  onRegionSelect ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                } ${reducedMotion ? "" : "transition-all duration-200 ease-out"}`}
                aria-label={`Región destacada: ${region.label}`}
              >
                <span className="sr-only">{region.label}</span>
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#b45309] px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm"
                >
                  <Sparkles className="h-3 w-3" />
                  {region.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
