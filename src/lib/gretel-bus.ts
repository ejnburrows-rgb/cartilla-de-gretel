// Typed event bus for the Gretel character system.
// Reuse this channel for all character reactions; do not create a parallel bus.
export type GretelBusEvent =
  | "activity:focus"
  | "activity:retry"
  | "guide:reaction"
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

export type GretelBusDetail = {
  activityId?: string;
  targetId?: string;
  kind?: string;
  reaction?: string;
  text?: string;
  pageNumber?: number;
};

let activeContext: GretelBusDetail = {};
const assistedActivities = new Set<string>();
export function isGretelAssistedAttempt() { return !!activeContext.activityId && assistedActivities.has(activeContext.activityId); }
export function releaseGretelActivity(id: string) { if (activeContext.activityId === id) activeContext = {}; }
export function focusGretelActivity(detail: GretelBusDetail) {
  activeContext = detail;
  gretelEvent("activity:focus", detail);
}

const CHANNEL = "gretel:bus";

export function gretelEvent(type: GretelBusEvent, detail: GretelBusDetail = {}): void {
  if (typeof window === "undefined") return;
  const id = detail.activityId || activeContext.activityId;
  if (id && type === "guide:reaction" && ["hint", "demonstration", "independent-retry"].includes(detail.reaction || "")) assistedActivities.add(id);
  if (id && type === "activity:retry") assistedActivities.delete(id);
  if (type === "page-turn:start") activeContext = {};
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { ...activeContext, type, ...detail } }));
}

export function onGretelEvent(
  handler: (type: GretelBusEvent, detail: GretelBusDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const payload = (event as CustomEvent<{ type: GretelBusEvent } & GretelBusDetail>).detail;
    const type = payload?.type;
    if (type) {
      const { type: _type, ...detail } = payload;
      handler(type, detail);
    }
  };
  window.addEventListener(CHANNEL, listener);
  return () => window.removeEventListener(CHANNEL, listener);
}
