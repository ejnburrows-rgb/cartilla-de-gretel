import lessonsData from "@/data/lessons.json";
import sourceArtInventory from "@/data/source-art-inventory.json";
import pageLayouts from "@/data/page-layouts.json";
import { getBookSectionForLesson, getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { CATALOG } from "@/lib/lesson-catalog";

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

export type WorkbookTranscriptionStatus = "verified" | "missing" | "partial";

export type WorkbookPageRole = "intro" | "vowels" | "consonants";

/**
 * A single structural region on a faithfully-digitized page (e.g. the title
 * bar, a vocabulary grid, a tracing line). Text-bearing regions render as
 * live HTML so they pick up `--font-book-faithful`; illustration regions
 * resolve to either a MonochromeDrawing SVG (by word) or a cropped scan.
 */
export type PageRegionType =
	| "title"
	| "instruction"
	| "vocab-grid"
	| "tracing-line"
	| "writing-line" // ruled handwriting line (solid baseline + dashed teal midline), optional model letters
	| "draw-box" // empty bordered box for "haz un dibujo" / Dibuja
	| "paint-box" // freehand Colorea paint surface (illustration + brush layer)
	| "picture-grid" // grid of illustration cells (e.g. "marca con una x")
	| "syllable-bubble"
	| "sentence-line"
	| "illustration-slot"
	| "syllable-match" // "Encierra en un círculo la sílaba correspondiente" — a syllable + its candidate-word rows
	| "fill-in-blank" // "Completa las palabras con la sílaba correcta" — one word-box + blank + syllable choices
	| "vowel-line-match" // "Traza una línea desde la vocal Xx hasta el dibujo..." — 8 picture cells around a center vowel-pair
	| "vowel-pick-one" // "Presiona el dibujo que comienza con la vocal del recuadro" — one row per vowel, 3 picture options
	| "vowel-match-all" // "Traza una línea de la vocal al dibujo que le corresponde" — all 5 vowels, each paired 1:1 with its picture
	| "reading-sentences" // one or more real practice sentences to read aloud, e.g. "Mi mamá me mima."
	| "footer";

/** A single illustration cell inside a picture-grid region. */
export type PageGridCell = {
	/** Faithful color crop path; absent → "art pending" (never invented). */
	illustrationSrc?: string;
	/** Real Spanish word the picture depicts (used as caption + art-pipeline slug). */
	caption?: string;
	/**
	 * Whether this cell is a correct answer for its exercise (tap-to-select
	 * regions only). Absent means "not yet graded" — the renderer must treat
	 * that as non-interactive/ungraded rather than guessing, since a wrong
	 * guess here would mis-grade a real student.
	 */
	correct?: boolean;
};

/**
 * One word in a syllable-match row. Unlike a picture-grid cell, this is NOT a
 * multiple-choice pick — the real book exercise ("Encierra en un círculo la
 * sílaba correspondiente") shows several real example words that ALL contain
 * the target syllable, and asks the student to find/circle it in each one.
 * `correct` here means "contains the syllable" (true for every word in the
 * real book data checked so far) — grading is "did you mark all of them",
 * not "did you pick the right one out of distractors".
 */
export type SyllableMatchWord = { word: string; correct?: boolean; illustrationSrc?: string };
export type SyllableMatchRow = SyllableMatchWord[];

/** One choice offered inside a fill-in-blank item. */
export type FillInBlankChoice = { text: string; correct?: boolean };

/** One "complete the word" item inside a fill-in-blank exercise. */
export type FillInBlankItem = {
	/** The whole reference word shown in a box, e.g. "amo". */
	wordBox: string;
	/** Faithful color crop path for the wordBox image */
	illustrationSrc?: string;
	/** The partial word with the blank, e.g. "a ___" or "___ mi". */
	blank: string;
	/** The syllable choices offered — exactly one reconstructs `wordBox` via `blank`. */
	choices: FillInBlankChoice[];
};

export type PageRegionFontRole = "heading" | "body" | "tracing";

export type PageRegion = {
	id: string;
	regionType: PageRegionType;
	/** Render order within the page, ascending. */
	order: number;
	fontRole: PageRegionFontRole;
	/** Present on text-bearing regions. */
	text?: string;
	/** Optional bold inline label before the text (e.g. "Instrucciones:") — only where the book shows it. */
	label?: string;
	/**
	 * Faithful COLOR illustration cropped from the original artwork.
	 * Path under /public (e.g. "/cartilla/art/faithful/vocal-o/oso.webp"), produced
	 * by the art pipeline (see public/cartilla/art/faithful/manifest.json).
	 * When absent on an illustration-slot, the renderer shows an explicit
	 * "art pending" marker — never an invented drawing.
	 */
	illustrationSrc?: string;
	/** Caption/word for the illustration (real Spanish word, incl. accents). */
	caption?: string;
	/** For "writing-line": faint model letters at the start of the ruled line (e.g. "O o"). */
	modelText?: string;
	/** For "picture-grid": number of columns (defaults to a sensible value). */
	columns?: number;
	/** For "picture-grid": the illustration cells, in reading order. */
	cells?: PageGridCell[];
	/** For "syllable-match": the target syllable, e.g. "ma". */
	syllable?: string;
	/** For "syllable-match": each row of candidate words the student chooses among. */
	matchRows?: SyllableMatchRow[];
	/** For "fill-in-blank": the items in this exercise row. */
	fillItems?: FillInBlankItem[];
	/** For "vowel-line-match": the vowel pair shown in the center cell, e.g. "Oo". */
	letterPair?: string;
	/** For "vowel-line-match": the word/example the printed page shows already connected to the vowel with a line. */
	exampleCaption?: string;
	/** For "vowel-pick-one": one row per vowel — the letter + its candidate picture cells (one is correct). */
	vowelRows?: Array<{ letter: string; cells: PageGridCell[] }>;
	/** For "vowel-match-all": all 5 vowels, each 1:1 paired with its picture. */
	vowelPairs?: Array<{ letter: string } & PageGridCell>;
	/** For "reading-sentences": the real practice sentences, in reading order. */
	sentences?: string[];
	/**
	 * @deprecated Legacy pilot field that mapped to an INVENTED vector drawing.
	 * Not faithful — do not use on real pages; kept only so old pilot data parses.
	 */
	illustrationWord?: string;
};

export type WorkbookPageContent = {
	pageNumber: number;
	lessonNumber: number;
	pageRole: WorkbookPageRole;
	pageType: "workbook-page";
	verifiedTextBlocks: string[];
	imageScanReference: string | null;
	sourceScaffoldPosition: number | null;
	sourceRawLabel: string | null;
	transcriptionStatus: WorkbookTranscriptionStatus;
	/** Faithful-HTML region layout, when available (pilot pages only for now). */
	regions?: PageRegion[];
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
	lessons: RawPageScaffold[];
};

type RawPageScaffold = {
	position: number;
	rawLabel: string;
	textBlocks?: unknown[];
	sourcePages?: unknown[];
	originalImages?: unknown[];
	remasteredImages?: unknown[];
	bookFaithfulLesson: number;
};

type SourceArtAsset = {
	path?: string;
	verifiedWords?: string[];
	verifiedSightWords?: string[];
	verifiedStoryText?: string;
	illustratedObjects?: string[];
	description?: string;
	context?: string;
	sourceStatus?: string;
	verificationStatus?: string;
	transcriptionStatus?: string;
};

type SourceArtInventory = {
	assets?: SourceArtAsset[];
};

const raw = lessonsData as unknown as Raw;
const sourceInventory = sourceArtInventory as SourceArtInventory;
const sourceAssetByPath = new Map(
	(sourceInventory.assets ?? [])
		.filter((asset): asset is SourceArtAsset & { path: string } => Boolean(asset.path))
		.map((asset) => [asset.path, asset]),
);

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

function stringifyTextBlocks(blocks: unknown[] | undefined): string[] {
	if (!Array.isArray(blocks)) return [];
	return blocks
		.map((block) => {
			if (typeof block === "string") return block.trim();
			if (block && typeof block === "object" && "text" in block) {
				const text = (block as { text?: unknown }).text;
				return typeof text === "string" ? text.trim() : "";
			}
			return "";
		})
		.filter((text) => text.length > 0);
}

function firstReference(...groups: Array<unknown[] | undefined>) {
	for (const group of groups) {
		if (!Array.isArray(group)) continue;
		const value = group.find((item) => typeof item === "string" && item.trim().length > 0);
		if (typeof value === "string") return value;
	}
	return null;
}

function sourceTextBlocksForImage(imageRef: string | null): string[] {
	if (!imageRef) return [];
	const source = sourceAssetByPath.get(imageRef);
	if (!source) return [];

	const blocks: string[] = [];
	if (source.illustratedObjects?.length) {
		blocks.push(source.illustratedObjects.join(", "));
	}
	if (source.verifiedWords?.length) {
		blocks.push(source.verifiedWords.join(", "));
	}
	if (source.verifiedSightWords?.length) {
		blocks.push(source.verifiedSightWords.join(" · "));
	}
	if (source.verifiedStoryText) {
		blocks.push(...source.verifiedStoryText.split("\n").map((line) => line.trim()).filter(Boolean));
	}

	return Array.from(new Set(blocks.filter((line) => line.length > 0)));
}

function statusForTextBlocks(
	textBlocks: string[],
	scaffold: RawPageScaffold | undefined,
	imageRef: string | null,
) {
	if (textBlocks.length > 0) return "verified" satisfies WorkbookTranscriptionStatus;
	const sourceAsset = imageRef ? sourceAssetByPath.get(imageRef) : undefined;
	const hasSourceRef = Boolean(
		scaffold &&
			((scaffold.sourcePages?.length ?? 0) > 0 ||
				(scaffold.originalImages?.length ?? 0) > 0 ||
				(scaffold.remasteredImages?.length ?? 0) > 0),
	);
	const hasInventoryScan = Boolean(
		sourceAsset?.sourceStatus === "verified-source-image" ||
			sourceAsset?.verificationStatus === "source page scan connected",
	);
	return hasSourceRef || hasInventoryScan ? "partial" : ("missing" satisfies WorkbookTranscriptionStatus);
}

export function getWorkbookPagesForLesson(lessonNumber: number): WorkbookPageContent[] {
	const entry = CATALOG.find((item) => item.n === lessonNumber);
	if (!entry) return [];
	const scaffolds = raw.lessons.filter((page) => page.bookFaithfulLesson === lessonNumber);
	const pageNumbers = getLessonPageNumbers(entry.pages);
	const pageRole = getBookSectionForLesson(lessonNumber);

	return pageNumbers.map((pageNumber, index) => {
		const scaffold = scaffolds[index];
		const imageScanReference = scaffold
			? firstReference(scaffold.remasteredImages, scaffold.originalImages, scaffold.sourcePages)
			: null;
		const explicitTextBlocks = stringifyTextBlocks(scaffold?.textBlocks);
		const inventoryTextBlocks = sourceTextBlocksForImage(imageScanReference);
		const verifiedTextBlocks = explicitTextBlocks.length > 0 ? explicitTextBlocks : inventoryTextBlocks;
		return {
			pageNumber,
			lessonNumber,
			pageRole,
			pageType: "workbook-page",
			verifiedTextBlocks,
			imageScanReference,
			sourceScaffoldPosition: scaffold?.position ?? null,
			sourceRawLabel: scaffold?.rawLabel ?? null,
			transcriptionStatus: statusForTextBlocks(verifiedTextBlocks, scaffold, imageScanReference),
		};
	});
}

type PageLayouts = {
	pages: Record<string, { regions: PageRegion[] }>;
};

const canonicalLayouts = pageLayouts as unknown as PageLayouts;

/**
 * Faithful-HTML region layout for a page, if one has been authored & verified.
 * Canonical source: src/data/page-layouts.json (one shared file that drives the
 * student CRM view, student workbook, and teacher flipbook — same content, same
 * order everywhere). Returns null for any page not yet transcribed/verified,
 * so callers can fall back to their existing rendering.
 */
export function getPageLayout(pageNumber: number): PageRegion[] | null {
	const entry = canonicalLayouts.pages[String(pageNumber)];
	return entry ? entry.regions : null;
}

/** True if a faithful, verified layout exists for this page. */
export function hasPageLayout(pageNumber: number): boolean {
	return Boolean(canonicalLayouts.pages[String(pageNumber)]);
}

export function getWorkbookTranscriptionSummary(lessonNumber: number) {
	const pages = getWorkbookPagesForLesson(lessonNumber);
	const verified = pages.filter((page) => page.transcriptionStatus === "verified").length;
	const partial = pages.filter((page) => page.transcriptionStatus === "partial").length;
	const missing = pages.filter((page) => page.transcriptionStatus === "missing").length;
	return {
		total: pages.length,
		verified,
		partial,
		missing,
		status:
			verified === pages.length && pages.length > 0
				? ("verified" as const)
				: verified > 0 || partial > 0
					? ("partial" as const)
					: ("missing" as const),
	};
}

export function getFullWorkbookPages(): Array<{ page: number; lesson: number; imageScanReference: string | null; section: "Introducción" | "Vocales" | "Consonantes" }> {
	const out = [];
	for (const entry of CATALOG) {
		const lessonPages = getWorkbookPagesForLesson(entry.n);
		const sectionRaw = getBookSectionForLesson(entry.n);
		const section = (sectionRaw === "intro" ? "Introducción" : sectionRaw === "vowels" ? "Vocales" : "Consonantes") as "Introducción" | "Vocales" | "Consonantes";
		
		for (const page of lessonPages) {
			out.push({
				page: page.pageNumber,
				lesson: entry.n,
				imageScanReference: page.imageScanReference,
				section
			});
		}
	}
	return out;
}

