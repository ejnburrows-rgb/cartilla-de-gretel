import lessonsData from "@/data/lessons.json";
import sourceArtInventory from "@/data/source-art-inventory.json";
import pageLayoutsPilot from "@/data/page-layouts.pilot.json";
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
	| "syllable-bubble"
	| "sentence-line"
	| "illustration-slot"
	| "footer";

export type PageRegionFontRole = "heading" | "body" | "tracing";

export type PageRegion = {
	id: string;
	regionType: PageRegionType;
	/** Render order within the page, ascending. */
	order: number;
	fontRole: PageRegionFontRole;
	/** Present on text-bearing regions. */
	text?: string;
	/** Present on illustration-slot regions; looked up in MonochromeDrawing's registry. */
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

type PageLayoutsPilot = {
	pages: Record<string, { regions: PageRegion[] }>;
};

const pilotLayouts = pageLayoutsPilot as unknown as PageLayoutsPilot;

/**
 * Faithful-HTML region layout for a page, if one has been authored.
 * Only pilot pages (1-6) currently have data; everything else returns null
 * until the corrected source files are transcribed.
 */
export function getPageLayout(pageNumber: number): PageRegion[] | null {
	const entry = pilotLayouts.pages[String(pageNumber)];
	return entry ? entry.regions : null;
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

