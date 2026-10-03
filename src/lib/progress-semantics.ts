/** Practice evidence is separate from completion and formal evaluation. */
export function isUngradedProduction(meta?: Record<string, unknown>): boolean {
  return meta?.grading === "ungraded" || /^(paint_|dibuja_draw_|draw_box_|free_writing_|writing_response_)/.test(String(meta?.exercise ?? ""));
}
export function countsForLiteracy(meta?: Record<string, unknown>): boolean { return !isUngradedProduction(meta); }
export function evidenceFor(input: { score?: number; total?: number; meta?: Record<string, unknown> }, support: { assisted: boolean; demonstration: boolean }) {
  const meta = input.meta ?? {};
  const ungraded = isUngradedProduction(meta);
  const correct = !ungraded && (typeof meta.attemptCorrect === "boolean" ? meta.attemptCorrect : (input.total ?? 0) > 0 && (input.score ?? 0) >= (input.total ?? 0));
  const scoped = typeof meta.activityId === "string" && typeof meta.encounterId === "string";
  const outcome = ungraded ? "ungraded-production" : !correct ? "incorrect-attempt" : support.demonstration ? "recovery-after-support" : support.assisted ? "assisted-success" : scoped ? "independent-success" : "correct-independence-unknown";
  return { ...meta, grading: ungraded ? "ungraded" : meta.grading === "formal-evaluation" ? "formal-evaluation" : "practice", outcome, ...(ungraded ? {} : { attemptCorrect: correct }), assisted: support.assisted, needsIndependentAttempt: support.assisted };
}
