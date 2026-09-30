/**
 * Page completion gate (owner rule): a student may always go back, but may
 * not press Siguiente / Terminar until the required activity on the current
 * printed page is complete.
 *
 * No parallel progress system: completion is fed ONLY by the existing
 * `activity:complete` events every workbook activity already emits on the
 * Gretel bus (activityId = `page-<n>-<regionId>`, set by GretelActivity), and
 * persisted through lesson-progress.ts next to completed lessons.
 */
import { useEffect, useMemo, useState } from "react";
import { getPageLayout, type PageRegion } from "@/lib/book-faithful";
import { getLetterTemplate } from "@/components/cartilla/letter-stroke-templates";
import { onGretelEvent } from "@/lib/gretel-bus";
import {
  getCompletedPageActivities,
  isLessonCompleted,
  markPageActivityCompleted,
} from "@/lib/lesson-progress";

export type RequiredActivity = { id: string; regionId: string; kind: string; label: string };

const LABELS: Record<string, string> = {
  "picture-grid": "los dibujos",
  "vowel-line-match": "las líneas hasta los dibujos",
  "vowel-pick-one": "la vocal de cada dibujo",
  "vowel-match-all": "las parejas de vocales",
  "syllable-match": "las palabras con la sílaba",
  "fill-in-blank": "las palabras para completar",
  "writing-response": "tus oraciones",
  "draw-box": "tu dibujo",
  "paint-box": "el dibujo para colorear",
};

function hasContent(region: PageRegion): boolean {
  switch (region.regionType) {
    case "picture-grid":
    case "vowel-line-match":
      return (region.cells?.length ?? 0) > 0;
    case "vowel-pick-one":
      return (region.vowelRows?.length ?? 0) > 0;
    case "vowel-match-all":
      return (region.vowelPairs?.length ?? 0) > 0;
    case "syllable-match":
      return (region.matchRows?.flat().length ?? 0) > 0;
    case "fill-in-blank":
      return (region.fillItems?.length ?? 0) > 0;
    case "writing-response":
    case "draw-box":
    case "paint-box":
      return true;
    default:
      return false;
  }
}

/**
 * Required activities of one printed page, in reading order. Mirrors what
 * FaithfulPageRenderer renders interactively: a writing line is required only
 * when a verified stroke template makes it a real tracing exercise. Pages with
 * only reading/instruction content have no requirement (the reading itself is
 * the page's work), so they can never become permanently blocked.
 */
export function requiredActivitiesForPage(pageNumber: number): RequiredActivity[] {
  const regions = [...(getPageLayout(pageNumber) ?? [])].sort((a, b) => a.order - b.order);
  const out: RequiredActivity[] = [];
  let lastModel: string | undefined;
  for (const region of regions) {
    const id = `page-${pageNumber}-${region.id}`;
    if (region.regionType === "writing-line") {
      const letter = region.modelText || lastModel;
      lastModel = region.modelText || lastModel;
      if (letter && getLetterTemplate(letter) !== null) {
        out.push({ id, regionId: region.id, kind: region.regionType, label: `el trazo de la letra ${letter}` });
      }
      continue;
    }
    if (LABELS[region.regionType] && hasContent(region)) {
      out.push({ id, regionId: region.id, kind: region.regionType, label: LABELS[region.regionType]! });
    }
  }
  return out;
}

export type PageCompletionState = {
  required: RequiredActivity[];
  remaining: RequiredActivity[];
  complete: boolean;
};

export function pageCompletionState(
  pageNumber: number,
  lessonNumber?: number,
  done: Iterable<string> = getCompletedPageActivities(pageNumber),
): PageCompletionState {
  const required = requiredActivitiesForPage(pageNumber);
  if (lessonNumber && isLessonCompleted(lessonNumber)) {
    return { required, remaining: [], complete: true };
  }
  const doneSet = new Set(done);
  const remaining = required.filter((activity) => !doneSet.has(activity.id));
  return { required, remaining, complete: remaining.length === 0 };
}

/** Live completion state for the page on screen. */
export function usePageCompletion(pageNumber: number | undefined, lessonNumber?: number): PageCompletionState {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof pageNumber !== "number") return;
    const prefix = `page-${pageNumber}-`;
    const off = onGretelEvent((type, detail) => {
      if (type !== "activity:complete" || !detail.activityId?.startsWith(prefix)) return;
      markPageActivityCompleted(pageNumber, detail.activityId);
    });
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("cartilla:lesson-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      off();
      window.removeEventListener("cartilla:lesson-progress", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pageNumber]);
  return useMemo(
    () =>
      typeof pageNumber === "number"
        ? pageCompletionState(pageNumber, lessonNumber)
        : { required: [], remaining: [], complete: true },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageNumber, lessonNumber, tick],
  );
}

/** Friendly Spanish hint naming what is still missing on the page. */
export function remainingHint(remaining: RequiredActivity[]): string {
  if (remaining.length === 0) return "";
  const labels = [...new Set(remaining.map((r) => r.label))];
  const list =
    labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
  return `¡Casi! Antes de seguir, termina ${list}.`;
}
