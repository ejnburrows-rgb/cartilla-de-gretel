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

/**
 * Reusable SVG interior for the zoomed-in macro pink eraser tip + brushed silver
 * ferrule + seamless photographic yellow hexagonal barrel (`OWNER_PENCIL_BARREL_TILE_DATA_URI`)
 * extending continuously down-right at `45°` with zero edge gap.
 * Contact tip of the pink eraser dome sits at exact `(0, 0)`.
 */
export function OwnerPhotoEraserContent({
  uid,
  shadowRef,
}: {
  uid: string;
  shadowRef?: React.Ref<SVGGElement>;
}) {
  return (
    <>
      <defs>
        <pattern
          id={`${uid}-eraser-barrel-pat`}
          patternUnits="userSpaceOnUse"
          x="0"
          y="-140"
          width="96"
          height="255"
        >
          <image width="96" height="255" href={OWNER_PENCIL_BARREL_TILE_DATA_URI} />
        </pattern>
        <linearGradient id={`${uid}-pink-rubber`} x1="0" y1="-120" x2="0" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f9cbd5" />
          <stop offset="22%" stopColor="#f4a8ba" />
          <stop offset="56%" stopColor="#e47e96" />
          <stop offset="84%" stopColor="#c75974" />
          <stop offset="100%" stopColor="#a7425c" />
        </linearGradient>
        <radialGradient id={`${uid}-pink-dome-highlight`} cx="0.28" cy="0.24" r="0.65">
          <stop offset="0%" stopColor="#fff3f6" stopOpacity="0.62" />
          <stop offset="55%" stopColor="#ffd7e0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e47e96" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-ferrule-metal`} x1="0" y1="-132" x2="0" y2="107" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dfe4ec" />
          <stop offset="16%" stopColor="#ffffff" />
          <stop offset="34%" stopColor="#b8c0cc" />
          <stop offset="52%" stopColor="#eef2f7" />
          <stop offset="74%" stopColor="#858e9c" />
          <stop offset="92%" stopColor="#5c6472" />
          <stop offset="100%" stopColor="#77808f" />
        </linearGradient>
        <linearGradient id={`${uid}-ferrule-ridge`} x1="0" y1="-136" x2="0" y2="111" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eef2f6" />
          <stop offset="25%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#7a8391" />
          <stop offset="100%" stopColor="#4c5360" />
        </linearGradient>
      </defs>

      {/* Soft unified contact shadow under eraser dome, ferrule, and extended barrel */}
      <g ref={shadowRef} transform="translate(8 12)" opacity="0.15">
        <g transform="rotate(45) translate(0 12.5)">
          <path
            d="M 10 -96 Q 60 -128 240 -128 L 8450 -128 L 8450 104 L 240 104 Q 60 104 10 72 Q -4 -12 10 -96 Z"
            fill="#3b2a14"
          />
        </g>
      </g>

      <g className="workbook-pencil__eraser-hd" transform="rotate(45) translate(0 12.5)">
        {/* Seamless photographic yellow hexagonal barrel extending off-screen */}
        <rect
          data-testid="contract-eraser-barrel-extension"
          x="456"
          y="-140"
          width="8000"
          height="255"
          fill={`url(#${uid}-eraser-barrel-pat)`}
        />

        {/* Rounded pink rubber eraser dome — leading contact edge at exact (0, -12.5) -> (0, 0) */}
        <path
          data-testid="contract-eraser-pink-dome"
          d="M 244 -116 L 86 -116 C 30 -116 0 -70 0 -12.5 C 0 45 30 91 86 91 L 244 91 Z"
          fill={`url(#${uid}-pink-rubber)`}
          stroke="#9c3f57"
          strokeWidth="3"
        />
        <ellipse
          cx="104"
          cy="-54"
          rx="74"
          ry="34"
          fill={`url(#${uid}-pink-dome-highlight)`}
        />
        {/* Subtle worn-rubber contact edge highlight */}
        <path
          d="M 20 -54 C 10 -34 10 8 20 28"
          fill="none"
          stroke="#fff2f5"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Brushed silver metallic ferrule joining eraser to photographic yellow barrel */}
        <rect
          data-testid="contract-eraser-ferrule"
          x="234"
          y="-132"
          width="230"
          height="239"
          rx="10"
          fill={`url(#${uid}-ferrule-metal)`}
          stroke="#59616e"
          strokeWidth="3"
        />
        {/* Raised crimped bands */}
        <rect x="274" y="-135" width="22" height="245" rx="6" fill={`url(#${uid}-ferrule-ridge)`} stroke="#626a78" strokeWidth="2" />
        <rect x="306" y="-135" width="22" height="245" rx="6" fill={`url(#${uid}-ferrule-ridge)`} stroke="#626a78" strokeWidth="2" />
        <rect x="372" y="-135" width="22" height="245" rx="6" fill={`url(#${uid}-ferrule-ridge)`} stroke="#626a78" strokeWidth="2" />
        <rect x="404" y="-135" width="22" height="245" rx="6" fill={`url(#${uid}-ferrule-ridge)`} stroke="#626a78" strokeWidth="2" />
        {/* Crimp dimples along barrel collar */}
        {[-88, -38, 12, 62].map((cy) => (
          <ellipse
            key={cy}
            cx="444"
            cy={cy}
            rx="6"
            ry="11"
            fill="#565e6b"
            opacity="0.55"
          />
        ))}
        {/* Soft cast shadow from ferrule lip onto yellow barrel */}
        <rect x="464" y="-132" width="16" height="239" fill="#3b2a14" opacity="0.16" />
      </g>
    </>
  );
}

/**
 * Macro close-up rotated eraser end of the exact `@image1` photographic pencil:
 * same `600×497` viewBox, same `252×209` / `168×139` scale, same `45°` down-right
 * photographic barrel extending off the viewport edges with zero gap.
 */
export const OwnerPhotoEraserSvg = forwardRef<SVGSVGElement, OwnerPhotoPencilSvgProps>(
  function OwnerPhotoEraserSvg(
    { width, height, className = "contract-pencil-cursor__img workbook-pencil__eraser-hd", style, shadowRef, testId },
    ref,
  ) {
    const uid = `owner-eraser-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
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
        <OwnerPhotoEraserContent uid={uid} shadowRef={shadowRef} />
      </svg>
    );
  },
);
