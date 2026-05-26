// gretel-speak.ts — thin event bus for Gretel feedback / narration.
//
// The future real-voice audio layer (boy + girl recorded voices) attaches to
// the DOM event "cartilla:gretel-speak". Components dispatch outcome strings;
// this module does NOT play TTS or any sound. Audio is shipped later.
//
// Usage:
//   gretelSpeak("correct");
//   gretelSpeak("start", { pageNumber: 7 });
//
//   document.addEventListener("cartilla:gretel-speak", (e) => {
//     // play real-voice clip mapped to e.detail.outcome / phrase
//   });

import { gretelSay, type FeedbackOutcome } from "../content/gretel-feedback";

export type GretelSpeakDetail = {
	outcome: FeedbackOutcome;
	phrase: string;
	pageNumber?: number;
	lessonN?: number;
};

export function gretelSpeak(
	outcome: FeedbackOutcome,
	extras: { pageNumber?: number; lessonN?: number; seed?: number } = {},
): GretelSpeakDetail {
	const phrase = gretelSay(outcome, extras.seed);
	const detail: GretelSpeakDetail = {
		outcome,
		phrase,
		pageNumber: extras.pageNumber,
		lessonN: extras.lessonN,
	};
	if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
		window.dispatchEvent(new CustomEvent("cartilla:gretel-speak", { detail }));
	}
	return detail;
}

export function onGretelSpeak(handler: (detail: GretelSpeakDetail) => void): () => void {
	if (typeof window === "undefined") return () => {};
	const listener = (e: Event) => {
		const ce = e as CustomEvent<GretelSpeakDetail>;
		handler(ce.detail);
	};
	window.addEventListener("cartilla:gretel-speak", listener);
	return () => window.removeEventListener("cartilla:gretel-speak", listener);
}
