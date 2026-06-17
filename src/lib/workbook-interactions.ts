/**
 * workbook-interactions.ts
 *
 * Interaction model for the official workbook activity layer.
 * Activities attach to official workbook pages without requiring
 * verified object hotspot coordinates until source-art mapping is done.
 */

import interactionsData from "@/data/workbook-interactions.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InteractionKind =
  | "tap-object"
  | "drag-word-to-image"
  | "drag-syllable-to-slot"
  | "drag-build-word"
  | "match-word-image"
  | "listen-and-tap"
  | "trace-or-copy"
  | "read-aloud"
  | "mini-story";

/**
 * How derived/authoritative this interaction is.
 * "book-derived" = fully sourced from verified book text/structure.
 * "needs-transcription" = page exists but exact text not verified yet.
 * "needs-art-mapping" = activity requires exact object location/art not yet mapped.
 * "verified" = interaction is complete with confirmed coordinates and content.
 */
export type InteractionSourceStatus =
  | "book-derived"
  | "needs-transcription"
  | "needs-art-mapping"
  | "verified";

export type InteractionTranscriptionStatus = "verified" | "placeholder" | "missing";

/** A single draggable/tappable item in the activity. */
export type InteractionItem = {
  id: string;
  label: string;
  /** Optional asset path for image chip display. */
  assetRef?: string;
};

/** A drop target slot or reveal zone. */
export type InteractionTarget = {
  id: string;
  label: string;
  /** Optional verified percentage coordinates on a page image. */
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  /** If false, coordinates are NOT verified and hotspot mode is unavailable. */
  coordinatesVerified?: boolean;
  acceptsItemId?: string;
  /** Optional id of a PageRegion (see book-faithful.ts) to target on a faithful-HTML page instead of raw coordinates. */
  regionId?: string;
};

export type InteractionFeedback = {
  correct: string;
  incorrect?: string;
  hint?: string;
};

export type WorkbookInteraction = {
  id: string;
  lessonNumber: number;
  pageNumber: number;
  kind: InteractionKind;
  title: string;
  prompt: string;
  items: InteractionItem[];
  targets: InteractionTarget[];
  correctAnswer?: string;
  assetRef?: string;
  feedback?: InteractionFeedback;
  sourceStatus: InteractionSourceStatus;
  transcriptionStatus: InteractionTranscriptionStatus;
  /** Student-facing status string. Keep encouraging, no developer jargon. */
  studentFacingStatus: string;
  teacherNotes?: string;
};

export type WorkbookPageInteractionSet = {
  lessonNumber: number;
  pageNumber: number;
  interactions: WorkbookInteraction[];
  hasVerifiedHotspots: boolean;
  readyCount: number;
  pendingArtCount: number;
  pendingTranscriptionCount: number;
};

export type WorkbookInteractionReadiness = {
  lessonNumber: number;
  totalInteractions: number;
  readyCount: number;
  pendingArtMappingCount: number;
  pendingTranscriptionCount: number;
  hasAnyVerifiedHotspots: boolean;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type RawInteractionData = {
  interactions: WorkbookInteraction[];
};

const raw = interactionsData as unknown as RawInteractionData;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if this interaction has confirmed coordinate-based hotspots. */
export function hasVerifiedHotspots(interaction: WorkbookInteraction): boolean {
  return interaction.targets.some(
    (target) => target.coordinatesVerified === true && target.xPercent !== undefined,
  );
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** All interactions for a given lesson number. */
export function getInteractionsForLesson(lessonNumber: number): WorkbookInteraction[] {
  return raw.interactions.filter((i) => i.lessonNumber === lessonNumber);
}

/** All interactions for a specific page within a lesson. */
export function getInteractionsForPage(
  lessonNumber: number,
  pageNumber: number,
): WorkbookInteraction[] {
  return raw.interactions.filter(
    (i) => i.lessonNumber === lessonNumber && i.pageNumber === pageNumber,
  );
}

/** Returns interaction readiness summary for a lesson's page set. */
export function getInteractionReadinessForLesson(
  lessonNumber: number,
  pageNumbers: number[],
): WorkbookInteractionReadiness {
  const interactions = getInteractionsForLesson(lessonNumber).filter((i) =>
    pageNumbers.includes(i.pageNumber),
  );

  const readyCount = interactions.filter(
    (i) => i.sourceStatus === "verified" || i.sourceStatus === "book-derived",
  ).length;

  const pendingArtMappingCount = interactions.filter(
    (i) => i.sourceStatus === "needs-art-mapping",
  ).length;

  const pendingTranscriptionCount = interactions.filter(
    (i) => i.sourceStatus === "needs-transcription",
  ).length;

  const hasAnyVerifiedHotspots = interactions.some(hasVerifiedHotspots);

  return {
    lessonNumber,
    totalInteractions: interactions.length,
    readyCount,
    pendingArtMappingCount,
    pendingTranscriptionCount,
    hasAnyVerifiedHotspots,
  };
}

/** Build a WorkbookPageInteractionSet for a single page. */
export function getPageInteractionSet(
  lessonNumber: number,
  pageNumber: number,
): WorkbookPageInteractionSet {
  const interactions = getInteractionsForPage(lessonNumber, pageNumber);
  return {
    lessonNumber,
    pageNumber,
    interactions,
    hasVerifiedHotspots: interactions.some(hasVerifiedHotspots),
    readyCount: interactions.filter(
      (i) => i.sourceStatus === "verified" || i.sourceStatus === "book-derived",
    ).length,
    pendingArtCount: interactions.filter((i) => i.sourceStatus === "needs-art-mapping").length,
    pendingTranscriptionCount: interactions.filter(
      (i) => i.sourceStatus === "needs-transcription",
    ).length,
  };
}
