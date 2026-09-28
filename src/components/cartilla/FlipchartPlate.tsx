import { useId } from "react";
import { FlipchartFrontmatter } from "./FlipchartFrontmatter";
import frames from "@/data/flipchart-frames.json";
import {
  getFlipchartDeliverySrc,
  type FlipchartDeliveryTier,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
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

/**
 * Native classroom surface. Pages 3–62 render selectable digital lettering
 * above build-generated illustration-only WebP layers; the canonical JPG stays
 * source/provenance only. Pages 1–2 are rebuilt as native frontmatter.
 */
export function FlipchartPlate({
  page,
  decorative = false,
  deliveryTier = "screen",
  onLoad,
}: {
  page: FlipchartPage;
  decorative?: boolean;
  deliveryTier?: FlipchartDeliveryTier;
  onLoad?: () => void;
}) {
  const clipId = `flipchart-plate-${useId().replace(/:/g, "")}`;
  const frame = (frames as Record<string, Frame>)[String(page.flipchartPage)];
  const src = getFlipchartDeliverySrc(page, deliveryTier);
  const label = `Lámina ${page.flipchartPage} del flipchart`;
  const lettering = digitalPages[String(page.flipchartPage)] ?? [];

  if (page.flipchartPage === 1 || page.flipchartPage === 2) {
    return (
      <FlipchartFrontmatter
        pageNumber={page.flipchartPage}
        decorative={decorative}
        onReady={onLoad}
      />
    );
  }

  if (!frame)
    return (
      <img
        className="fc-plate"
        src={src}
        alt={decorative ? "" : label}
        draggable={false}
        loading={decorative ? "lazy" : "eager"}
        decoding="async"
        onLoad={onLoad}
        data-delivery-tier={deliveryTier}
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
      data-native-flipchart="true"
      data-digital-text={lettering.length > 0 ? "true" : "false"}
      data-delivery-tier={deliveryTier}
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
        onLoad={onLoad}
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
