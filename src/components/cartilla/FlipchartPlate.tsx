import { useId } from "react";
import frames from "@/data/flipchart-frames.json";
import { getFlipchartPageSrc, type FlipchartPage } from "@/lib/flipchart-hd";
import firstPages from "@/data/flipchart-text-3-22.json";
import middlePages from "@/data/flipchart-text-23-42.json";
import lastPages from "@/data/flipchart-text-43-62.json";

type DigitalText = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: number | string;
  fontStyle?: string;
  backgroundColor?: string;
};
const digitalPages = { ...firstPages, ...middlePages, ...lastPages } as Record<
  string,
  DigitalText[]
>;

type Frame = {
  width: number;
  height: number;
  left: number;
  right: number;
  bottom: number;
  topPoints: number[][];
};

/** Digital lettering over the original illustration layer, in the book's layout.
 * Page-specific clipping removes photographed bindings and outside scan edges.
 * Original source files and the shapes and colors of the illustrations stay intact.
 */
export function FlipchartPlate({
  page,
  decorative = false,
}: {
  page: FlipchartPage;
  decorative?: boolean;
}) {
  const clipId = `flipchart-plate-${useId().replace(/:/g, "")}`;
  const frame = (frames as Record<string, Frame>)[String(page.flipchartPage)];
  const src = getFlipchartPageSrc(page);
  const label = `Lámina ${page.flipchartPage} del flipchart`;
  const lettering = digitalPages[String(page.flipchartPage)] ?? [];

  if (!frame)
    return (
      <img
        className="fc-plate"
        src={src}
        alt={decorative ? "" : label}
        draggable={false}
      />
    );

  const points = [
    ...frame.topPoints,
    [frame.right, frame.bottom],
    [frame.left, frame.bottom],
  ]
    .map((point) => point.join(","))
    .join(" ");

  return (
    <svg
      className="fc-plate"
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      data-source-page={page.flipchartPage}
      data-digital-text={lettering.length > 0 ? "true" : "false"}
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={points} />
        </clipPath>
      </defs>
      <rect width={frame.width} height={frame.height} fill="#fff" />
      <image
        href={src}
        width={frame.width}
        height={frame.height}
        clipPath={`url(#${clipId})`}
      />
      {lettering.map((line, index) => (
        <rect
          key={index}
          x={line.x - 2}
          y={line.y - 2}
          width={line.width + 4}
          height={line.height + 4}
          fill={line.backgroundColor ?? "#fff"}
        />
      ))}
      {lettering
        .filter((line) => line.text)
        .map((line, index) => (
          <text
            key={index}
            x={line.x}
            y={line.y + line.height * 0.85}
            textLength={line.width}
            lengthAdjust="spacingAndGlyphs"
            fontSize={line.fontSize}
            fontFamily="Andika, sans-serif"
            fontWeight={line.fontWeight ?? 400}
            fontStyle={line.fontStyle ?? "normal"}
            fill={line.color}
          >
            {line.text}
          </text>
        ))}
    </svg>
  );
}
