import { PENCIL_LENGTH, PencilShape } from "@/components/cartilla/WorkbookPencilMark";

/**
 * High-definition pencil back eraser end (pink dome + ribbed silver ferrule + barrel).
 * The back eraser dome sits at exact (0, 0) so motion paths and cursor
 * hotspots align 1:1 with no standalone eraser brick or edge clipping.
 */
export function HdSchoolEraserShape({
  uid,
  stretch = 0,
  className = "workbook-pencil__eraser-hd",
}: {
  uid: string;
  stretch?: number;
  className?: string;
}) {
  const centerY = -(PENCIL_LENGTH + stretch) / 2;
  return (
    <g className={className} transform={`rotate(180 0 ${centerY.toFixed(2)})`}>
      <PencilShape uid={uid} stretch={stretch} />
    </g>
  );
}
