import { learnerScope, learnerStorageKey } from "./learner-storage";
// Typed event bus for the Gretel character system.
// Reuse this channel for all character reactions; do not create a parallel bus.
export type GretelBusEvent =
  | "activity:focus"
  | "activity:retry"
  | "guide:reaction"
  | "support:delivered"
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
const DEMONSTRATION_KEY = "cartilla.gretel-demonstration.v1";
export function hasGretelDemonstration(id?: string) {
  try { return !!id && JSON.parse(localStorage.getItem(learnerStorageKey(DEMONSTRATION_KEY)) ?? "[]").includes(id); } catch { return false; }
}
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
  if (id && type === "support:delivered" && !!(detail.targetId || detail.text)) saveAssistance(new Set(readAssistance()).add(id));
  if (id && type === "support:delivered" && detail.reaction === "demonstration" && detail.targetId) {
    try { const ids = new Set(JSON.parse(localStorage.getItem(learnerStorageKey(DEMONSTRATION_KEY)) ?? "[]")); ids.add(id); localStorage.setItem(learnerStorageKey(DEMONSTRATION_KEY), JSON.stringify([...ids])); } catch { /* optional */ }
  }
  if (id && type === "activity:retry" && detail.reason === "work-cleared") { const ids = readAssistance(); ids.delete(id); saveAssistance(ids); try { const demos = JSON.parse(localStorage.getItem(learnerStorageKey(DEMONSTRATION_KEY)) ?? "[]").filter((value: string) => value !== id); localStorage.setItem(learnerStorageKey(DEMONSTRATION_KEY), JSON.stringify(demos)); } catch { /* optional */ } }
  if (type === "page-turn:start" || (type === "page:revealed" && activeContext.pageNumber !== detail.pageNumber)) activeContext = {};
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
