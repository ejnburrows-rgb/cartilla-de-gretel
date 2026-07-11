import type {
  ManifestInteraction,
  ManifestObject,
  ManifestPage,
  ManifestPageStatus,
} from "./manifest-schema";
import type {
  InteractionKind,
  ObjectMotion,
  PhysicalPage,
  PhysicalPageStatus,
  WorkbookObject,
} from "./types";

/**
 * Converts a validated census ManifestPage (manifest-schema.ts's shape —
 * what Grok's pipeline actually produces) into the engine's PhysicalPage /
 * WorkbookObject shape (types.ts — what LivingWorkbookPage actually
 * renders). Kept as its own module so the mapping decisions below are
 * documented and testable in isolation from file I/O.
 */

const STATUS_MAP: Record<ManifestPageStatus, PhysicalPageStatus> = {
  mapped: "draft",
  "cropping-ready": "draft",
  "colorization-ready": "draft",
  "implementation-ready": "draft",
  complete: "verified",
};

const MOTION_KINDS = new Set(["none", "float", "bob", "breathe", "blink"]);

/**
 * Census `mechanic` → engine `InteractionKind`. Only 5 rendering primitives
 * exist today (see src/cartilla/interactions/*), so mechanics without a
 * natural fit ("order", "trace") intentionally fall back to "none" — the
 * page still renders (instruction + objects + text), it just isn't
 * interactive yet, which is honest given no matching component exists.
 * "read" only becomes "tap-to-hear" when the page actually has audio data;
 * otherwise it's just read-aloud text with nothing to tap.
 */
function mechanicToInteractionKind(
  interaction: ManifestInteraction | undefined,
  hasAudio: boolean,
): InteractionKind {
  if (!interaction) return "none";
  switch (interaction.mechanic) {
    case "select":
      return "tap-select";
    case "drag":
      return "drag-place";
    case "match":
    case "connect":
      return "pair-match";
    case "read":
      return hasAudio ? "tap-to-hear" : "none";
    case "order":
    case "trace":
    case "none":
    default:
      return "none";
  }
}

function toMotion(raw: string | undefined): ObjectMotion | undefined {
  if (!raw) return undefined;
  const kind = MOTION_KINDS.has(raw) ? (raw as ObjectMotion["kind"]) : "none";
  return { kind };
}

/**
 * Builds the per-object `interaction.data` bag each interaction component
 * actually needs, from the page-level `answers`/`targets` arrays — the
 * census schema only tracks correctness/pairing at the page level, so this
 * is the documented bridge until/unless Grok's real data proves a
 * different convention is needed:
 *   - tap-select: an object is correct if its id is listed in `answers`.
 *   - drag-place: `answers[i]` (a draggable object's id) pairs positionally
 *     with `targets[i]` (the target object's id it belongs on).
 *   - pair-match: `answers[i]` and `targets[i]` are a left/right pair,
 *     sharing a generated pairId of `pair-i`.
 */
function buildObjectInteractionData(
  kind: InteractionKind,
  object: ManifestObject,
  interaction: ManifestInteraction | undefined,
): Record<string, unknown> | undefined {
  if (!interaction) return undefined;
  const answers = interaction.answers ?? [];
  const targets = interaction.targets ?? [];

  switch (kind) {
    case "tap-select":
      return { correct: answers.includes(object.id) };
    case "drag-place": {
      const dragIndex = answers.indexOf(object.id);
      if (dragIndex !== -1) return { role: "draggable", targetId: targets[dragIndex] };
      if (targets.includes(object.id)) return { role: "target" };
      return undefined;
    }
    case "pair-match": {
      const leftIndex = answers.indexOf(object.id);
      if (leftIndex !== -1) return { role: "left", pairId: `pair-${leftIndex}` };
      const rightIndex = targets.indexOf(object.id);
      if (rightIndex !== -1) return { role: "right", pairId: `pair-${rightIndex}` };
      return undefined;
    }
    case "mark-circle":
      return { correct: answers.includes(object.id) };
    default:
      return undefined;
  }
}

function toEngineObject(
  object: ManifestObject,
  kind: InteractionKind,
  interaction: ManifestInteraction | undefined,
): WorkbookObject {
  const isInteractive = Boolean(object.interactive) && kind !== "none";
  const data = isInteractive ? buildObjectInteractionData(kind, object, interaction) : undefined;
  return {
    id: object.id,
    ...(object.asset ? { src: object.asset } : {}),
    box: {
      xPct: object.x,
      yPct: object.y,
      wPct: object.width,
      // Census objects don't always carry a height — falling back to width
      // (a square) is a documented placeholder, not a guess at real art
      // dimensions; it only affects layout of not-yet-cropped objects.
      hPct: object.height ?? object.width,
    },
    ...(object.z !== undefined ? { zIndex: object.z } : {}),
    ...(object.word ? { text: object.word, alt: object.word } : {}),
    ...(toMotion(object.motion) ? { motion: toMotion(object.motion) } : {}),
    ...(object.audioId ? { audio: { src: "", label: object.audioId } } : {}),
    ...(isInteractive && data ? { interaction: { kind, data } } : {}),
  };
}

export function manifestPageToEnginePage(page: ManifestPage): PhysicalPage {
  const hasAudio = Boolean(page.audio?.length) || page.objects.some((o) => o.audioId);
  const kind = mechanicToInteractionKind(page.interaction, hasAudio);
  return {
    id: `page-${page.physicalPage}`,
    pageNumber: page.physicalPage,
    lessonNumber: page.lesson,
    backgroundSrc: page.background ?? null,
    ...(page.instruction ? { instruction: page.instruction } : {}),
    ...(kind !== "none" ? { interaction: { kind } } : {}),
    objects: page.objects.map((object) => toEngineObject(object, kind, page.interaction)),
    status: STATUS_MAP[page.status],
    ...(page.source ? { source: page.source } : {}),
  };
}
