// lesson-meta.ts — single source of truth for the 24 lessons.
// Used by: PageExercisePane, PolishedPage (color), Codex teacher CRM, Antigravity print.
// Do not edit lesson order, page ranges, or colors without updating page-bindings.json in lockstep.

export type LessonKind = "intro" | "vowel" | "consonant";
export type LetterId = string;

export type LessonMeta = {
	n: number;
	title: string;            // shown to teacher
	titleEs: string;          // shown to student (Spanish)
	letter: string;           // e.g. "M", "Mm", "O", or "—" for intro
	kind: LessonKind;
	pages: [number, number];  // inclusive
	accent: string;           // hex, used by PolishedPage
	studentBgClass: string;   // pastel class from cartilla-polish.css
	teacherBgClass: string;   // vibrant class from cartilla-polish.css
	syllables: string[];      // syllables introduced (empty for intro)
	keywords: string[];       // representative words from this lesson (workbook-verified)
};

export const LESSONS: LessonMeta[] = [
	{ n: 1,  title: "Welcome · Intro",        titleEs: "Bienvenida",            letter: "—",  kind: "intro",     pages: [1, 3],   accent: "#c98c4f", studentBgClass: "cartilla-lesson-bg-1",  teacherBgClass: "",                    syllables: [],                                       keywords: [] },
	{ n: 2,  title: "Vowel O",                titleEs: "La vocal O",            letter: "O",  kind: "vowel",     pages: [4, 6],   accent: "#2f80ed", studentBgClass: "cartilla-lesson-bg-2",  teacherBgClass: "cartilla-teacher-bg-2",  syllables: ["o"],                                  keywords: ["oso", "ojo", "oso"] },
	{ n: 3,  title: "Vowel A",                titleEs: "La vocal A",            letter: "A",  kind: "vowel",     pages: [7, 9],   accent: "#e63946", studentBgClass: "cartilla-lesson-bg-3",  teacherBgClass: "cartilla-teacher-bg-3",  syllables: ["a"],                                  keywords: ["ala", "ave", "agua"] },
	{ n: 4,  title: "Vowel E",                titleEs: "La vocal E",            letter: "E",  kind: "vowel",     pages: [10, 12], accent: "#f28c28", studentBgClass: "cartilla-lesson-bg-4",  teacherBgClass: "cartilla-teacher-bg-4",  syllables: ["e"],                                  keywords: ["elefante", "escoba"] },
	{ n: 5,  title: "Vowel I",                titleEs: "La vocal I",            letter: "I",  kind: "vowel",     pages: [13, 15], accent: "#2a9d8f", studentBgClass: "cartilla-lesson-bg-5",  teacherBgClass: "cartilla-teacher-bg-5",  syllables: ["i"],                                  keywords: ["iguana", "isla"] },
	{ n: 6,  title: "Vowel U",                titleEs: "La vocal U",            letter: "U",  kind: "vowel",     pages: [16, 18], accent: "#8338ec", studentBgClass: "cartilla-lesson-bg-6",  teacherBgClass: "cartilla-teacher-bg-6",  syllables: ["u"],                                  keywords: ["uvas", "uno"] },
	{ n: 7,  title: "Consonant Mm",           titleEs: "La consonante Mm",      letter: "Mm", kind: "consonant", pages: [19, 22], accent: "#E63946", studentBgClass: "cartilla-lesson-bg-7",  teacherBgClass: "cartilla-teacher-bg-7",  syllables: ["ma", "me", "mi", "mo", "mu"],          keywords: ["mam\u00e1", "mesa", "mi", "mono", "mula"] },
	{ n: 8,  title: "Consonant Pp",           titleEs: "La consonante Pp",      letter: "Pp", kind: "consonant", pages: [23, 26], accent: "#F4A261", studentBgClass: "cartilla-lesson-bg-8",  teacherBgClass: "cartilla-teacher-bg-8",  syllables: ["pa", "pe", "pi", "po", "pu"],          keywords: ["papá", "pelo", "pino", "pollo", "puma"] },
	{ n: 9,  title: "Consonant Ss",           titleEs: "La consonante Ss",      letter: "Ss", kind: "consonant", pages: [27, 30], accent: "#2A9D8F", studentBgClass: "cartilla-lesson-bg-9",  teacherBgClass: "cartilla-teacher-bg-9",  syllables: ["sa", "se", "si", "so", "su"],          keywords: ["sapo", "sed", "silla", "sol", "susto"] },
	{ n: 10, title: "Consonant Tt",           titleEs: "La consonante Tt",      letter: "Tt", kind: "consonant", pages: [31, 34], accent: "#264653", studentBgClass: "cartilla-lesson-bg-10", teacherBgClass: "cartilla-teacher-bg-10", syllables: ["ta", "te", "ti", "to", "tu"],          keywords: ["taza", "techo", "tío", "tomate", "tuna"] },
	{ n: 11, title: "Consonant Dd",           titleEs: "La consonante Dd",      letter: "Dd", kind: "consonant", pages: [35, 38], accent: "#8338EC", studentBgClass: "cartilla-lesson-bg-11", teacherBgClass: "cartilla-teacher-bg-11", syllables: ["da", "de", "di", "do", "du"],          keywords: ["dado", "dedo", "día", "dorado", "dulce"] },
	{ n: 12, title: "Consonant Ll",           titleEs: "La consonante Ll",      letter: "Ll", kind: "consonant", pages: [39, 42], accent: "#E63946", studentBgClass: "cartilla-lesson-bg-12", teacherBgClass: "cartilla-teacher-bg-12", syllables: ["la", "le", "li", "lo", "lu"],          keywords: ["lata", "lema", "lima", "lobo", "lupa"] },
	{ n: 13, title: "Consonant Nn",           titleEs: "La consonante Nn",      letter: "Nn", kind: "consonant", pages: [43, 46], accent: "#F4A261", studentBgClass: "cartilla-lesson-bg-13", teacherBgClass: "cartilla-teacher-bg-13", syllables: ["na", "ne", "ni", "no", "nu"],          keywords: ["nata", "negro", "nido", "mono", "nudo"] },
	{ n: 14, title: "Consonant \u00d1\u00f1",titleEs: "La consonante \u00d1\u00f1", letter: "\u00d1\u00f1", kind: "consonant", pages: [47, 50], accent: "#2A9D8F", studentBgClass: "cartilla-lesson-bg-14", teacherBgClass: "cartilla-teacher-bg-14", syllables: ["\u00f1a", "\u00f1e", "\u00f1i", "\u00f1o", "\u00f1u"], keywords: ["caña", "muñeca", "moño", "ñu"] },
	{ n: 15, title: "Consonant Bb",           titleEs: "La consonante Bb",      letter: "Bb", kind: "consonant", pages: [51, 54], accent: "#264653", studentBgClass: "cartilla-lesson-bg-15", teacherBgClass: "cartilla-teacher-bg-15", syllables: ["ba", "be", "bi", "bo", "bu"],          keywords: ["bala", "bebe", "bici", "bota", "buho"] },
	{ n: 16, title: "Consonant Vv",           titleEs: "La consonante Vv",      letter: "Vv", kind: "consonant", pages: [55, 58], accent: "#8338EC", studentBgClass: "cartilla-lesson-bg-16", teacherBgClass: "cartilla-teacher-bg-16", syllables: ["va", "ve", "vi", "vo", "vu"],          keywords: ["vaca", "vela", "vino", "voto", "vuelo"] },
	{ n: 17, title: "Consonant Rr (soft)",    titleEs: "La consonante Rr",      letter: "Rr", kind: "consonant", pages: [59, 62], accent: "#E63946", studentBgClass: "cartilla-lesson-bg-17", teacherBgClass: "cartilla-teacher-bg-17", syllables: ["ra", "re", "ri", "ro", "ru"],          keywords: ["ratio", "remo", "rito", "rosa", "ruta"] },
	{ n: 18, title: "Consonant rr (strong)",  titleEs: "La consonante rr",      letter: "rr", kind: "consonant", pages: [63, 66], accent: "#F4A261", studentBgClass: "cartilla-lesson-bg-18", teacherBgClass: "cartilla-teacher-bg-18", syllables: ["rra", "rre", "rri", "rro", "rru"],     keywords: ["carro", "perro", "torre", "burro"] },
	{ n: 19, title: "Consonant Gg (ga/go/gu)",titleEs: "La consonante Gg",      letter: "Gg", kind: "consonant", pages: [67, 70], accent: "#2A9D8F", studentBgClass: "cartilla-lesson-bg-19", teacherBgClass: "cartilla-teacher-bg-19", syllables: ["ga", "go", "gu"],                       keywords: ["gato", "goma", "gusano"] },
	{ n: 20, title: "Consonant Ff",           titleEs: "La consonante Ff",      letter: "Ff", kind: "consonant", pages: [71, 74], accent: "#264653", studentBgClass: "cartilla-lesson-bg-20", teacherBgClass: "cartilla-teacher-bg-20", syllables: ["fa", "fe", "fi", "fo", "fu"],          keywords: ["faro", "feo", "fila", "foca", "fuego"] },
	{ n: 21, title: "Consonant Jj",           titleEs: "La consonante Jj",      letter: "Jj", kind: "consonant", pages: [75, 78], accent: "#8338EC", studentBgClass: "cartilla-lesson-bg-21", teacherBgClass: "cartilla-teacher-bg-21", syllables: ["ja", "je", "ji", "jo", "ju"],          keywords: ["jarro", "jefe", "jirafa", "jota", "jugo"] },
	{ n: 22, title: "Consonant Cc (ca/co/cu)",titleEs: "La consonante Cc",      letter: "Cc", kind: "consonant", pages: [79, 82], accent: "#E63946", studentBgClass: "cartilla-lesson-bg-22", teacherBgClass: "cartilla-teacher-bg-22", syllables: ["ca", "co", "cu"],                       keywords: ["casa", "cola", "cuna"] },
	{ n: 23, title: "Consonant Yy",           titleEs: "La consonante Yy",      letter: "Yy", kind: "consonant", pages: [83, 86], accent: "#F4A261", studentBgClass: "cartilla-lesson-bg-23", teacherBgClass: "cartilla-teacher-bg-23", syllables: ["ya", "ye", "yi", "yo", "yu"],          keywords: ["yate", "yegua", "yo-yo", "yuca"] },
	{ n: 24, title: "Consonant Zz",           titleEs: "La consonante Zz",      letter: "Zz", kind: "consonant", pages: [87, 90], accent: "#2A9D8F", studentBgClass: "cartilla-lesson-bg-24", teacherBgClass: "cartilla-teacher-bg-24", syllables: ["za", "ze", "zi", "zo", "zu"],          keywords: ["zapato", "zorro", "zumo"] },
];

export function getLesson(n: number): LessonMeta | null {
	return LESSONS.find((l) => l.n === n) ?? null;
}

export function getLessonForPage(page: number): LessonMeta | null {
	return LESSONS.find((l) => page >= l.pages[0] && page <= l.pages[1]) ?? null;
}

export function pagesForLesson(n: number): number[] {
	const l = getLesson(n);
	if (!l) return [];
	const out: number[] = [];
	for (let p = l.pages[0]; p <= l.pages[1]; p++) out.push(p);
	return out;
}

export const TOTAL_LESSONS = LESSONS.length;
export const TOTAL_PAGES = 90;
