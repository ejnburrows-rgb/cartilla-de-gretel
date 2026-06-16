// gretel-bus.ts
// Typed event bus for the Gretel character system.
// Call gretelEvent(type) from any component to drive Gretel's pose and speech.

export type GretelBusEvent =
  | "lesson:start"    // wave → idle
  | "answer:correct"  // cheer 2s → idle
  | "answer:wrong"    // point 2s → idle
  | "hint:show"       // point, held until hint:hide
  | "hint:hide"       // return to idle
  | "lesson:complete" // cheer 3s → idle
  | "talk:start"      // enter talking loop
  | "talk:stop"       // return to idle
  | "nudge";          // point 2s (inactivity prompt)

const CHANNEL = "gretel:bus";

export function gretelEvent(type: GretelBusEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { type } }));
}

export function onGretelEvent(
  handler: (type: GretelBusEvent) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const type = (e as CustomEvent<{ type: GretelBusEvent }>).detail?.type;
    if (type) handler(type);
  };
  window.addEventListener(CHANNEL, listener);
  return () => window.removeEventListener(CHANNEL, listener);
}
