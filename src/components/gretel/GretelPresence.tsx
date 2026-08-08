/**
 * GretelPresence — intentionally silent and without audio controls.
 *
 * The student workbook does not provide synthetic narration or sound controls.
 * This placeholder keeps existing page composition stable while rendering no UI.
 */
import type { IntroCatalogSlice } from "@/lib/gretel-voice";

export type GretelPresenceProps = {
  lesson?: IntroCatalogSlice;
  instruction?: string | null;
  className?: string;
  autoIntro?: boolean;
  variant?: "lesson" | "home";
  hideChrome?: boolean;
};

export function GretelPresence(_props: GretelPresenceProps) {
  return null;
}
