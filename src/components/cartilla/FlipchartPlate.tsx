import { useId } from "react";
import frames from "@/data/flipchart-frames.json";
import { getFlipchartPageSrc, type FlipchartPage } from "@/lib/flipchart-hd";

type Frame = {
  width: number;
  height: number;
  left: number;
  right: number;
  bottom: number;
  topPoints: number[][];
};

/** Original color plate with page-specific scan margins hidden by display geometry.
 * This is a source-backed facsimile, not a vector reconstruction of the book.
 * No source image is rewritten, recolored, stretched, or contrast-adjusted.
 */
export function FlipchartPlate({ page, decorative = false }: {
  page: FlipchartPage;
  decorative?: boolean;
}) {
  const clipId = `flipchart-plate-${useId().replace(/:/g, "")}`;
  const frame = (frames as Record<string, Frame>)[String(page.flipchartPage)];
  const src = getFlipchartPageSrc(page);
  const label = `Lámina ${page.flipchartPage} del flipchart`;

  if (!frame) return <img className="fc-plate" src={src} alt={decorative ? "" : label} draggable={false} />;

  const points = [...frame.topPoints, [frame.right, frame.bottom], [frame.left, frame.bottom]]
    .map((point) => point.join(",")).join(" ");

  return (
    <svg
      className="fc-plate"
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      data-source-page={page.flipchartPage}
    >
      <defs><clipPath id={clipId}><polygon points={points} /></clipPath></defs>
      <rect width={frame.width} height={frame.height} fill="#fff" />
      <image href={src} width={frame.width} height={frame.height} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
