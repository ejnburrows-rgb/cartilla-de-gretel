import { forwardRef, useId, type CSSProperties } from "react";
import { PENCIL_TIP_VIEWBOX } from "@/lib/cursor-mode";
import {
  OWNER_PENCIL_BARREL_TILE_DATA_URI,
  OWNER_PENCIL_HEAD_DATA_URI,
} from "./ownerPencilPhotoAssets";

export interface OwnerPhotoPencilSvgProps {
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  shadowRef?: React.Ref<SVGGElement>;
  testId?: string;
}

/**
 * Official `@image1` extreme close-up photographic sharpened wooden pencil SVG
 * in Prototype B orientation (point facing up-left at `(0, 0)`, barrel extending
 * seamlessly down-right along `45°` past all desktop and mobile viewport edges).
 */
export const OwnerPhotoPencilSvg = forwardRef<SVGSVGElement, OwnerPhotoPencilSvgProps>(
  function OwnerPhotoPencilSvg(
    { width, height, className = "contract-pencil-cursor__img", style, shadowRef, testId },
    ref,
  ) {
    const uid = `owner-pencil-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
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
        <defs>
          <clipPath id={`${uid}-head-clip`}>
            <polygon points="0,0 600,0 600,210 313,497 0,497" />
          </clipPath>
          <pattern
            id={`${uid}-barrel-pat`}
            patternUnits="userSpaceOnUse"
            x="0"
            y="-140"
            width="96"
            height="255"
          >
            <image width="96" height="255" href={OWNER_PENCIL_BARREL_TILE_DATA_URI} />
          </pattern>
        </defs>
        <g ref={shadowRef} transform="translate(8 12)" opacity="0.15">
          <g transform="translate(405 405) rotate(45)">
            <path
              d="M -566 -12 L -200 -126 L 8000 -126 L 8000 106 L -200 106 Z"
              fill="#3b2a14"
            />
          </g>
        </g>
        <g transform="translate(405 405) rotate(45)">
          <rect
            data-testid="contract-pencil-barrel-extension"
            x="-12"
            y="-140"
            width="8000"
            height="255"
            fill={`url(#${uid}-barrel-pat)`}
          />
        </g>
        <image
          width={PENCIL_TIP_VIEWBOX.width}
          height={PENCIL_TIP_VIEWBOX.height}
          clipPath={`url(#${uid}-head-clip)`}
          href={OWNER_PENCIL_HEAD_DATA_URI}
          data-testid="contract-pencil-photo-head"
        />
      </svg>
    );
  },
);
