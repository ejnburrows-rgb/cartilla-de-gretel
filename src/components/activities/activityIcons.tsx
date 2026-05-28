import {
  BookOpen,
  Hand,
  Music2,
  Palette,
  PencilLine,
  Puzzle,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export type ActivityKind =
  | "write"
  | "read"
  | "draw"
  | "match"
  | "listen"
  | "review"
  | "sing"
  | "trace";

export type ActivityTone =
  | "a"
  | "e"
  | "i"
  | "o"
  | "u"
  | "primary"
  | "warning";

export interface ActivitySpec {
  Icon: LucideIcon;
  label: string;
  tone: ActivityTone;
}

/**
 * Canonical 8 assignment types used across the Cartilla. Stored as a single
 * registry so routes, badges, tooltips, and screenreader copy stay in sync.
 */
export const ACTIVITY_REGISTRY: Record<ActivityKind, ActivitySpec> = {
  write: { Icon: PencilLine, label: "Escribir", tone: "primary" },
  read: { Icon: BookOpen, label: "Leer", tone: "i" },
  draw: { Icon: Palette, label: "Dibujar", tone: "e" },
  match: { Icon: Puzzle, label: "Emparejar", tone: "o" },
  listen: { Icon: Volume2, label: "Escuchar", tone: "u" },
  review: { Icon: Sparkles, label: "Repasar", tone: "warning" },
  sing: { Icon: Music2, label: "Cantar", tone: "a" },
  trace: { Icon: Hand, label: "Trazar", tone: "primary" },
};

export const ALL_ACTIVITY_KINDS: ActivityKind[] = [
  "write",
  "read",
  "draw",
  "match",
  "listen",
  "review",
  "sing",
  "trace",
];

const TONE_TO_TINT: Record<ActivityTone, string> = {
  a: "bg-[hsl(var(--vowel-a))]/12 text-[hsl(var(--vowel-a))]",
  e: "bg-[hsl(var(--vowel-e))]/15 text-[hsl(var(--vowel-e))]",
  i: "bg-[hsl(var(--vowel-i))]/12 text-[hsl(var(--vowel-i))]",
  o: "bg-[hsl(var(--vowel-o))]/14 text-[hsl(var(--vowel-o))]",
  u: "bg-[hsl(var(--vowel-u))]/12 text-[hsl(var(--vowel-u))]",
  primary: "bg-[hsl(var(--primary))]/12 text-[hsl(var(--primary))]",
  warning: "bg-[hsl(var(--warning))]/18 text-[hsl(28,30%,18%)]",
};

const TONE_TO_SOLID: Record<ActivityTone, string> = {
  a: "bg-[hsl(var(--vowel-a))] text-white",
  e: "bg-[hsl(var(--vowel-e))] text-white",
  i: "bg-[hsl(var(--vowel-i))] text-white",
  o: "bg-[hsl(var(--vowel-o))] text-white",
  u: "bg-[hsl(var(--vowel-u))] text-white",
  primary: "bg-[hsl(var(--primary))] text-white",
  warning: "bg-[hsl(var(--warning))] text-[hsl(28,30%,18%)]",
};

export function activityTint(tone: ActivityTone): string {
  return TONE_TO_TINT[tone];
}

export function activitySolid(tone: ActivityTone): string {
  return TONE_TO_SOLID[tone];
}
