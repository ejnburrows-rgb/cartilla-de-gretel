import { PencilShape } from "@/components/cartilla/WorkbookPencilMark";

/**
 * High-definition pencil back eraser end (pink dome + ribbed silver ferrule + barrel).
 * The back eraser dome sits at exact (0, 0) so motion paths and cursor
 * hotspots align 1:1 with no standalone eraser brick or edge clipping.
 */
export function HdSchoolEraserShape({
  uid,
  className = "workbook-pencil__eraser-hd",
}: {
  uid: string;
  className?: string;
}) {
  return (
    <g className={className} transform="rotate(180 0 -39.75)">
      <PencilShape uid={uid} />
    </g>
  );
}
