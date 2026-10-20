import { LESSONS } from "@/content/lesson-meta";
import { CORE_THEMED_GAMES } from "./core-games";
import { SYLLABLE_BUILDER_PILOT } from "./syllable-builder-pilot";
import { PAYASO_CHANO_SS } from "./payaso-chano-ss";
import { splitSyllables } from "@/lib/spanish-syllables";
import type { GameArchetype, GameContent, WordItem } from "@/lib/games/gameContent";

export const AUTHOR_LETTERS = LESSONS.filter((lesson) => lesson.n >= 2);
export const AUTHOR_MECHANICS = [
  "payaso-chano",
  "mariposas",
  "juego-vocal",
  "fonetica-completar",
  "lectura-silabas",
  "lectura-rima",
  "palabras-por-minuto",
  "dibujos",
] as const;
export type AuthorMechanic = (typeof AUTHOR_MECHANICS)[number];
export const AUTHOR_REFERENCES = [PAYASO_CHANO_SS, ...SYLLABLE_BUILDER_PILOT, ...CORE_THEMED_GAMES];
export type ContentGap = {
  kind: "content";
  lesson: number;
  letter: string;
  mechanic: AuthorMechanic;
  reason: string;
  text?: string;
};

const key = (text: string) => text.normalize("NFC").toLocaleLowerCase("es");
const referenceWords = AUTHOR_REFERENCES.filter(
  (game) => game.type !== "palabras-por-minuto",
).flatMap((game) => game.words);
// Existing source syllables only. No novel tokens or words are produced.
const sourceSyllables = new Set(
  [
    ...LESSONS.flatMap((lesson) => lesson.syllables),
    ...referenceWords.flatMap((word) => word.syllables),
  ].map(key),
);
const known = new Map<string, WordItem>();
for (const word of referenceWords) {
  const previous = known.get(key(word.word));
  known.set(key(word.word), {
    ...previous,
    ...word,
    imageUrl: word.imageUrl ?? previous?.imageUrl,
    audioUrl: word.audioUrl ?? previous?.audioUrl,
  });
}

function wordsForLesson(n: number): WordItem[] {
  const lesson = AUTHOR_LETTERS.find((lesson) => lesson.n === n);
  if (!lesson) return [];
  return [...new Set(lesson.keywords)].flatMap((word) => {
    const existing = known.get(key(word));
    if (existing) return [{ ...existing, word }];
    const syllables = splitSyllables(word);
    if (
      syllables.join("") !== word ||
      syllables.some((syllable) => !sourceSyllables.has(key(syllable)))
    )
      return [];
    return [{ word, syllables }];
  });
}

export function createAuthorGame(
  mechanic: AuthorMechanic,
  lessonNumber: number,
): { content: GameContent | null; gaps: ContentGap[] } {
  const lesson = AUTHOR_LETTERS.find((lesson) => lesson.n === lessonNumber);
  if (!lesson) return { content: null, gaps: [] };
  const gap = (reason: string): ContentGap => ({
    kind: "content",
    lesson: lesson.n,
    letter: lesson.letter,
    mechanic,
    reason,
  });
  const canonicalLetter = lesson.letter.length === 1 ? key(lesson.letter) : key(lesson.letter[0]);
  // Preserve reference word lists and order for each existing letter/mechanic.
  const reference = AUTHOR_REFERENCES.find(
    (game) => game.type === mechanic && game.letter === canonicalLetter,
  );
  const base = reference ?? AUTHOR_REFERENCES.find((game) => game.type === mechanic)!;
  let words = reference
    ? reference.words.map((word) => ({ ...word, syllables: [...word.syllables] }))
    : wordsForLesson(lesson.n);
  const gaps: ContentGap[] = [];
  if (!reference && mechanic !== "palabras-por-minuto")
    for (const text of lesson.keywords)
      if (!words.some((word) => word.word === text))
        gaps.push({ ...gap("No source-backed syllable segmentation"), text });
  if (mechanic === "palabras-por-minuto" && !reference)
    words = [...new Set(lesson.keywords)].map((word) => ({ word, syllables: [word] }));
  if (mechanic === "dibujos") words = words.filter((word) => word.imageUrl);
  if (mechanic === "lectura-rima") {
    const hasPairAndDistractor = words.some((word, i) =>
      words.some(
        (other, j) =>
          i !== j &&
          key(word.syllables.at(-1) ?? "") === key(other.syllables.at(-1) ?? "") &&
          words.some(
            (candidate) =>
              key(candidate.syllables.at(-1) ?? "") !== key(word.syllables.at(-1) ?? ""),
          ),
      ),
    );
    if (!hasPairAndDistractor)
      return {
        content: null,
        gaps: [...gaps, gap("No source-backed rhyme pair with a distractor")],
      };
  }
  if (mechanic === "dibujos" && words.length < 2)
    return {
      content: null,
      gaps: [...gaps, gap("Fewer than two source-backed picture/word pairs")],
    };
  if (!words.length)
    return { content: null, gaps: [...gaps, gap("No usable source-backed word set")] };
  // Reference instructions remain verbatim except the letter parameter in the vowel question.
  const instructions = base.instructions.map((line) => line.replace("Aa", lesson.letter));
  return {
    content: {
      ...base,
      id: `author-${mechanic}-${lesson.n}`,
      letter:
        mechanic === "juego-vocal"
          ? lesson.letter === "rr"
            ? "rr"
            : canonicalLetter
          : lesson.letter,
      instructions,
      words,
      tiles: reference
        ? [...(reference.tiles ?? [])]
        : [...new Set([...words.flatMap((word) => word.syllables), ...lesson.syllables])],
    },
    gaps,
  };
}

export function authorContentGaps(): ContentGap[] {
  return AUTHOR_LETTERS.flatMap((lesson) =>
    AUTHOR_MECHANICS.flatMap((mechanic) => createAuthorGame(mechanic, lesson.n).gaps),
  );
}
export function authorGameContents(): GameContent[] {
  return AUTHOR_LETTERS.flatMap((lesson) =>
    AUTHOR_MECHANICS.flatMap((mechanic) => createAuthorGame(mechanic, lesson.n).content ?? []),
  );
}
// Public type narrows the eight authored mechanics without adding a competing renderer.
export function isAuthorMechanic(type: GameArchetype): type is AuthorMechanic {
  return (AUTHOR_MECHANICS as readonly string[]).includes(type);
}
