// storage-keys.ts — single registry of every localStorage namespace.
// Anything that writes to localStorage MUST import its key from here.
// Prevents silent collisions across lanes (student, family, teacher, etc).

export const KEYS = {
	// Locale
	lang:                 "cartilla.lang.v1",

	// Theme
	theme:                "cartilla.theme.v1",

	// Tutorial
	tutorialDone:         "cartilla.tutorial.done.v1",

	// Page progress (student session)
	pageState:            "cartilla.page.state.v1",

	// Analytics
	analyticsBuffer:      "cartilla.analytics.buffer.v1",

	// Student session + roster
	studentSession:       "cartilla.alumno.session.v1",
	studentProfiles:      "cartilla.alumno.profiles.v1",

	// Family
	familyHousehold:      "cartilla.familia.household.v1",
	familyMessages:       "cartilla.familia.messages.v1",

	// Streak + badges
	streakState:          "cartilla.streak.state.v1",
	badgesEarned:         "cartilla.badges.earned.v1",
	stickersEarned:       "cartilla.stickers.earned.v1",

	// Teacher CRM
	teacherClasses:       "cartilla.maestro.classes.v1",
	teacherStudents:      "cartilla.maestro.students.v1",
	teacherAssignments:   "cartilla.maestro.assignments.v1",
	teacherReports:       "cartilla.maestro.reports.v1",
	teacherSettings:      "cartilla.maestro.settings.v1",

	// Director / principal
	directorSchools:      "cartilla.director.schools.v1",
	directorSettings:     "cartilla.director.settings.v1",

	// PWA / offline
	pwaInstallDismissed:  "cartilla.pwa.install-dismissed.v1",

	// Audio
	audioMuted:           "cartilla.audio.muted.v1",
	audioVolume:          "cartilla.audio.volume.v1",

	// Kiosko
	kioskoMode:           "cartilla.kiosko.mode.v1",

	// A11y
	a11yReducedMotion:    "cartilla.a11y.reduced-motion.v1",
	a11yReadingRuler:     "cartilla.a11y.reading-ruler.v1",
	a11yLargeText:        "cartilla.a11y.large-text.v1",
} as const;

export type StorageKey = keyof typeof KEYS;

export function read<T = unknown>(key: StorageKey): T | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEYS[key]);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
}

export function write(key: StorageKey, value: unknown): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEYS[key], JSON.stringify(value));
	} catch {
		/* swallow */
	}
}

export function clear(key: StorageKey): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(KEYS[key]);
	} catch {
		/* swallow */
	}
}

export function listAllKeys(): string[] {
	return Object.values(KEYS);
}
