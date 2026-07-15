/**
 * Normalizes Spanish phonemes to catch common early-reader mispronunciations
 * and Speech-to-Text ambiguities (e.g. v/b, z/s, ll/y).
 */
export function normalizeSpanishPhonemes(text: string): string {
  if (!text) return "";

  // 1. Lowercase and remove accents/diacritics
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 2. Remove punctuation
  normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

  // 3. Apply common phoneme substitutions
  normalized = normalized
    .replace(/ll/g, "y") // yeísmo
    .replace(/v/g, "b") // b/v equivalence
    .replace(/z/g, "s") // seseo
    .replace(/qu/g, "k") // qu -> k
    .replace(/ce/g, "se") // ce -> se
    .replace(/ci/g, "si") // ci -> si
    .replace(/ca/g, "ka") // ca -> ka
    .replace(/co/g, "ko") // co -> ko
    .replace(/cu/g, "ku") // cu -> ku
    .replace(/c/g, "k") // any remaining c -> k
    .replace(/ge/g, "je") // ge -> je
    .replace(/gi/g, "ji") // gi -> ji
    .replace(/h/g, "") // silent h
    .replace(/rr/g, "r"); // rr/r equivalence (kids struggle with rolled R)

  return normalized;
}

/**
 * Checks if a target syllable is found within a spoken transcript
 * using fuzzy phonetic normalization.
 */
export function matchesSyllablePhonetically(targetSyllable: string, transcript: string): boolean {
  if (!targetSyllable || !transcript) return false;

  const targetPhoneme = normalizeSpanishPhonemes(targetSyllable);
  const transcriptPhonemes = transcript
    .split(/\s+/) // Split transcript into words
    .map(normalizeSpanishPhonemes);

  // Exact match on any normalized word
  if (transcriptPhonemes.includes(targetPhoneme)) {
    return true;
  }

  // Also check if the exact string is embedded inside a word
  // (e.g. STT heard "lamamá" for "ma")
  const fullTranscriptPhoneme = normalizeSpanishPhonemes(transcript);
  if (fullTranscriptPhoneme.includes(targetPhoneme)) {
    return true;
  }

  return false;
}
