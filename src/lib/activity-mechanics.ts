export type AuthenticActivityWord = {
  word: string;
  illustrationSrc?: string;
};

function normalizeInitial(value: string): string {
  return value
    .toLowerCase()
    .replace(/ñ/g, "¤")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/¤/g, "ñ")
    .replace(/[^a-zñ]/g, "");
}

export function matchesInitialSound(word: string, target: string): boolean {
  const normalizedWord = normalizeInitial(word);
  const normalizedTarget = normalizeInitial(target);
  if (!normalizedWord || !normalizedTarget) return false;
  return normalizedWord.startsWith(normalizedTarget);
}

function uniqueAuthenticWords(words: AuthenticActivityWord[]): AuthenticActivityWord[] {
  const seen = new Set<string>();
  const result: AuthenticActivityWord[] = [];
  for (const item of words) {
    if (!item.word.trim() || !item.illustrationSrc?.trim()) continue;
    const key = item.word.trim().toLocaleLowerCase("es");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ word: item.word.trim(), illustrationSrc: item.illustrationSrc.trim() });
  }
  return result;
}

/**
 * Builds a deterministic sound-search board from existing canonical vocabulary.
 * No word or image path is invented: every choice must already have authentic art.
 */
export function buildSoundSearchChoices(
  target: string,
  lessonWords: AuthenticActivityWord[],
  canonicalPool: AuthenticActivityWord[] = [],
  maxChoices = 6,
): AuthenticActivityWord[] {
  const candidates = uniqueAuthenticWords([...lessonWords, ...canonicalPool]);
  const targets = candidates.filter((item) => matchesInitialSound(item.word, target)).slice(0, 3);
  const distractors = candidates
    .filter((item) => !matchesInitialSound(item.word, target))
    .slice(0, Math.max(0, maxChoices - targets.length));

  const choices: AuthenticActivityWord[] = [];
  const rows = Math.max(targets.length, distractors.length);
  for (let index = 0; index < rows && choices.length < maxChoices; index += 1) {
    if (targets[index]) choices.push(targets[index]!);
    if (choices.length < maxChoices && distractors[index]) choices.push(distractors[index]!);
  }
  return choices.slice(0, maxChoices);
}

export function canBuildSoundSearch(
  target: string,
  lessonWords: AuthenticActivityWord[],
  canonicalPool: AuthenticActivityWord[] = [],
): boolean {
  const choices = buildSoundSearchChoices(target, lessonWords, canonicalPool);
  const targets = choices.filter((item) => matchesInitialSound(item.word, target));
  return choices.length >= 3 && targets.length >= 1 && targets.length < choices.length;
}
