// vowel-drag-pairs.ts — syllable-drag seeds for vowel lessons.
// Vowels do not have a consonant-style drag-build page, but warm-up modes
// + the family practice planner can use these. Each pair is the syllables
// the child drags into order to spell the target word.

import type { LetterId } from "./lesson-meta";

export type VowelDragPair = {
	word: string;
	translationEn: string;
	syllables: string[];
	letter: LetterId;
};

export const VOWEL_DRAG_PAIRS: VowelDragPair[] = [
	// Lesson 2 — O
	{ word: "oso",   translationEn: "bear",   syllables: ["o",  "so"],  letter: "o" },
	{ word: "ojo",   translationEn: "eye",    syllables: ["o",  "jo"],  letter: "o" },
	{ word: "olla",  translationEn: "pot",    syllables: ["o",  "lla"], letter: "o" },

	// Lesson 3 — A
	{ word: "ala",   translationEn: "wing",   syllables: ["a",  "la"],  letter: "a" },
	{ word: "ama",   translationEn: "loves",  syllables: ["a",  "ma"],  letter: "a" },
	{ word: "asa",   translationEn: "handle", syllables: ["a",  "sa"],  letter: "a" },

	// Lesson 4 — E
	{ word: "eso",   translationEn: "that",   syllables: ["e",  "so"],  letter: "e" },
	{ word: "ese",   translationEn: "that",   syllables: ["e",  "se"],  letter: "e" },

	// Lesson 5 — I
	{ word: "isla",  translationEn: "island", syllables: ["is", "la"],  letter: "i" },
	{ word: "ida",   translationEn: "going",  syllables: ["i",  "da"],  letter: "i" },

	// Lesson 6 — U
	{ word: "uno",   translationEn: "one",    syllables: ["u",  "no"],  letter: "u" },
	{ word: "uva",   translationEn: "grape",  syllables: ["u",  "va"],  letter: "u" },
];

export function dragPairsForLetter(letter: LetterId): VowelDragPair[] {
	return VOWEL_DRAG_PAIRS.filter((p) => p.letter === letter);
}
