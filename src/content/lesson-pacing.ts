// lesson-pacing.ts — recommended pacing across a 36-week school year.
// Aug start, May end (US standard). 24 lessons over ~30 instructional weeks
// leaves slack for review weeks, holidays, and assessment windows.
//
// Teachers can override per-class in the CRM; this is the default suggestion.

export type PacingWeek = {
	week: number;             // 1..36
	label: string;            // "Week 1", etc.
	lessonN: number | null;   // null = review / assessment / break
	focus: "intro" | "vowel" | "consonant" | "review" | "assess" | "break";
	noteEs?: string;
	noteEn?: string;
};

export const PACING_CALENDAR: PacingWeek[] = [
	{ week: 1,  label: "Week 1",  lessonN: 1,  focus: "intro",     noteEs: "Establecer rutinas y conocer a Gretel.",      noteEn: "Establish routines and meet Gretel." },
	{ week: 2,  label: "Week 2",  lessonN: 2,  focus: "vowel" },
	{ week: 3,  label: "Week 3",  lessonN: 3,  focus: "vowel" },
	{ week: 4,  label: "Week 4",  lessonN: 4,  focus: "vowel" },
	{ week: 5,  label: "Week 5",  lessonN: 5,  focus: "vowel" },
	{ week: 6,  label: "Week 6",  lessonN: 6,  focus: "vowel" },
	{ week: 7,  label: "Week 7",  lessonN: null, focus: "review",  noteEs: "Repaso de vocales.",                            noteEn: "Vowel review." },
	{ week: 8,  label: "Week 8",  lessonN: null, focus: "assess",  noteEs: "Evaluaci\u00f3n inicial de fonema.",            noteEn: "Initial phoneme assessment." },
	{ week: 9,  label: "Week 9",  lessonN: 7,  focus: "consonant" },
	{ week: 10, label: "Week 10", lessonN: 8,  focus: "consonant" },
	{ week: 11, label: "Week 11", lessonN: 9,  focus: "consonant" },
	{ week: 12, label: "Week 12", lessonN: 10, focus: "consonant" },
	{ week: 13, label: "Week 13", lessonN: null, focus: "break",   noteEs: "Receso de Acci\u00f3n de Gracias.",             noteEn: "Thanksgiving break." },
	{ week: 14, label: "Week 14", lessonN: 11, focus: "consonant" },
	{ week: 15, label: "Week 15", lessonN: 12, focus: "consonant" },
	{ week: 16, label: "Week 16", lessonN: 13, focus: "consonant" },
	{ week: 17, label: "Week 17", lessonN: null, focus: "break",   noteEs: "Receso de invierno.",                            noteEn: "Winter break." },
	{ week: 18, label: "Week 18", lessonN: null, focus: "review",  noteEs: "Repaso de medio a\u00f1o.",                      noteEn: "Mid-year review." },
	{ week: 19, label: "Week 19", lessonN: 14, focus: "consonant" },
	{ week: 20, label: "Week 20", lessonN: 15, focus: "consonant" },
	{ week: 21, label: "Week 21", lessonN: 16, focus: "consonant" },
	{ week: 22, label: "Week 22", lessonN: 17, focus: "consonant" },
	{ week: 23, label: "Week 23", lessonN: 18, focus: "consonant" },
	{ week: 24, label: "Week 24", lessonN: null, focus: "review",  noteEs: "Repaso de R y rr.",                             noteEn: "R and rr review." },
	{ week: 25, label: "Week 25", lessonN: 19, focus: "consonant" },
	{ week: 26, label: "Week 26", lessonN: 20, focus: "consonant" },
	{ week: 27, label: "Week 27", lessonN: null, focus: "break",   noteEs: "Receso de primavera.",                          noteEn: "Spring break." },
	{ week: 28, label: "Week 28", lessonN: 21, focus: "consonant" },
	{ week: 29, label: "Week 29", lessonN: 22, focus: "consonant" },
	{ week: 30, label: "Week 30", lessonN: 23, focus: "consonant" },
	{ week: 31, label: "Week 31", lessonN: 24, focus: "consonant" },
	{ week: 32, label: "Week 32", lessonN: null, focus: "review",  noteEs: "Repaso integral.",                              noteEn: "Comprehensive review." },
	{ week: 33, label: "Week 33", lessonN: null, focus: "assess",  noteEs: "Evaluaci\u00f3n final.",                        noteEn: "Final assessment." },
	{ week: 34, label: "Week 34", lessonN: null, focus: "review",  noteEs: "Lectura libre y celebraci\u00f3n.",             noteEn: "Free reading and celebration." },
	{ week: 35, label: "Week 35", lessonN: null, focus: "review",  noteEs: "Portafolio del alumno.",                       noteEn: "Student portfolio." },
	{ week: 36, label: "Week 36", lessonN: null, focus: "review",  noteEs: "Cierre del a\u00f1o.",                          noteEn: "End-of-year celebration." },
];

export function pacingForWeek(week: number): PacingWeek | null {
	return PACING_CALENDAR.find((w) => w.week === week) ?? null;
}

export function weeksForLesson(lessonN: number): PacingWeek[] {
	return PACING_CALENDAR.filter((w) => w.lessonN === lessonN);
}
