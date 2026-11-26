import tutorLinesJson from "../content/tutor-lines.json";
import universalManifest from "../content/tutor-dialogue/universal.json";
import lesson01Manifest from "../content/tutor-dialogue/lesson-01.json";
import lesson02Manifest from "../content/tutor-dialogue/lesson-02.json";
import lesson03Manifest from "../content/tutor-dialogue/lesson-03.json";
import lesson04Manifest from "../content/tutor-dialogue/lesson-04.json";
import lesson05Manifest from "../content/tutor-dialogue/lesson-05.json";
import lesson06Manifest from "../content/tutor-dialogue/lesson-06.json";
import lesson07Manifest from "../content/tutor-dialogue/lesson-07.json";
import lesson08Manifest from "../content/tutor-dialogue/lesson-08.json";
import lesson09Manifest from "../content/tutor-dialogue/lesson-09.json";
import lesson10Manifest from "../content/tutor-dialogue/lesson-10.json";
import lesson11Manifest from "../content/tutor-dialogue/lesson-11.json";
import lesson12Manifest from "../content/tutor-dialogue/lesson-12.json";
import lesson13Manifest from "../content/tutor-dialogue/lesson-13.json";
import lesson14Manifest from "../content/tutor-dialogue/lesson-14.json";
import lesson15Manifest from "../content/tutor-dialogue/lesson-15.json";
import lesson16Manifest from "../content/tutor-dialogue/lesson-16.json";
import lesson17Manifest from "../content/tutor-dialogue/lesson-17.json";
import lesson18Manifest from "../content/tutor-dialogue/lesson-18.json";
import lesson19Manifest from "../content/tutor-dialogue/lesson-19.json";
import lesson20Manifest from "../content/tutor-dialogue/lesson-20.json";
import lesson21Manifest from "../content/tutor-dialogue/lesson-21.json";
import lesson22Manifest from "../content/tutor-dialogue/lesson-22.json";
import lesson23Manifest from "../content/tutor-dialogue/lesson-23.json";
import lesson24Manifest from "../content/tutor-dialogue/lesson-24.json";
import {
  DialogueLineV2Schema,
  DialogueManifestFileSchema,
  isRejectedAudioSource,
  type DialogueExpression,
  type DialogueGesture,
  type DialogueLineV2,
  type DialogueManifestFile,
} from "../content/tutor-dialogue/schema";

export interface LegacyTutorLineEntry {
  lineId: string;
  lesson: number;
  role: string;
  text: string;
  src?: string;
  visemes?: string;
  emotion: string;
  approval?: string;
}

interface LegacyManifest {
  approved: LegacyTutorLineEntry[];
  pending: LegacyTutorLineEntry[];
}

const DRAFT_PREFIX = /^\[DRAFT\s+—\s+owner to approve\]\s*/;
const REUSE_SUFFIX = /\s*\(reuse:\s*[A-Za-zÀ-ÿ_ -]+\)$/;

function cleanLegacyText(text: string): string {
  return text.replace(DRAFT_PREFIX, "").replace(REUSE_SUFFIX, "").trim();
}

function mapLegacyEmotion(emotion: string): DialogueExpression {
  switch (emotion) {
    case "excited":
      return "excited";
    case "gentle":
      return "gentle";
    case "encouraging":
      return "encouraging";
    case "calm":
      return "calm";
    default:
      return "warm";
  }
}

function mapLegacyGesture(role: string): DialogueGesture {
  if (role.startsWith("greeting") || role === "closing" || role === "idle-end") return "wave";
  if (role.startsWith("praise")) return "cheer";
  if (role === "silence-nudge" || role === "noise") return "listen";
  if (role === "help" || role === "dont-know") return "help";
  if (role === "close-miss" || role === "try-again" || role === "wrong-word" || role === "confusion") {
    return "gentle-error";
  }
  return "teach";
}

function convertLegacyEntry(
  entry: LegacyTutorLineEntry,
  approved: boolean,
  seq: number,
): DialogueLineV2 {
  const isWordModel = entry.role === "word-model";
  const isVowelModel = entry.role === "vowel-model";
  const cleanText = cleanLegacyText(entry.text);
  const file = entry.src
    ? entry.src.split("/").pop() ?? `${entry.lineId}.mp3`
    : `${entry.lineId}.mp3`;

  return {
    id: entry.lineId,
    text: cleanText,
    batch: approved ? "LEGACY-APPROVED" : "LEGACY-PENDING",
    seq,
    file,
    intent: entry.role,
    role: entry.role,
    variationGroup: `legacy-${entry.role}`,
    curriculumRefs: {
      lesson: entry.lesson,
      words: isWordModel ? [cleanText] : undefined,
      letters: isVowelModel ? [cleanText] : undefined,
      sourceStatus: "verified",
    },
    scope: entry.lesson === 0 ? "universal" : "lesson",
    eligibility: entry.lesson === 0 ? {} : { lessons: [entry.lesson] },
    hintLevel: 0,
    expression: mapLegacyEmotion(entry.emotion),
    gesture: mapLegacyGesture(entry.role),
    presentationAction: isWordModel
      ? "show-word"
      : isVowelModel
        ? "show-letter"
        : "none",
    cueTiming: {
      leadInMs: 0,
      pauseAfterMs: 300,
      syncWith: "before-item",
    },
    expectedResponse: isWordModel || isVowelModel ? "repeat" : "none",
    cooldownTurns: isWordModel || isVowelModel ? 0 : 5,
    priority: approved ? 100 : 40,
    audio: approved
      ? {
          src: entry.src,
          sha256: null,
          durationMs: null,
          visemes: entry.visemes ?? null,
        }
      : {
          sha256: null,
          durationMs: null,
          visemes: null,
        },
    status: approved ? "approved" : "scripted",
    ...(approved && entry.approval ? { approval: entry.approval } : {}),
  };
}

export const V2_MANIFEST_FILES: readonly DialogueManifestFile[] = [
  universalManifest,
  lesson01Manifest,
  lesson02Manifest,
  lesson03Manifest,
  lesson04Manifest,
  lesson05Manifest,
  lesson06Manifest,
  lesson07Manifest,
  lesson08Manifest,
  lesson09Manifest,
  lesson10Manifest,
  lesson11Manifest,
  lesson12Manifest,
  lesson13Manifest,
  lesson14Manifest,
  lesson15Manifest,
  lesson16Manifest,
  lesson17Manifest,
  lesson18Manifest,
  lesson19Manifest,
  lesson20Manifest,
  lesson21Manifest,
  lesson22Manifest,
  lesson23Manifest,
  lesson24Manifest,
] as unknown as DialogueManifestFile[];

const legacyRaw = tutorLinesJson as LegacyManifest;

export const LEGACY_APPROVED_ENTRIES: readonly DialogueLineV2[] = legacyRaw.approved.map(
  (entry, idx) => convertLegacyEntry(entry, true, idx + 1),
);

export const LEGACY_PENDING_ENTRIES: readonly DialogueLineV2[] = legacyRaw.pending.map(
  (entry, idx) => convertLegacyEntry(entry, false, idx + 1),
);

export const LEGACY_ALL_ENTRIES: readonly DialogueLineV2[] = [
  ...LEGACY_APPROVED_ENTRIES,
  ...LEGACY_PENDING_ENTRIES,
];

export const V2_DIALOGUE_ENTRIES: readonly DialogueLineV2[] = V2_MANIFEST_FILES.flatMap(
  (manifest) => manifest.entries,
);

export interface MergedDialogueManifest {
  legacyApproved: readonly DialogueLineV2[];
  legacyPending: readonly DialogueLineV2[];
  v2Entries: readonly DialogueLineV2[];
  allEntries: readonly DialogueLineV2[];
  byId: ReadonlyMap<string, DialogueLineV2>;
}

/**
 * Load and merge the intact legacy `tutor-lines.json` (120 lineIds) with all
 * v2 dialogue manifests (`universal.json` + `lesson-01.json`..`lesson-24.json`).
 *
 * Legacy entries come first so existing lineId lookups remain deterministic
 * and backwards-compatible; newly scripted v2 entries stay `status: "scripted"`
 * with no active audio.
 */
export function loadDialogueManifest(): MergedDialogueManifest {
  const allEntries = [...LEGACY_ALL_ENTRIES, ...V2_DIALOGUE_ENTRIES];
  const byId = new Map<string, DialogueLineV2>();
  for (const entry of allEntries) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }
  return {
    legacyApproved: LEGACY_APPROVED_ENTRIES,
    legacyPending: LEGACY_PENDING_ENTRIES,
    v2Entries: V2_DIALOGUE_ENTRIES,
    allEntries,
    byId,
  };
}

export const MERGED_DIALOGUE_MANIFEST: MergedDialogueManifest = loadDialogueManifest();

export function getDialogueEntry(id: string): DialogueLineV2 | undefined {
  return MERGED_DIALOGUE_MANIFEST.byId.get(id);
}

export function getEntriesByBatch(batch: string): readonly DialogueLineV2[] {
  return MERGED_DIALOGUE_MANIFEST.allEntries.filter((entry) => entry.batch === batch);
}

export function getEntriesByLesson(lesson: number): readonly DialogueLineV2[] {
  return MERGED_DIALOGUE_MANIFEST.allEntries.filter((entry) => {
    const refLesson = entry.curriculumRefs.lesson;
    const eligible = entry.eligibility.lessons;
    if (refLesson === lesson) return true;
    if (eligible && eligible.includes(lesson)) return true;
    return refLesson === 0 && (!eligible || eligible.length === 0);
  });
}

export function getEntriesByRole(role: string, lesson?: number): readonly DialogueLineV2[] {
  return MERGED_DIALOGUE_MANIFEST.allEntries.filter((entry) => {
    if (entry.role !== role) return false;
    if (lesson === undefined) return true;
    const refLesson = entry.curriculumRefs.lesson;
    return refLesson === undefined || refLesson === 0 || refLesson === lesson;
  });
}

export function getEntriesByVariationGroup(group: string): readonly DialogueLineV2[] {
  return MERGED_DIALOGUE_MANIFEST.allEntries.filter((entry) => entry.variationGroup === group);
}

export function getPlayableEntries(): readonly DialogueLineV2[] {
  return MERGED_DIALOGUE_MANIFEST.allEntries.filter(
    (entry) =>
      entry.status === "approved" &&
      typeof entry.audio.src === "string" &&
      entry.audio.src.length > 0 &&
      !isRejectedAudioSource(entry.audio.src),
  );
}

/**
 * Backwards-compatible projection into legacy `TutorLineEntry` shape so callers
 * migrating from `tutor-lines.json` can inspect merged pools without breaking
 * existing `lineId` assumptions. Note: scripted v2 lines have no `src`.
 */
export function toLegacyTutorLineEntries(
  options: { includeV2?: boolean } = {},
): readonly LegacyTutorLineEntry[] {
  const rawLegacy: LegacyTutorLineEntry[] = [...legacyRaw.approved, ...legacyRaw.pending];
  if (!options.includeV2) return rawLegacy;

  const v2Projected: LegacyTutorLineEntry[] = V2_DIALOGUE_ENTRIES.map((entry) => ({
    lineId: entry.id,
    lesson: entry.curriculumRefs.lesson ?? 0,
    role: entry.role,
    text: entry.text,
    ...(entry.status === "approved" && entry.audio.src ? { src: entry.audio.src } : {}),
    ...(entry.status === "approved" && entry.audio.visemes ? { visemes: entry.audio.visemes } : {}),
    emotion: entry.expression,
    ...(entry.approval ? { approval: entry.approval } : {}),
  }));
  return [...rawLegacy, ...v2Projected];
}

export interface ManifestValidationReport {
  ok: boolean;
  errors: string[];
  counts: {
    legacyApproved: number;
    legacyPending: number;
    v2Files: number;
    v2Entries: number;
    totalMerged: number;
  };
}

export function validateAllDialogueManifests(): ManifestValidationReport {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenBatchSeq = new Set<string>();

  for (const legacy of LEGACY_ALL_ENTRIES) {
    const parsed = DialogueLineV2Schema.safeParse(legacy);
    if (!parsed.success) {
      errors.push(`legacy ${legacy.id}: ${parsed.error.issues.map((i) => i.message).join("; ")}`);
    }
    if (seenIds.has(legacy.id)) {
      errors.push(`duplicate id "${legacy.id}"`);
    }
    seenIds.add(legacy.id);
  }

  for (let i = 0; i < V2_MANIFEST_FILES.length; i++) {
    const file = V2_MANIFEST_FILES[i];
    const parsedFile = DialogueManifestFileSchema.safeParse(file);
    if (!parsedFile.success) {
      errors.push(
        `v2 file[${i}]: ${parsedFile.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`).join("; ")}`,
      );
      continue;
    }
    for (const entry of parsedFile.data.entries) {
      if (seenIds.has(entry.id)) {
        errors.push(`duplicate id "${entry.id}"`);
      }
      seenIds.add(entry.id);
      const batchSeqKey = `${entry.batch}#${entry.seq}`;
      if (seenBatchSeq.has(batchSeqKey)) {
        errors.push(`duplicate batch/seq "${batchSeqKey}"`);
      }
      seenBatchSeq.add(batchSeqKey);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    counts: {
      legacyApproved: LEGACY_APPROVED_ENTRIES.length,
      legacyPending: LEGACY_PENDING_ENTRIES.length,
      v2Files: V2_MANIFEST_FILES.length,
      v2Entries: V2_DIALOGUE_ENTRIES.length,
      totalMerged: MERGED_DIALOGUE_MANIFEST.allEntries.length,
    },
  };
}
