import { z } from "zod";

export const DIALOGUE_STATUSES = [
  "scripted",
  "recorded",
  "validated",
  "approved",
  "rejected",
] as const;
export type DialogueStatus = (typeof DIALOGUE_STATUSES)[number];

export const DIALOGUE_SCOPES = [
  "universal",
  "lesson",
  "flipchart",
  "game",
  "technical",
] as const;
export type DialogueScope = (typeof DIALOGUE_SCOPES)[number];

export const DIALOGUE_EXPRESSIONS = [
  "warm",
  "excited",
  "gentle",
  "encouraging",
  "calm",
  "proud",
  "curious",
  "patient",
] as const;
export type DialogueExpression = (typeof DIALOGUE_EXPRESSIONS)[number];

export const DIALOGUE_GESTURES = [
  "idle",
  "wave",
  "point",
  "listen",
  "teach",
  "help",
  "gentle-error",
  "cheer",
] as const;
export type DialogueGesture = (typeof DIALOGUE_GESTURES)[number];

export const DIALOGUE_PRESENTATION_ACTIONS = [
  "none",
  "highlight-item",
  "show-letter",
  "show-syllable",
  "show-word",
  "show-sentence",
  "show-flipchart",
  "point-workbook",
  "open-mic",
  "celebrate",
] as const;
export type DialoguePresentationAction = (typeof DIALOGUE_PRESENTATION_ACTIONS)[number];

export const DIALOGUE_EXPECTED_RESPONSES = [
  "none",
  "repeat",
  "name-letter",
  "sound-out",
  "read-syllable",
  "read-word",
  "read-sentence",
  "tap-item",
  "point-page",
  "yes-no",
] as const;
export type DialogueExpectedResponse = (typeof DIALOGUE_EXPECTED_RESPONSES)[number];

export const DIALOGUE_SOURCE_STATUSES = [
  "verified",
  "source-pending",
  "absent-in-source",
] as const;
export type DialogueSourceStatus = (typeof DIALOGUE_SOURCE_STATUSES)[number];

export const REJECTED_AUDIO_PATTERNS = [
  /rec_gretel_/i,
  /Gretel_67/i,
  /67_Audio/i,
  /Audio_Lecciones_Listo/i,
  /nina-sordita/i,
] as const;

export function isRejectedAudioSource(path?: string | null): boolean {
  if (typeof path !== "string" || path.length === 0) return false;
  return REJECTED_AUDIO_PATTERNS.some((pattern) => pattern.test(path));
}

export function countSpanishWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function countQuestions(text: string): number {
  const matches = text.match(/\?/g);
  return matches ? matches.length : 0;
}

export const DialogueCurriculumRefsSchema = z.object({
  lesson: z.number().int().min(0).max(24).optional(),
  printedPages: z.array(z.number().int().min(1).max(90)).optional(),
  flipchartSheets: z.array(z.number().int().min(1).max(62)).optional(),
  letters: z.array(z.string().min(1)).optional(),
  syllables: z.array(z.string().min(1)).optional(),
  words: z.array(z.string().min(1)).optional(),
  gameId: z.string().min(1).optional(),
  sourceStatus: z.enum(DIALOGUE_SOURCE_STATUSES).optional(),
});
export type DialogueCurriculumRefs = z.infer<typeof DialogueCurriculumRefsSchema>;

/**
 * Evidence the application must actually hold before a line may be spoken.
 * Lines that state what Gretel heard, understood or saw are gated on these keys;
 * with no evidence supplied they are never eligible.
 */
export const TUTOR_EVIDENCE_KEYS = [
  "asr-reliable", // recognizer returned a transcript above the reliability threshold
  "request-resolved", // the app resolved what the learner is referring to
  "answer-matched", // the answer was compared with the expected item and matched
  "page-completed", // the app recorded the page/activity as completed
  "snapshot-captured", // a local snapshot exists
  "snapshot-low-light", // measured: snapshot is too dark
  "snapshot-shadow", // measured: a shadow covers part of the page
  "snapshot-blur", // measured: snapshot is out of focus or shaky
  "snapshot-quality-ok", // measured: brightness, sharpness and framing pass
] as const;
export type TutorEvidenceKey = (typeof TUTOR_EVIDENCE_KEYS)[number];

export const DialogueEligibilitySchema = z.object({
  requiresEvidence: z.array(z.enum(TUTOR_EVIDENCE_KEYS)).optional(),
  lessons: z.array(z.number().int().min(0).max(24)).optional(),
  phases: z.array(z.string().min(1)).optional(),
  attemptMin: z.number().int().min(0).optional(),
  attemptMax: z.number().int().min(0).optional(),
  streakMin: z.number().int().min(0).optional(),
  returning: z.boolean().optional(),
  requiresCamera: z.boolean().optional(),
  requiresAudio: z.boolean().optional(),
});
export type DialogueEligibility = z.infer<typeof DialogueEligibilitySchema>;

export const DialogueCueTimingSchema = z.object({
  leadInMs: z.number().int().min(0).optional(),
  pauseAfterMs: z.number().int().min(0).optional(),
  syncWith: z
    .enum(["before-item", "on-highlight", "after-answer", "post-chord", "on-sheet"])
    .optional(),
});
export type DialogueCueTiming = z.infer<typeof DialogueCueTimingSchema>;

export const DialogueAudioMetadataSchema = z.object({
  src: z.string().min(1).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).nullable().optional(),
  durationMs: z.number().int().positive().nullable().optional(),
  visemes: z.string().min(1).nullable().optional(),
});
export type DialogueAudioMetadata = z.infer<typeof DialogueAudioMetadataSchema>;

export const DIALOGUE_SOURCE_PRS = ["PR#1073", "PR#1322", "reconciled"] as const;
export type DialogueSourcePr = (typeof DIALOGUE_SOURCE_PRS)[number];

export const SourceContextMappingSchema = z
  .object({
    sourceLineId: z.string().min(1),
    sourcePr: z.enum(["PR#1073", "PR#1322"]),
    intent: z.string().min(1),
    role: z.string().min(1),
    activity: z.string().min(1).optional(),
    workbookPage: z.number().int().min(1).max(90).optional(),
    workbookPdfSheet: z.number().int().min(1).max(120).optional(),
    flipchartSheet: z.number().int().min(1).max(62).optional(),
    relatedFlipchartSheets: z.array(z.number().int().min(1).max(62)).optional(),
    expectedAnswer: z.string().min(1).optional(),
    commonError: z.string().min(1).optional(),
    sharedClip: z.boolean().optional(),
  })
  .superRefine((ctxItem, ctx) => {
    if (ctxItem.workbookPage === 86 || ctxItem.workbookPage === 87) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${ctxItem.sourceLineId}: sourceContext must not reference absent-in-source workbook pages 86-87`,
      });
    }
  });
export type SourceContextMapping = z.infer<typeof SourceContextMappingSchema>;

export const DialogueLineV2Schema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    normalizedText: z.string().min(1).optional(),
    batch: z.string().min(1),
    seq: z.number().int().positive(),
    file: z.string().min(1),
    intent: z.string().min(1),
    role: z.string().min(1),
    variationGroup: z.string().min(1),
    curriculumRefs: DialogueCurriculumRefsSchema,
    scope: z.enum(DIALOGUE_SCOPES),
    eligibility: DialogueEligibilitySchema,
    hintLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    expression: z.enum(DIALOGUE_EXPRESSIONS),
    gesture: z.enum(DIALOGUE_GESTURES),
    presentationAction: z.enum(DIALOGUE_PRESENTATION_ACTIONS),
    cueTiming: DialogueCueTimingSchema,
    expectedResponse: z.enum(DIALOGUE_EXPECTED_RESPONSES),
    cooldownTurns: z.number().int().min(0),
    priority: z.number().int().min(1).max(100),
    audio: DialogueAudioMetadataSchema,
    status: z.enum(DIALOGUE_STATUSES),
    approval: z.string().min(1).optional(),
    sourcePr: z.enum(DIALOGUE_SOURCE_PRS).optional(),
    sourceContexts: z.array(SourceContextMappingSchema).optional(),
  })
  .superRefine((entry, ctx) => {
    if (isRejectedAudioSource(entry.audio.src) || isRejectedAudioSource(entry.audio.visemes) || isRejectedAudioSource(entry.file)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${entry.id}: references a rejected audio source`,
      });
    }
    if (entry.status === "scripted") {
      if (entry.audio.src !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${entry.id}: scripted line must never have active audio.src`,
        });
      }
      if (entry.audio.visemes !== undefined && entry.audio.visemes !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${entry.id}: scripted line must not point to active visemes`,
        });
      }
    }
    if (entry.status === "approved" && (!entry.audio.src || !entry.audio.src.startsWith("/"))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${entry.id}: approved line must have a public audio.src starting with "/"`,
      });
    }
    const pages = entry.curriculumRefs.printedPages ?? [];
    if (pages.includes(86) || pages.includes(87)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${entry.id}: must not reference absent-in-source workbook pages 86-87`,
      });
    }
  });

export type DialogueLineV2 = z.infer<typeof DialogueLineV2Schema>;

export const DialogueManifestFileSchema = z.object({
  version: z.literal(2),
  scope: z.enum(DIALOGUE_SCOPES),
  lesson: z.number().int().min(0).max(24).optional(),
  batchIds: z.array(z.string().min(1)).min(1),
  entries: z.array(DialogueLineV2Schema).min(1),
});

export type DialogueManifestFile = z.infer<typeof DialogueManifestFileSchema>;
