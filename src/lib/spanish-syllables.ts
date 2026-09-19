// spanish-syllables.ts — Spanish syllabification.
// Rules implemented (sufficient for the cartilla vocabulary):
//   1. VV between strong vowels splits (a\u00e9rea → a-\u00e9-re-a). Hiatus.
//   2. VV with weak (i/u) unstressed forms a diphthong (no split).
//   3. CV splits as -CV (la-do).
//   4. VCV splits before the C (a-ma).
//   5. VCCV splits between consonants (al-to), EXCEPT inseparable groups
//      pr/pl/br/bl/tr/dr/cr/cl/fr/fl/gr/gl which stay together (a-pre-tar).
//   6. ch/ll/rr/qu/gu (before e/i) are single units.
//   7. h is invisible for splitting (no- ha-ber stays no-ha-ber).
//
// Good enough for vocabulary in lessons 2-24. Not a full RAE implementation.

const STRONG_VOWELS = new Set(["a", "e", "o", "\u00e1", "\u00e9", "\u00f3"]);
const WEAK_VOWELS = new Set(["i", "u", "\u00fc", "y"]);
const ACCENTED_WEAK = new Set(["\u00ed", "\u00fa"]);
const ALL_VOWELS = new Set([...STRONG_VOWELS, ...WEAK_VOWELS, ...ACCENTED_WEAK]);
const INSEPARABLE_PAIRS = new Set([
  "pr",
  "pl",
  "br",
  "bl",
  "tr",
  "dr",
  "cr",
  "cl",
  "fr",
  "fl",
  "gr",
  "gl",
]);
const DIGRAPHS = new Set(["ch", "ll", "rr"]);

function isVowel(c: string): boolean {
  return ALL_VOWELS.has(c.toLowerCase());
}
function isConsonant(c: string): boolean {
  return /[a-z\u00f1]/i.test(c) && !isVowel(c);
}
function isDiphthong(a: string, b: string): boolean {
  const sa = STRONG_VOWELS.has(a);
  const sb = STRONG_VOWELS.has(b);
  const wa = WEAK_VOWELS.has(a);
  const wb = WEAK_VOWELS.has(b);
  if (sa && sb) return false; // hiatus
  if (ACCENTED_WEAK.has(a) || ACCENTED_WEAK.has(b)) return false;
  return (sa && wb) || (wa && sb) || (wa && wb);
}

/**
 * Split a Spanish word into syllables. Returns the original casing.
 * Words containing non-letter characters are returned as a single token.
 */
export function splitSyllables(word: string): string[] {
  if (!word) return [];
  const raw = word.normalize("NFC");
  if (!/^[a-z\u00f1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc]+$/i.test(raw)) {
    return [raw];
  }
  const lower = raw.toLowerCase();
  const marks: number[] = [0]; // start indices of syllables

  let i = 0;
  while (i < lower.length) {
    // Skip leading consonants of this syllable
    while (i < lower.length && !isVowel(lower[i])) i++;
    if (i >= lower.length) break;
    // We are on a vowel. Consume the vowel nucleus (account for diphthong).
    i++;
    while (i < lower.length && isVowel(lower[i]) && isDiphthong(lower[i - 1], lower[i])) {
      i++;
    }
    // We are past the nucleus. Look at consonants until next vowel.
    const nucleusEnd = i;
    let j = i;
    while (j < lower.length && !isVowel(lower[j])) j++;
    const consonantRun = lower.slice(nucleusEnd, j);
    if (j >= lower.length) {
      // Trailing consonants belong to current syllable. Done.
      break;
    }
    let splitAt = nucleusEnd;
    if (consonantRun.length === 0) {
      splitAt = nucleusEnd; // VV hiatus already handled above
    } else if (consonantRun.length === 1) {
      splitAt = nucleusEnd;
    } else if (consonantRun.length === 2) {
      const pair = consonantRun.toLowerCase();
      if (DIGRAPHS.has(pair) || INSEPARABLE_PAIRS.has(pair)) {
        splitAt = nucleusEnd;
      } else {
        splitAt = nucleusEnd + 1;
      }
    } else {
      // 3+ consonants: last two stay together if inseparable.
      const lastTwo = consonantRun.slice(consonantRun.length - 2);
      if (INSEPARABLE_PAIRS.has(lastTwo)) {
        splitAt = nucleusEnd + consonantRun.length - 2;
      } else {
        splitAt = nucleusEnd + consonantRun.length - 1;
      }
    }
    if (splitAt > nucleusEnd && splitAt < j) {
      marks.push(splitAt);
    } else if (splitAt === nucleusEnd) {
      marks.push(nucleusEnd);
    }
    i = j;
  }

  const dedup = [...new Set(marks)].sort((a, b) => a - b);
  const out: string[] = [];
  for (let k = 0; k < dedup.length; k++) {
    const start = dedup[k];
    const end = k + 1 < dedup.length ? dedup[k + 1] : raw.length;
    const piece = raw.slice(start, end);
    if (piece.length > 0) out.push(piece);
  }
  return out;
}

/** Shuffle the syllables for a drag-build exercise (deterministic with seed). */
export function shuffledSyllables(word: string, seed = 1): string[] {
  const syl = splitSyllables(word);
  const arr = [...syl];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
