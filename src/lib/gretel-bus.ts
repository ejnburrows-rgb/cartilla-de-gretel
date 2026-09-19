// Typed event bus for the Gretel character system.
// Reuse this channel for all character reactions; do not create a parallel bus.
export type GretelBusEvent =
  | "lesson:start"
  | "answer:correct"
  | "answer:wrong"
  | "hint:show"
  | "hint:hide"
  | "lesson:complete"
  | "activity:complete"
  | "talk:start"
  | "talk:stop"
  | "listen:start"
  | "listen:stop"
  | "mount"
  | "page-flip"
  | "page-turn:start"
  | "page:revealed"
  | "task:point"
  | "nudge"; // deprecated compatibility only; must not be auto-dispatched

const CHANNEL = "gretel:bus";

export function gretelEvent(type: GretelBusEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { type } }));
}

export function onGretelEvent(handler: (type: GretelBusEvent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const type = (event as CustomEvent<{ type: GretelBusEvent }>).detail?.type;
    if (type) handler(type);
  };
  window.addEventListener(CHANNEL, listener);
  return () => window.removeEventListener(CHANNEL, listener);
}
