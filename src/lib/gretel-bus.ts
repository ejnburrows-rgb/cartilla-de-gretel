import { learnerScope, learnerStorageKey } from "./learner-storage";
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
  itemId?: string;
  encounterId?: string;
  reason?: "work-cleared" | "independent-follow-up";
  restored?: boolean;
  kind?: string;
  reaction?: string;
  text?: string;
  pageNumber?: number;
};

let activeContext: GretelBusDetail = {};
const assistedActivities = new Set<string>();
let assistanceScope = learnerScope();
const ASSISTANCE_KEY = "cartilla.gretel-assistance.v1";
function ensureLearnerScope() {
  if (assistanceScope !== learnerScope()) { assistedActivities.clear(); activeContext = {}; assistanceScope = learnerScope(); }
}
function readAssistance(): Set<string> {
  ensureLearnerScope();
  try { return new Set(JSON.parse(localStorage.getItem(learnerStorageKey(ASSISTANCE_KEY)) ?? "[]") as string[]); }
  catch { return new Set(assistedActivities); }
}
function saveAssistance(ids: Set<string>) {
  assistedActivities.clear(); ids.forEach(id => assistedActivities.add(id));
  try { localStorage.setItem(learnerStorageKey(ASSISTANCE_KEY), JSON.stringify([...ids])); } catch { /* optional storage */ }
}
export function isGretelAssistedAttempt(activityId = activeContext.activityId) { return !!activityId && readAssistance().has(activityId); }
export function releaseGretelActivity(id: string, encounterId?: string) { if (activeContext.activityId === id && (!encounterId || activeContext.encounterId === encounterId)) activeContext = {}; }
export function focusGretelActivity(detail: GretelBusDetail) {
  ensureLearnerScope();
  activeContext = detail;
  gretelEvent("activity:focus", detail);
}

const CHANNEL = "gretel:bus";

export function gretelEvent(type: GretelBusEvent, detail: GretelBusDetail = {}): void {
  if (typeof window === "undefined") return;
  ensureLearnerScope();
  const id = detail.activityId || activeContext.activityId;
  if (id && type === "guide:reaction" && ["cue", "hint", "demonstration"].includes(detail.reaction || "")) saveAssistance(new Set(readAssistance()).add(id));
  if (id && type === "activity:retry" && detail.reason === "work-cleared") { const ids = readAssistance(); ids.delete(id); saveAssistance(ids); }
  if (type === "page-turn:start" || type === "page:revealed") activeContext = {};
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { ...(detail.activityId ? {} : activeContext), type, ...detail } }));
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
