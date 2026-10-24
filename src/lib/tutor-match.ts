/**
 * Tutor speech matching (GRETEL-TUTOR-BUILD-SPEC §4 and §12).
 *
 * Pure, offline, deterministic. `matchTarget()` decides whether what the child
 * said passes for the current lesson item:
 *   1. distractor check FIRST — if the transcript equals or sits closer to
 *      another item in the same lesson or page, it fails, even when it is
 *      within the edit-distance threshold (e.g. "oreja" must NOT pass for
 *      "oveja");
 *   2. exact/contained token ("oso", "la ola", "es un oso");
 *   3. in-house Levenshtein within threshold (≤1 for 2–5 letter targets,
 *      ≤2 for 6+ letter targets);
 *   4. vowel items also pass via the alias table (o←oh/ó/ou, a←ah/ha/á,
 *      e←eh/he, i←y/hi/ii, u←uh/hu/ú).
 *
 * Ears alternatives (if any) are each evaluated the same way; the first
 * candidate that passes wins.
 */
import { tutorItems, type TutorItem } from "./tutor-content";

export type MatchRule = "contains" | "edit-distance" | "vowel-alias" | "none";

export interface MatchResult {
  pass: boolean;
  rule: MatchRule;
  distance: number;
}

/** Accepted spellings per vowel item, per spec §12. */
const VOWEL_ALIASES: Record<string, string[]> = {
  o: ["oh", "ó", "ou"],
  a: ["ah", "ha", "á"],
  e: ["eh", "he"],
  i: ["y", "hi", "ii"],
  u: ["uh", "hu", "ú"],
};

const COMBINING_MARK = /\p{M}/u;

/**
 * lowercase → NFD → strip combining marks (except ñ, the tilde on n survives)
 * → drop punctuation → collapse spaces.
 */
export function normalize(s: string): string {
  const decomposed = s.toLowerCase().normalize("NFD");
  let out = "";
  for (const mark of decomposed) {
    if (COMBINING_MARK.test(mark)) {
      // Keep only the combining tilde on n, so "ñ" survives accent stripping.
      if (mark === "\u0303" && out.endsWith("n")) out += mark;
    } else {
      out += mark;
    }
  }
  return out
    // Drop punctuation. \p{M} stays: the only mark left in `out` is the
    // tilde on n that keeps ñ alive.
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, "")
    .replace(/\s+/g, " ") // collapse spaces
    .trim()
    .normalize("NFC"); // recompose "n" + U+0303 back into "ñ"
}

/** In-house Levenshtein distance over code points. */
function editDistance(a: string, b: string): number {
  const aChars = Array.from(a);
  const bChars = Array.from(b);
  if (aChars.length === 0) return bChars.length;
  if (bChars.length === 0) return aChars.length;

  // Row width is bChars.length + 1: the leading 0..len costs of an empty prefix.
  let previous = Array.from({ length: bChars.length + 1 }, (_, j) => j);
  for (let i = 1; i <= aChars.length; i++) {
    const current = [i];
    for (let j = 1; j <= bChars.length; j++) {
      const substitution = previous[j - 1] + (aChars[i - 1] === bChars[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
    }
    previous = current;
  }
  return previous[bChars.length];
}

/** Edit-distance pass threshold by normalized target length (spec §12). */
function allowedDistance(targetLength: number): number {
  if (targetLength >= 6) return 2;
  if (targetLength >= 2) return 1;
  // One-letter targets (the vowels) pass only by exact token or alias.
  return 0;
}

function transcriptTokens(s: string): string[] {
  const normalized = normalize(s);
  return normalized === "" ? [] : normalized.split(" ");
}

/** Other derived items that can steal the answer: same lesson or same page. */
function distractorsFor(target: TutorItem): readonly TutorItem[] {
  return tutorItems.filter(
    (item) => item.id !== target.id && (item.lesson === target.lesson || item.printedPage === target.printedPage),
  );
}

function evaluateCandidate(target: TutorItem, targetText: string, candidate: string): MatchResult {
  const tokens = transcriptTokens(candidate);
  if (tokens.length === 0) {
    return { pass: false, rule: "none", distance: editDistance(normalize(candidate), targetText) };
  }

  const targetDistance = Math.min(...tokens.map((token) => editDistance(token, targetText)));

  // Distractor check runs FIRST and wins (spec §12): equal to another item,
  // or strictly closer to another item than to the target → fail.
  for (const distractor of distractorsFor(target)) {
    const distractorText = normalize(distractor.text);
    const distractorDistance = Math.min(...tokens.map((token) => editDistance(token, distractorText)));
    if (distractorDistance < targetDistance) {
      return { pass: false, rule: "none", distance: targetDistance };
    }
  }

  // Rules 1+2: exact token or target contained as a token.
  if (tokens.includes(targetText)) {
    return { pass: true, rule: "contains", distance: 0 };
  }

  // Rule 4: vowel alias table (distance 0 — the token equals an accepted form).
  if (target.kind === "vowel") {
    const aliases = (VOWEL_ALIASES[targetText] ?? []).map(normalize);
    if (tokens.some((token) => aliases.includes(token))) {
      return { pass: true, rule: "vowel-alias", distance: 0 };
    }
    return { pass: false, rule: "none", distance: targetDistance };
  }

  // Rule 3: in-house Levenshtein within threshold.
  if (targetDistance <= allowedDistance(targetText.length)) {
    return { pass: true, rule: "edit-distance", distance: targetDistance };
  }
  return { pass: false, rule: "none", distance: targetDistance };
}

/**
 * Decide whether the child's speech passes for the target lesson item.
 * `alternatives` are additional ear hypotheses; each is evaluated the same
 * way and the first candidate that passes wins.
 */
export function matchTarget(target: TutorItem, transcript: string, alternatives: string[] = []): MatchResult {
  const targetText = normalize(target.text);
  const candidates = [transcript, ...alternatives];

  let failDistance = Infinity;
  for (const candidate of candidates) {
    const result = evaluateCandidate(target, targetText, candidate);
    if (result.pass) {
      return result;
    }
    failDistance = Math.min(failDistance, result.distance);
  }
  return { pass: false, rule: "none", distance: failDistance };
}