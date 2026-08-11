/**
 * LivingIllustration — faithful source art renderer.
 *
 * The printed workbook and teacher-flipchart artwork must remain visually
 * unchanged in the digital edition. Do not add breathing, blinking, eyelids,
 * redraws, generated frames, or other motion on top of source illustrations.
 * Interaction belongs around the artwork (pencil marks, tracing, matching),
 * never inside the original drawing itself.
 */

export interface LivingIllustrationProps {
  src: string;
  alt?: string;
  className?: string;
  /** Kept for call-site compatibility; faithful art is always static. */
  static?: boolean;
  loading?: "lazy" | "eager";
}

export function LivingIllustration({
  src,
  alt = "",
  className = "",
  loading = "lazy",
}: LivingIllustrationProps) {
  return (
    <span className={["living-illustration", className].filter(Boolean).join(" ")}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        className="living-illustration__art"
      />
    </span>
  );
}
