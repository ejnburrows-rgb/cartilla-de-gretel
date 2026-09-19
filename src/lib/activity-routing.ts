import type { ActivityId } from "@/lib/lesson-catalog";

const ACTIVITY_IDS = new Set<ActivityId>([
  "silabas",
  "palabras",
  "armar",
  "trazar",
  "piano",
  "sonido",
  "espejo",
]);

export function normalizeActivityId(value: string | null): ActivityId {
  return value && ACTIVITY_IDS.has(value as ActivityId) ? (value as ActivityId) : "silabas";
}
