import type { IntroCatalogSlice } from "@/lib/gretel-voice";

export type GretelPresenceProps = {
  lesson?: IntroCatalogSlice;
  instruction?: string | null;
  className?: string;
  autoIntro?: boolean;
  variant?: "lesson" | "home";
  hideChrome?: boolean;
};

/** The student reader is intentionally silent and has no voice chrome. */
export function GretelPresence(_props: GretelPresenceProps) {
  return null;
}
