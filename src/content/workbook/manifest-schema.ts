import { z } from "zod";

/**
 * Canonical schema for the incoming census manifest (Grok's offline
 * pipeline: 92-page census with bounding boxes, interaction content, audio
 * scripts). This is the shape scripts/build-workbook-manifest.mjs writes
 * and scripts/validate-workbook-manifest.mjs checks — the on-disk
 * workbook-manifest.json contract.
 *
 * This is deliberately a separate, richer shape from
 * src/content/workbook/types.ts's engine-facing PhysicalPage/WorkbookObject
 * (which LivingWorkbookPage actually renders) — src/content/workbook/loader.ts
 * adapts one into the other. Keeping them separate means this schema can
 * match exactly what the census pipeline produces without forcing every
 * upstream census field into the render engine's simpler shape.
 *
 * scripts/validate-workbook-manifest.mjs is a standalone hand-rolled
 * validator (plain .mjs, matching the existing scripts/validate-content.mjs
 * convention of not importing src/ TypeScript from build scripts) that
 * re-implements these exact rules — if you change this schema, update that
 * script's checks to match.
 */

export const INTERACTION_MECHANICS = [
  "select",
  "match",
  "drag",
  "connect",
  "order",
  "trace",
  "read",
  "none",
] as const;
export type InteractionMechanic = (typeof INTERACTION_MECHANICS)[number];

export const PAGE_STATUSES = [
  "mapped",
  "cropping-ready",
  "colorization-ready",
  "implementation-ready",
  "complete",
  /** Real source page preserved, but the converter couldn't confidently
   * classify its content into a known region-type pattern — needs a human
   * look before it's trusted as fully correct. Never blocks the rest of
   * the batch; see scripts/build-full-workbook-manifest.mjs. */
  "source-review-required",
] as const;
export type ManifestPageStatus = (typeof PAGE_STATUSES)[number];

/** Mechanics that only make sense with at least one real answer/target —
 * used by both the zod refinement below and the .mjs validator's mirrored
 * check ("answers non-empty when mechanic requires them"). */
export const MECHANICS_REQUIRING_ANSWERS: readonly InteractionMechanic[] = [
  "select",
  "match",
  "connect",
  "order",
];

export const ManifestInteractionSchema = z
  .object({
    mechanic: z.enum(INTERACTION_MECHANICS),
    answers: z.array(z.string()).optional(),
    targets: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    if (
      MECHANICS_REQUIRING_ANSWERS.includes(val.mechanic) &&
      (!val.answers || val.answers.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `mechanic "${val.mechanic}" requires at least one non-empty answer`,
        path: ["answers"],
      });
    }
  });

export const ManifestObjectSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  /** Real derived asset path, or absent if art isn't ready yet — never invented. */
  asset: z.string().optional(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0).max(100),
  /** Not in the original census spec but needed by the render engine's
   * PercentBox; optional so census-only data still validates. */
  height: z.number().min(0).max(100).optional(),
  z: z.number().optional(),
  word: z.string().optional(),
  audioId: z.string().optional(),
  motion: z.string().optional(),
  interactive: z.boolean().optional(),
});

export const ManifestPageSchema = z.object({
  physicalPage: z.number().int().min(1).max(92),
  digitalPage: z.number().int().optional(),
  lesson: z.number().int().min(1).max(24),
  /** Verbatim printed instruction text — empty string, never invented. */
  instruction: z.string(),
  background: z.string().nullable().optional(),
  objects: z.array(ManifestObjectSchema),
  interaction: ManifestInteractionSchema.optional(),
  audio: z.array(z.string()).optional(),
  status: z.enum(PAGE_STATUSES),
  /** Free-text provenance for this page's data — which census files fed it. */
  source: z.string().optional(),
});

export const WorkbookManifestFileSchema = z.object({
  version: z.string(),
  generatedAt: z.string().optional(),
  pages: z.array(ManifestPageSchema),
});

export type ManifestObject = z.infer<typeof ManifestObjectSchema>;
export type ManifestInteraction = z.infer<typeof ManifestInteractionSchema>;
export type ManifestPage = z.infer<typeof ManifestPageSchema>;
export type WorkbookManifestFile = z.infer<typeof WorkbookManifestFileSchema>;

/** Cross-page checks the single-page zod schema can't express on its own
 * (uniqueness, coverage) — used by both the app (tests) and mirrored by the
 * .mjs validator's own checks. */
export function validateManifestCrossPageRules(manifest: WorkbookManifestFile): string[] {
  const errors: string[] = [];

  const seenPhysicalPages = new Set<number>();
  for (const page of manifest.pages) {
    if (seenPhysicalPages.has(page.physicalPage)) {
      errors.push(`duplicate physicalPage: ${page.physicalPage}`);
    }
    seenPhysicalPages.add(page.physicalPage);
  }

  const seenObjectIds = new Set<string>();
  for (const page of manifest.pages) {
    for (const object of page.objects) {
      const key = `${page.physicalPage}:${object.id}`;
      if (seenObjectIds.has(key)) {
        errors.push(`duplicate object id "${object.id}" on physicalPage ${page.physicalPage}`);
      }
      seenObjectIds.add(key);
    }
  }

  const coveredLessons = new Set(manifest.pages.map((p) => p.lesson));
  for (let lesson = 1; lesson <= 24; lesson++) {
    if (!coveredLessons.has(lesson)) {
      errors.push(`lesson ${lesson} has no pages in the manifest`);
    }
  }

  for (const page of manifest.pages) {
    for (const object of page.objects) {
      if (object.interactive && !page.interaction) {
        errors.push(
          `physicalPage ${page.physicalPage}: object "${object.id}" is marked interactive but the page has no interaction.mechanic`,
        );
      }
    }
  }

  return errors;
}
