// print-binder-config.ts — printable teacher binder layout.
// Binder route + components live in Antigravity lane (src/routes/cartilla/binder/*).
// We own the data: cover copy, section dividers, page order, fonts policy.

export type BinderSection = {
	id: string;
	titleEs: string;
	titleEn: string;
	subtitleEs?: string;
	subtitleEn?: string;
	// Workbook page range, inclusive. Empty array = no workbook pages in section.
	pages: number[];
	includeTeacherTip: boolean;
	includeStandardsCoverage: boolean;
	includeFamilyPlan: boolean;
};

export const BINDER_COVER = {
	titleEs: "La Cartilla de Gretel \u2014 Carpeta del Maestro",
	titleEn: "La Cartilla de Gretel \u2014 Teacher Binder",
	subtitleEs: "24 lecciones \u00b7 90 p\u00e1ginas",
	subtitleEn: "24 lessons \u00b7 90 pages",
	creditLineEs: "Basado en la obra original de Leonor Lopetegui (\u00a92004).",
	creditLineEn: "Based on the original work by Leonor Lopetegui (\u00a92004).",
} as const;

function rangeInclusive(start: number, end: number): number[] {
	const out: number[] = [];
	for (let i = start; i <= end; i++) out.push(i);
	return out;
}

export const BINDER_SECTIONS: BinderSection[] = [
	{ id: "intro",    titleEs: "Lecci\u00f3n 1 \u00b7 Introducci\u00f3n", titleEn: "Lesson 1 \u00b7 Intro",         pages: rangeInclusive(1, 3),  includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "vowel-o",  titleEs: "Lecci\u00f3n 2 \u00b7 Oo",                 titleEn: "Lesson 2 \u00b7 Oo",            pages: rangeInclusive(4, 6),  includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "vowel-a",  titleEs: "Lecci\u00f3n 3 \u00b7 Aa",                 titleEn: "Lesson 3 \u00b7 Aa",            pages: rangeInclusive(7, 9),  includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "vowel-e",  titleEs: "Lecci\u00f3n 4 \u00b7 Ee",                 titleEn: "Lesson 4 \u00b7 Ee",            pages: rangeInclusive(10, 12), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "vowel-i",  titleEs: "Lecci\u00f3n 5 \u00b7 Ii",                 titleEn: "Lesson 5 \u00b7 Ii",            pages: rangeInclusive(13, 15), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "vowel-u",  titleEs: "Lecci\u00f3n 6 \u00b7 Uu",                 titleEn: "Lesson 6 \u00b7 Uu",            pages: rangeInclusive(16, 18), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-m",   titleEs: "Lecci\u00f3n 7 \u00b7 Mm",                 titleEn: "Lesson 7 \u00b7 Mm",            pages: rangeInclusive(19, 22), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-p",   titleEs: "Lecci\u00f3n 8 \u00b7 Pp",                 titleEn: "Lesson 8 \u00b7 Pp",            pages: rangeInclusive(23, 26), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-s",   titleEs: "Lecci\u00f3n 9 \u00b7 Ss",                 titleEn: "Lesson 9 \u00b7 Ss",            pages: rangeInclusive(27, 30), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-t",   titleEs: "Lecci\u00f3n 10 \u00b7 Tt",                titleEn: "Lesson 10 \u00b7 Tt",           pages: rangeInclusive(31, 34), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-d",   titleEs: "Lecci\u00f3n 11 \u00b7 Dd",                titleEn: "Lesson 11 \u00b7 Dd",           pages: rangeInclusive(35, 38), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-l",   titleEs: "Lecci\u00f3n 12 \u00b7 Ll",                titleEn: "Lesson 12 \u00b7 Ll",           pages: rangeInclusive(39, 42), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-n",   titleEs: "Lecci\u00f3n 13 \u00b7 Nn",                titleEn: "Lesson 13 \u00b7 Nn",           pages: rangeInclusive(43, 46), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-nt",  titleEs: "Lecci\u00f3n 14 \u00b7 \u00d1\u00f1",     titleEn: "Lesson 14 \u00b7 \u00d1\u00f1", pages: rangeInclusive(47, 50), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-b",   titleEs: "Lecci\u00f3n 15 \u00b7 Bb",                titleEn: "Lesson 15 \u00b7 Bb",           pages: rangeInclusive(51, 54), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-v",   titleEs: "Lecci\u00f3n 16 \u00b7 Vv",                titleEn: "Lesson 16 \u00b7 Vv",           pages: rangeInclusive(55, 58), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-r",   titleEs: "Lecci\u00f3n 17 \u00b7 Rr (suave)",        titleEn: "Lesson 17 \u00b7 Rr (soft)",    pages: rangeInclusive(59, 62), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-rr",  titleEs: "Lecci\u00f3n 18 \u00b7 rr (fuerte)",       titleEn: "Lesson 18 \u00b7 rr (strong)",  pages: rangeInclusive(63, 66), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-g",   titleEs: "Lecci\u00f3n 19 \u00b7 Gg (ga/go/gu)",     titleEn: "Lesson 19 \u00b7 Gg (ga/go/gu)",pages: rangeInclusive(67, 70), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-f",   titleEs: "Lecci\u00f3n 20 \u00b7 Ff",                titleEn: "Lesson 20 \u00b7 Ff",           pages: rangeInclusive(71, 74), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-j",   titleEs: "Lecci\u00f3n 21 \u00b7 Jj",                titleEn: "Lesson 21 \u00b7 Jj",           pages: rangeInclusive(75, 78), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-c",   titleEs: "Lecci\u00f3n 22 \u00b7 Cc (ca/co/cu)",     titleEn: "Lesson 22 \u00b7 Cc (ca/co/cu)",pages: rangeInclusive(79, 82), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-y",   titleEs: "Lecci\u00f3n 23 \u00b7 Yy",                titleEn: "Lesson 23 \u00b7 Yy",           pages: rangeInclusive(83, 86), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
	{ id: "cons-z",   titleEs: "Lecci\u00f3n 24 \u00b7 Zz",                titleEn: "Lesson 24 \u00b7 Zz",           pages: rangeInclusive(87, 90), includeTeacherTip: true, includeStandardsCoverage: true, includeFamilyPlan: true },
];

export const BINDER_PRINT_POLICY = {
	// PDF book.pdf must ship in dist/book/book.pdf and be ≥ 50KB and start with %PDF-.
	paperSize: "LETTER",      // 8.5 x 11 in
	marginsMm: { top: 12, right: 12, bottom: 12, left: 12 },
	dpi: 300,
	includeBleed: false,
	fontStackEs: "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
	includePageNumbers: true,
	includeQrToWeb: true,
} as const;

export function sectionForPage(page: number): BinderSection | null {
	return BINDER_SECTIONS.find((s) => s.pages.includes(page)) ?? null;
}
