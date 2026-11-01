/**
 * Tutor intent engine (GRETEL-TUTOR-BUILD-SPEC §18.3).
 *
 * Pure, offline, deterministic. `classifyIntent()` maps what the child said
 * to one of the ten intents of the §18.3 table. It builds on the finished
 * lanes: `matchTarget`/`normalize` from tutor-match and the derived lesson
 * items from tutor-content.
 *
 * Only TARGET / CLOSE / OTHER_VOWEL / OTHER_WORD count as attempts
 * (`countsAsAttempt`). REPEAT / DONT_KNOW / HELP / SILENCE / NOISE /
 * OFF_SCRIPT never do — the brain re-plays the model for them instead.
 *
 * The command-word list and its aliases live here, exported, and are also
 * the source for the ears' grammar (see buildListenGrammar in tutor-brain).
 */
import { tutorItems, type TutorItem } from "./tutor-content";
import { matchTarget, normalize } from "./tutor-match";

export type Intent =
  | "TARGET"
  | "CLOSE"
  | "OTHER_VOWEL"
  | "OTHER_WORD"
  | "REPEAT"
  | "DONT_KNOW"
  | "HELP"
  | "SILENCE"
  | "NOISE"
  | "OFF_SCRIPT";

/** The five Spanish vowels, printed order (book p.2). */
export const VOWELS = ["a", "e", "i", "o", "u"] as const;
export type Vowel = (typeof VOWELS)[number];

/**
 * Accepted spoken spellings per vowel (spec §12 rule 4). Mirrors the alias
 * table the matcher already enforces; exported so the grammar (§18.2) and
 * tests share one source.
 */
export const VOWEL_ALIASES: Readonly<Record<Vowel, readonly string[]>> = {
  a: ["ah", "ha", "á"],
  e: ["eh", "he"],
  i: ["y", "hi", "ii"],
  o: ["oh", "ó", "ou"],
  u: ["uh", "hu", "ú"],
};

/**
 * Command words + aliases (spec §18.3). Detected as whole phrases inside
 * the normalized transcript, so "¡Otra vez, por favor!" still counts.
 */
export const COMMAND_WORDS: Readonly<Record<"repeat" | "dontKnow" | "help", readonly string[]>> = {
  repeat: ["otra vez", "repite", "de nuevo", "repetir"],
  dontKnow: ["no sé", "no se", "no lo sé", "no lo se"],
  help: [
    "ayuda",
    "ayúdame",
    "ayudame",
    "no entiendo",
    "me ayudas",
    "no puedo",
    "me equivoqué",
    "me equivoque",
  ],
};

/** Flat command-phrase list for the ears' grammar. */
export const COMMAND_PHRASES: readonly string[] = Object.values(COMMAND_WORDS).flat();

/**
 * Tokens that carry no answer content: the recognizer's `"[unk]"` marker
 * (normalized to "unk") plus very short fillers. Never matched against a
 * vowel target before the TARGET check has had its chance.
 */
const NOISE_TOKENS: readonly string[] = [
  "unk",
  "m",
  "mm",
  "mmm",
  "hm",
  "hmm",
  "eh",
  "ehm",
  "em",
  "um",
  "uhm",
  "mmhmm",
];

/** True for the four intents that count as attempts (spec §18.3). */
export function countsAsAttempt(intent: Intent): boolean {
  return (
    intent === "TARGET" || intent === "CLOSE" || intent === "OTHER_VOWEL" || intent === "OTHER_WORD"
  );
}

function tokensOf(transcript: string): string[] {
  const normalized = normalize(transcript);
  return normalized === "" ? [] : normalized.split(" ");
}

/** Word-boundary phrase containment over normalized text. */
function containsPhrase(normalizedText: string, phrase: string): boolean {
  const p = normalize(phrase);
  if (!p) return false;
  return ` ${normalizedText} `.includes(` ${p} `);
}

function isVowelOrAlias(token: string, vowel: Vowel): boolean {
  if (token === vowel) return true;
  return VOWEL_ALIASES[vowel].some((alias) => normalize(alias) === token);
}

/** The vowel the child clearly said, if any (vowel letter or one of its aliases). */
export function heardVowel(transcript: string): Vowel | null {
  const tokens = tokensOf(transcript);
  if (tokens.length === 0) return null;
  for (const vowel of VOWELS) {
    if (tokens.some((token) => isVowelOrAlias(token, vowel))) return vowel;
  }
  return null;
}

function isNoiseToken(token: string): boolean {
  if (NOISE_TOKENS.includes(token)) return true;
  // A single non-vowel letter is never an answer for these lessons.
  return token.length === 1 && !VOWELS.includes(token as Vowel);
}

/**
 * Other items the child might have named instead: everything in the lesson
 * list plus same-page items from other lessons (the matcher's distractor
 * set is "same lesson or same printed page", spec §12).
 */
function otherItemsFor(target: TutorItem, lessonItems: readonly TutorItem[]): readonly TutorItem[] {
  const inLesson = lessonItems.filter((item) => item.id !== target.id);
  const ids = new Set(lessonItems.map((item) => item.id));
  const samePage = tutorItems.filter(
    (item) => !ids.has(item.id) && item.id !== target.id && item.printedPage === target.printedPage,
  );
  return [...inLesson, ...samePage];
}

/**
 * Classify one heard transcript for the current target (spec §18.3 table):
 *
 *   SILENCE      — no speech at all (empty/whitespace transcript)
 *   TARGET       — the matcher passes
 *   REPEAT / DONT_KNOW / HELP — command words or aliases
 *   NOISE        — only "[unk]" or very short noise tokens
 *   OTHER_VOWEL  — a different vowel (or its alias) was said for a vowel item
 *   OTHER_WORD   — another lesson/page item matches its own matcher
 *   OFF_SCRIPT   — long unrelated speech (> 3 words), or nothing target-like
 *   CLOSE        — failed but within target length + 1 edit distance and
 *                  not a distractor (checked after OFF_SCRIPT so long
 *                  unrelated speech can never masquerade as a close miss)
 *
 * Alternatives-fusion (§18.2) is the brain layer's job: it calls
 * `matchTarget(target, transcript, alternatives)` in addition to this.
 */
export function classifyIntent(
  transcript: string,
  target: TutorItem,
  lessonItems: readonly TutorItem[],
): Intent {
  const tokens = tokensOf(transcript);
  if (tokens.length === 0) return "SILENCE";

  // TARGET: the matcher passes (exact, contained, edit-distance, or alias).

  const normalized = normalize(transcript);
  // Commands next: an explicit child request never counts as an attempt.
  for (const phrase of COMMAND_WORDS.repeat) {
    if (containsPhrase(normalized, phrase)) return "REPEAT";
  }
  for (const phrase of COMMAND_WORDS.dontKnow) {
    if (containsPhrase(normalized, phrase)) return "DONT_KNOW";
  }
  for (const phrase of COMMAND_WORDS.help) {
    if (containsPhrase(normalized, phrase)) return "HELP";
  }

  // Questions and unrelated long statements are never speaking answers,
  // even if the recognizer happens to include the target word.
  if (tokens.length > 4 || /^(que|quien|cuando|donde|por que|cuentame|no es)\b/.test(normalized))
    return "OFF_SCRIPT";
  if (matchTarget(target, transcript).pass) return "TARGET";

  // NOISE: only "[unk]" / very short noise.
  if (tokens.every(isNoiseToken)) return "NOISE";

  // OTHER_VOWEL: a different vowel was heard for a vowel item.
  if (target.kind === "vowel") {
    const heard = heardVowel(transcript);
    if (heard && heard !== normalize(target.text)) return "OTHER_VOWEL";
  }

  // OTHER_WORD: another lesson/page item matches.
  for (const item of otherItemsFor(target, lessonItems)) {
    if (matchTarget(item, transcript).pass) return "OTHER_WORD";
  }

  // OFF_SCRIPT: long unrelated speech, no target-like token at all.
  if (tokens.length > 3) return "OFF_SCRIPT";

  // CLOSE: failed, not a distractor, within target length + 1.
  const failed = matchTarget(target, transcript);
  if (!failed.pass && failed.distance <= normalize(target.text).length + 1) return "CLOSE";

  // Anything left carries no target-like token either: redirect, not an attempt.
  return "OFF_SCRIPT";
}
