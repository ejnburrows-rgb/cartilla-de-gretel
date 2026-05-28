import {
  ACTIVITY_REGISTRY,
  activitySolid,
  activityTint,
  type ActivityKind,
} from "./activityIcons";

export type ActivityBadgeVariant = "tint" | "solid";
export type ActivityBadgeSize = "sm" | "md" | "lg";

export interface ActivityBadgeProps {
  kind: ActivityKind;
  size?: ActivityBadgeSize;
  variant?: ActivityBadgeVariant;
  showLabel?: boolean;
  className?: string;
}

const SIZE_TO_BOX: Record<ActivityBadgeSize, string> = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-16 w-16 rounded-2xl",
};

const SIZE_TO_ICON_PX: Record<ActivityBadgeSize, number> = {
  sm: 18,
  md: 22,
  lg: 30,
};

const SIZE_TO_LABEL: Record<ActivityBadgeSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/**
 * Visual badge for an assignment type. Uses the canonical icon + tone
 * from ACTIVITY_REGISTRY, so all badges in the app stay consistent.
 */
export function ActivityBadge({
  kind,
  size = "md",
  variant = "tint",
  showLabel = true,
  className = "",
}: ActivityBadgeProps) {
  const spec = ACTIVITY_REGISTRY[kind];
  const Icon = spec.Icon;
  const colorClass =
    variant === "solid" ? activitySolid(spec.tone) : activityTint(spec.tone);
  const boxClass = SIZE_TO_BOX[size];
  const iconSize = SIZE_TO_ICON_PX[size];
  const labelSize = SIZE_TO_LABEL[size];

  return (
    <span
      className={"inline-flex items-center gap-3 " + className}
      data-activity={kind}
    >
      <span
        aria-hidden
        className={
          "flex shrink-0 items-center justify-center shadow-sm transition " +
          boxClass +
          " " +
          colorClass
        }
      >
        <Icon size={iconSize} strokeWidth={2.4} />
      </span>
      {showLabel ? (
        <span
          className={
            "font-black uppercase tracking-wider text-[hsl(28,30%,18%)]/85 " +
            labelSize
          }
        >
          {spec.label}
        </span>
      ) : null}
      <span className="sr-only">{spec.label}</span>
    </span>
  );
}
