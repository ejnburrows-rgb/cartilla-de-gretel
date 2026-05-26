// analytics-bus.ts — DOM event bus for app-wide analytics events.
// Same pattern as gretel-speak. Components dispatch typed events; any
// future analytics dashboard attaches a single listener and consumes them.
// No external calls. No tracking. Local only.

export type AnalyticsEventName =
	| "page.opened"
	| "page.completed"
	| "exercise.attempt"
	| "exercise.correct"
	| "exercise.incorrect"
	| "lesson.opened"
	| "lesson.completed"
	| "session.started"
	| "session.ended"
	| "streak.incremented"
	| "badge.unlocked"
	| "assignment.completed"
	| "report.viewed";

export type AnalyticsEventDetail = {
	name: AnalyticsEventName;
	at: number; // epoch ms
	pageNumber?: number;
	lessonN?: number;
	studentId?: string;
	classId?: string;
	assignmentId?: string;
	durationMs?: number;
	correct?: boolean;
	meta?: Record<string, string | number | boolean>;
};

const EVENT_KEY = "cartilla:analytics";
const BUFFER_KEY = "cartilla.analytics.buffer.v1";
const MAX_BUFFER = 500;

export function emit(
	name: AnalyticsEventName,
	partial: Omit<Partial<AnalyticsEventDetail>, "name" | "at"> = {},
): AnalyticsEventDetail {
	const detail: AnalyticsEventDetail = {
		name,
		at: Date.now(),
		...partial,
	};
	if (typeof window === "undefined" || typeof CustomEvent === "undefined") return detail;
	window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail }));
	buffer(detail);
	return detail;
}

export function onAnalytics(handler: (detail: AnalyticsEventDetail) => void): () => void {
	if (typeof window === "undefined") return () => {};
	const listener = (e: Event) => {
		const ce = e as CustomEvent<AnalyticsEventDetail>;
		handler(ce.detail);
	};
	window.addEventListener(EVENT_KEY, listener);
	return () => window.removeEventListener(EVENT_KEY, listener);
}

function buffer(detail: AnalyticsEventDetail): void {
	try {
		const raw = window.localStorage.getItem(BUFFER_KEY);
		const arr: AnalyticsEventDetail[] = raw ? (JSON.parse(raw) as AnalyticsEventDetail[]) : [];
		arr.push(detail);
		while (arr.length > MAX_BUFFER) arr.shift();
		window.localStorage.setItem(BUFFER_KEY, JSON.stringify(arr));
	} catch {
		/* swallow */
	}
}

export function flushBuffer(): AnalyticsEventDetail[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(BUFFER_KEY);
		const arr: AnalyticsEventDetail[] = raw ? (JSON.parse(raw) as AnalyticsEventDetail[]) : [];
		window.localStorage.removeItem(BUFFER_KEY);
		return arr;
	} catch {
		return [];
	}
}

export function peekBuffer(): AnalyticsEventDetail[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(BUFFER_KEY);
		return raw ? (JSON.parse(raw) as AnalyticsEventDetail[]) : [];
	} catch {
		return [];
	}
}
