import { forwardRef, type CSSProperties } from "react";
import { PENCIL_TIP_VIEWBOX } from "@/lib/cursor-mode";
import { OWNER_PENCIL_HEAD_DATA_URI } from "./ownerPencilPhotoAssets";

export interface OwnerPhotoPencilSvgProps {
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

/**
 * Owner-approved photographic sharpened wooden pencil cursor
 * (`74ccee59` / `b402cde8` `owner-pencil-tip.webp`, 600×497, 38,250 bytes,
 * transparent background, sharp graphite point at exact `(0, 0)` hotspot).
 * Shown exactly as approved: no added barrel extension, no clipping.
 */
export const OwnerPhotoPencilSvg = forwardRef<SVGSVGElement, OwnerPhotoPencilSvgProps>(
  function OwnerPhotoPencilSvg(
    { width, height, className = "contract-pencil-cursor__img", style, testId },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${PENCIL_TIP_VIEWBOX.width} ${PENCIL_TIP_VIEWBOX.height}`}
        overflow="visible"
        aria-hidden="true"
        className={className}
        data-testid={testId}
        style={style}
      >
        <image
          width={PENCIL_TIP_VIEWBOX.width}
          height={PENCIL_TIP_VIEWBOX.height}
          href={OWNER_PENCIL_HEAD_DATA_URI}
          data-testid="contract-pencil-photo-head"
        />
      </svg>
    );
  },
);
