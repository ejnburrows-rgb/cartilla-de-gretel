import { normalizeSpanishPhonemes } from "./phoneme-matcher";

/**
 * Piano Hablador syllable tracker.
 *
 * Pure, conservative matching of speech-recognition text against the target
 * word's syllables. A syllable only advances when a whole recognized word
 * (token) is exactly that syllable, exactly the next run of syllables, or the
 * complete target word. There is no substring search ("casa" never confirms
 * "sa"), no acoustic score and no percentage threshold: progress comes only
 * from the recognizer's own text, normalized with the existing Spanish
 * phoneme rules (seseo, b/v, ll/y, silent h, accents).
 *
 * Progress never goes backwards; repeating an already-confirmed syllable is
 * ignored.
 */

const TOKEN_SPLIT = /[\s,.;:!?¡¿…"'“”«»()\-–—_/]+/;

export function tokenizeSpeech(transcript: string): string[] {
  if (!transcript) return [];
  return transcript
    .split(TOKEN_SPLIT)
    .map((token) => normalizeSpanishPhonemes(token))
    .filter((token) => token.length > 0);
}

export function normalizeSyllables(syllables: readonly string[]): string[] {
  return syllables.map((syllable) => normalizeSpanishPhonemes(syllable));
}

/**
 * Returns the new number of confirmed syllables (0..syllables.length) after
 * reading one recognizer hypothesis, starting from `confirmed`.
 */
export function advanceSyllables(
  syllables: readonly string[],
  confirmed: number,
  transcript: string,
): number {
  const target = normalizeSyllables(syllables);
  const total = target.length;
  let progress = Math.max(0, Math.min(confirmed, total));
  if (total === 0 || progress >= total) return progress;
  const whole = target.join("");

  for (const token of tokenizeSpeech(transcript)) {
    if (progress >= total) break;
    // A naturally spoken whole word always counts, even after a partial start.
    if (total > 1 && token === whole) {
      progress = total;
      break;
    }
    // Longest exact run of the next syllables covered by this single token
    // ("sa" → 1, "sapo" → 2 when nothing is confirmed yet).
    let joined = "";
    let matchedThrough = -1;
    for (let index = progress; index < total; index++) {
      joined += target[index];
      if (joined === token) matchedThrough = index;
      if (joined.length >= token.length) break;
    }
    if (matchedThrough >= 0) progress = matchedThrough + 1;
    // Anything else (fillers, wrong words, repeats) is ignored, never counted.
  }
  return progress;
}
