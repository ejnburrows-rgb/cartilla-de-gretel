// Type declarations for validate-tutor-lines.mjs so vitest guard tests
// (src/lib/__tests__/tutor-lines-manifest.test.ts) type-check against the
// canonical tutor-lines validator module without a build step for the script itself.

export const TUTOR_LINE_ROLES: string[];
export const DRAFT_MARK: string;
export function isRejectedSourcePath(path: unknown): boolean;
export interface TutorLinesValidationResult {
  ok: boolean;
  errors: string[];
  counts: { approved: number; pending: number };
}
export interface ValidateTutorLinesOptions {
  checkFiles?: boolean;
  publicDir?: string;
  approvedRecordings?: Set<string>;
}
export function validateTutorLines(
  manifest: unknown,
  options?: ValidateTutorLinesOptions,
): TutorLinesValidationResult;
