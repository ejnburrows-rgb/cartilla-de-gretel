import { useId } from "react";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { GRETEL_RIG_CLIPS, GRETEL_RIG_VIEWBOX } from "./gretelRigGeometry";
import "@/styles/gretel-rig.css";

/**
 * Body-language poses of the articulated rig. Every pose is the approved master's
 * own pixels, split into head / body / skirt / legs layers that move independently.
 */
export type GretelRigPose =
  | "idle"
  | "talk"
  | "point"
  | "listen"
  | "help"
  | "nod"
  | "celebrate"
  | "greet";

/** Map the existing state machine onto the rig's poses (the machine still decides WHEN). */
export function rigPoseForState(state: string): GretelRigPose {
  switch (state) {
    case "talking":
      return "talk";
    case "pointing":
    case "teaching":
      return "point";
    case "listening":
      return "listen";
    case "help":
    case "gentle-error":
      return "help";
    case "cheering":
      return "celebrate";
    case "waving":
      return "greet";
    default:
      return "idle";
  }
}

/** Keep the existing host API and state machine; display the approved still intact. */
export function GretelLayerRig({
  state,
  speaking = false,
  onError,
  articulated = false,
  pose,
  direction = "left",
  paused = false,
}: {
  state: string;
  pointingLeft?: boolean;
  speaking?: boolean;
  paused?: boolean;
  onError?: () => void;
  /** Articulated storybook rig (proof pages only). Off = the single approved still. */
  articulated?: boolean;
  /** Explicit pose override (e.g. a short "nod"); defaults to the machine state. */
  pose?: GretelRigPose;
  /** Which side Gretel is pointing / leaning toward. */
  direction?: "left" | "right";
}) {
  const uid = useId().replace(/:/g, "");
  if (!articulated) {
    return <svg viewBox="0 0 1061 1450" role="img" aria-label="Gretel"
      className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_8px_rgba(45,32,20,0.20)]"
      data-gretel-rig="svg" data-gretel-rig-state={state}
      data-gretel-rig-speaking={speaking ? "true" : "false"}>
      <image data-rig-part="head" data-approved-master="true" href={GRETEL_APPROVED_MASTER_SRC}
        x="0" y="0" width="1061" height="1450" preserveAspectRatio="xMidYMid meet" onError={onError} />
    </svg>;
  }

  const { width, height } = GRETEL_RIG_VIEWBOX;
  const activePose = pose ?? rigPoseForState(state);
  const layer = (clip: keyof typeof GRETEL_RIG_CLIPS) => (
    <image
      data-rig-part={clip}
      data-approved-master="true"
      href={GRETEL_APPROVED_MASTER_SRC}
      x="0"
      y="0"
      width={width}
      height={height}
      clipPath={`url(#${uid}-${clip})`}
      onError={onError}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Gretel"
      className="gretel-rig absolute inset-0 h-full w-full overflow-visible"
      data-gretel-rig="articulated"
      data-gretel-rig-state={state}
      data-pose={activePose}
      data-dir={direction}
      data-blink={state === "blinking" ? "true" : "false"}
      data-paused={paused ? "true" : "false"}
      data-gretel-rig-speaking={speaking ? "true" : "false"}
    >
      <defs>
        {(Object.keys(GRETEL_RIG_CLIPS) as Array<keyof typeof GRETEL_RIG_CLIPS>).map((clip) => (
          <clipPath key={clip} id={`${uid}-${clip}`} clipPathUnits="userSpaceOnUse">
            <path d={GRETEL_RIG_CLIPS[clip]} />
          </clipPath>
        ))}
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8c88a" />
          <stop offset="0.45" stopColor="#fdd8a0" />
          <stop offset="1" stopColor="#fde0ac" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(40,52,30,0.34)" />
          <stop offset="1" stopColor="rgba(40,52,30,0)" />
        </radialGradient>
      </defs>
      <ellipse className="gr-shadow" cx="560" cy="1428" rx="300" ry="34" fill={`url(#${uid}-shadow)`} />
      <g className="gr-body">
        <g className="gr-legs">{layer("legs")}</g>
        <g className="gr-skirt">{layer("skirt")}</g>
        <g className="gr-upper">
          {layer("headBack")}
          <g className="gr-head">
            {layer("head")}
            <g className="gr-lids" aria-hidden="true">
              <path d="M503 277 C513 247 570 244 580 279 C569 297 519 299 503 277 Z" fill={`url(#${uid}-lid)`} />
              <path d="M617 281 C626 246 676 246 683 271 C676 293 630 298 617 281 Z" fill={`url(#${uid}-lid)`} />
              <path d="M506 280 Q541 296 577 282" className="gr-lash" />
              <path d="M620 283 Q650 296 680 273" className="gr-lash" />
              <path d="M510 283 l-9 8 M518 287 l-6 9 M674 279 l9 7 M667 284 l6 9" className="gr-lash gr-lash--fine" />
            </g>
          </g>
          {layer("torso")}
        </g>
      </g>
    </svg>
  );
}
