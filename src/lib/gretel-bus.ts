// gretel-bus.ts
// Typed event bus for the Gretel character system.
// Call gretelEvent(type) from any component to drive Gretel's pose and speech.
//
// Owner rule (CLAUDE.md "Characters must be ALIVE"): Gretel may only speak/
// react to REAL student events. "nudge" (inactivity prompt) fires on a 10s
// timer with zero student action — DO NOT dispatch it. The timer that fired
// it has been removed from useGretelEvents. "mount" and "page-flip" are
// pose-only cues, never speech.

export type GretelBusEvent =
  | "lesson:start" // wave → idle
  | "answer:correct" // cheer 2s → idle
  | "answer:wrong" // point 2s → idle
  | "hint:show" // point, held until hint:hide
  | "hint:hide" // return to idle
  | "lesson:complete" // cheer 3s → idle
  | "activity:complete" // cheer
  | "talk:start" // enter talking loop
  | "talk:stop" // return to idle
  | "mount" // component mount — pose cue only, never speech
  | "page-flip" // turning page — pose cue only, never speech
  | "nudge"; // DEPRECATED — kept for type compat, MUST NOT be dispatched
// (the 10s timer in useGretelEvents that fired this is gone)

const CHANNEL = "gretel:bus";

export function gretelEvent(type: GretelBusEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { type } }));
}

export function onGretelEvent(handler: (type: GretelBusEvent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const type = (e as CustomEvent<{ type: GretelBusEvent }>).detail?.type;
    if (type) handler(type);
  };
  window.addEventListener(CHANNEL, listener);
  return () => window.removeEventListener(CHANNEL, listener);
}
