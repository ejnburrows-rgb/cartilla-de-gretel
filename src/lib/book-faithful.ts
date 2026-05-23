import lessonsData from "@/data/lessons.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ClosingExerciseKind = "rima" | "poema" | null;

export type BookFaithfulLesson = {
	lesson: number; // 1..24
	title: string;
	focus: string; // 'O','A','E','I','U','M',...,'rr','vowels-intro'
	sightWords: string[];
	palabrasSection: boolean;
	miniStory: boolean;
	closing: ClosingExerciseKind;
	notes: string | null;
};

export type SightWordEntry = { introducedInLesson: number };

export type EditorialNote = {
	id: string;
	severity: "info" | "warning" | "error";
	location: string;
	description: string;
};

export type BookMeta = {
	title: string;
	author: string;
	contributors: string[];
	illustrator: string;
	adaptationCredit: string;
	imprint: string;
	isbn: string;
	copyright: string;
	length: { pages: number; lessons: number };
};

// ---------------------------------------------------------------------------
// Raw data (narrowed)
// ---------------------------------------------------------------------------

type Raw = {
	version: string;
	book: BookMeta;
	vowelOrder: string[];
	consonantOrder: string[];
	bookFaithfulLessons: BookFaithfulLesson[];
	editorialNotes: EditorialNote[];
	sightWordIndex: Record<string, SightWordEntry>;
	miniStoryLessons: number[];
	emptyPalabrasLessons: number[];
};

const raw = lessonsData as unknown as Raw;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BOOK: BookMeta = raw.book;
export const VOWEL_ORDER: string[] = raw.vowelOrder;
export const CONSONANT_ORDER: string[] = raw.consonantOrder;
export const TOTAL_LESSONS = raw.book.length.lessons; // 24

export const BOOK_FAITHFUL_LESSONS: ReadonlyArray<BookFaithfulLesson> =
	raw.bookFaithfulLessons;

export const SIGHT_WORD_INDEX: Readonly<Record<string, SightWordEntry>> =
	raw.sightWordIndex;

export const MINI_STORY_LESSONS: ReadonlyArray<number> = raw.miniStoryLessons;
export const EMPTY_PALABRAS_LESSONS: ReadonlyArray<number> =
	raw.emptyPalabrasLessons;
export const EDITORIAL_NOTES: ReadonlyArray<EditorialNote> = raw.editorialNotes;

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** Get the book-faithful entry for a lesson number (1–24), or null. */
export function getBookFaithfulLesson(
	lessonNumber: number,
): BookFaithfulLesson | null {
	return (
		raw.bookFaithfulLessons.find((l) => l.lesson === lessonNumber) ?? null
	);
}

/** Sight words introduced in the given lesson (empty array if none). */
export function getSightWordsForLesson(lessonNumber: number): string[] {
	return getBookFaithfulLesson(lessonNumber)?.sightWords ?? [];
}

/** All sight words known up to and including the given lesson. */
export function getSightWordsThroughLesson(lessonNumber: number): string[] {
	const out: string[] = [];
	for (const l of raw.bookFaithfulLessons) {
		if (l.lesson <= lessonNumber) out.push(...l.sightWords);
	}
	return out;
}

/** True if this lesson replaces the word-list section with a mini-story. */
export function lessonHasMiniStory(lessonNumber: number): boolean {
	return raw.miniStoryLessons.includes(lessonNumber);
}

/** True if this lesson's palabras (word list) section is intentionally empty. */
export function lessonHasEmptyPalabras(lessonNumber: number): boolean {
	return raw.emptyPalabrasLessons.includes(lessonNumber);
}

/** Editorial notes attached to a lesson (matched by location text contains 'Lesson N'). */
export function getEditorialNotesForLesson(
	lessonNumber: number,
): EditorialNote[] {
	const needle = `Lesson ${lessonNumber}`;
	return raw.editorialNotes.filter((n) =>
		n.location.toLowerCase().includes(needle.toLowerCase()),
	);
}

/** Which lesson introduced this sight word, or null if not tracked. */
export function getSightWordOrigin(word: string): number | null {
	const entry = raw.sightWordIndex[word];
	return entry ? entry.introducedInLesson : null;
}
