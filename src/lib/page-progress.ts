// page-progress.ts — per-page completion + time-on-page tracking.
// Lives in localStorage under cartilla.page.*. Distinct namespace from Codex
// student-session and streak-engine.
//
// Usage:
//   markPageStarted(7)         // when student opens page 7
//   markPageCompleted(7)       // when exercise is correct
//   getPageState(7) -> { ... }
//   getCompletionForLesson(2)  // 0..1

export type PageState = {
	page: number;
	startedAt?: number;   // epoch ms
	completedAt?: number; // epoch ms
	attempts: number;
	totalMs: number;
};

const KEY = "cartilla.page.state.v1";

function load(): Record<string, PageState> {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as Record<string, PageState>) : {};
	} catch {
		return {};
	}
}

function save(state: Record<string, PageState>): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(state));
	} catch {
		/* swallow quota errors */
	}
}

export function getPageState(page: number): PageState {
	const all = load();
	return (
		all[String(page)] ?? {
			page,
			attempts: 0,
			totalMs: 0,
		}
	);
}

export function markPageStarted(page: number): PageState {
	const all = load();
	const existing = all[String(page)] ?? { page, attempts: 0, totalMs: 0 };
	const next: PageState = {
		...existing,
		startedAt: Date.now(),
		attempts: existing.attempts + 1,
	};
	all[String(page)] = next;
	save(all);
	return next;
}

export function markPageCompleted(page: number, extraMs?: number): PageState {
	const all = load();
	const existing = all[String(page)] ?? { page, attempts: 0, totalMs: 0 };
	const now = Date.now();
	const session = existing.startedAt ? Math.max(0, now - existing.startedAt) : 0;
	const next: PageState = {
		...existing,
		completedAt: now,
		totalMs: existing.totalMs + session + (extraMs ?? 0),
		startedAt: undefined,
	};
	all[String(page)] = next;
	save(all);
	return next;
}

export function resetPage(page: number): void {
	const all = load();
	delete all[String(page)];
	save(all);
}

export function getAllPageStates(): Record<string, PageState> {
	return load();
}

export function isPageCompleted(page: number): boolean {
	return Boolean(getPageState(page).completedAt);
}

export function getCompletionForLesson(lessonPages: number[]): number {
	if (lessonPages.length === 0) return 0;
	const all = load();
	let done = 0;
	for (const p of lessonPages) {
		if (all[String(p)]?.completedAt) done += 1;
	}
	return done / lessonPages.length;
}

export function getTotalMinutesToday(): number {
	const all = load();
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	const startMs = start.getTime();
	let total = 0;
	for (const k of Object.keys(all)) {
		const s = all[k];
		if (s.completedAt && s.completedAt >= startMs) total += s.totalMs;
	}
	return Math.round(total / 60000);
}

export function getLastVisitedPage(): number | null {
	const all = load();
	let best: { page: number; t: number } | null = null;
	for (const k of Object.keys(all)) {
		const s = all[k];
		const t = s.completedAt ?? s.startedAt ?? 0;
		if (t && (!best || t > best.t)) best = { page: s.page, t };
	}
	return best?.page ?? null;
}
