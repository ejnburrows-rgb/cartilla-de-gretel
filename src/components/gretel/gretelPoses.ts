import type { GretelState } from "./gretelMachine";

/**
 * Full Gretel pose library — owner-supplied art under
 * public/cartilla/images/gretel/poses/. Every usable file is mapped to a
 * product moment. Empty/stub/wrong-canvas assets are listed but not wired.
 *
 * Identity lock: Gretel — blonde, red bow, blue jumper, orange-stripe shirt, no freckles.
 */

const P = "/cartilla/images/gretel/poses";

/** Canonical pose keys used by presence + live avatar. */
export type GretelPoseKey =
  | GretelState
  | "settling"
  | "exiting"
  | "pointingLeft"
  | "encouraging" // gentle miss / try-again (settle art)
  | "welcome"; // wave family for home / lesson open

/**
 * Pose paths. Multi-frame arrays cycle for smoother animation.
 * FRAME-REQUESTS: G-01 closed-idle, G-02 settle, G-03 wave-exit, G-04 point-left.
 */
export const GRETEL_POSES: Record<GretelPoseKey, string | string[]> = {
  boot: `${P}/gretel-idle.webp`,
  /**
   * Living idle — soft multi-frame cycle from the full library (not a
   * 3-file slideshow). Combined with CSS breath + blink overlay in
   * GretelPresence. Frames are near-rest poses so motion stays natural.
   */
  idle: [
    `${P}/gretel-idle.webp`,
    `${P}/gretel-talk-0.webp`,
    `${P}/gretel-settle.webp`,
    `${P}/gretel-talk.webp`,
  ],
  /** True closed-eye matching idle canvas (666×1000). */
  blinking: `${P}/gretel-closed-idle.webp`,
  /** Enter-scene settle / land / think. */
  settling: `${P}/gretel-settle.webp`,
  /** Gentle miss / try-again — settle is sympathetic, not angry. */
  encouraging: `${P}/gretel-settle.webp`,
  /** Lesson exit / goodbye. */
  exiting: `${P}/gretel-wave-exit.webp`,
  /** Home + lesson welcome. */
  welcome: [`${P}/gretel-wave.webp`, `${P}/gretel-wave-1.webp`, `${P}/gretel-wave-2.webp`],
  waving: [`${P}/gretel-wave.webp`, `${P}/gretel-wave-1.webp`, `${P}/gretel-wave-2.webp`],
  pointing: `${P}/gretel-point.webp`,
  /** Mirror point for right-side bubble / exercise on right. */
  pointingLeft: [`${P}/gretel-point-left.webp`, `${P}/gretel-point-left-flip.webp`],
  cheering: [`${P}/gretel-cheer.webp`, `${P}/gretel-cheer-1.webp`],
  /**
   * Talk cycle: talk-0 is idle-identical base; talk-1/2 + talk.webp add mouth
   * openness. Cycle all for richer speech while TTS runs.
   */
  talking: [
    `${P}/gretel-talk-0.webp`,
    `${P}/gretel-talk-1.webp`,
    `${P}/gretel-talk-2.webp`,
    `${P}/gretel-talk.webp`,
  ],
  error: `${P}/gretel-idle.webp`,
};

/** Explicit inventory for tests / PR table (every file under poses/ + heroes). */
export type GretelAssetRow = {
  path: string;
  pose: string;
  usable: boolean;
  wired: boolean;
  notes: string;
};

export const GRETEL_ASSET_INVENTORY: GretelAssetRow[] = [
  {
    path: `${P}/gretel-idle.webp`,
    pose: "idle",
    usable: true,
    wired: true,
    notes: "Living base; continuous breath",
  },
  {
    path: `${P}/gretel-closed-idle.webp`,
    pose: "blink / closed-eye idle (G-01)",
    usable: true,
    wired: true,
    notes: "Blink layer; matches idle canvas",
  },
  {
    path: `${P}/gretel-blink.webp`,
    pose: "blink (legacy)",
    usable: false,
    wired: false,
    notes: "REJECTED — wrong canvas 1024² vs idle 666×1000",
  },
  {
    path: `${P}/gretel-settle.webp`,
    pose: "settle / think / miss (G-02)",
    usable: true,
    wired: true,
    notes: "Enter settle + encouraging miss",
  },
  {
    path: `${P}/gretel-wave.webp`,
    pose: "wave-0",
    usable: true,
    wired: true,
    notes: "Welcome / wave cycle",
  },
  {
    path: `${P}/gretel-wave-1.webp`,
    pose: "wave-1",
    usable: true,
    wired: true,
    notes: "Welcome / wave cycle",
  },
  {
    path: `${P}/gretel-wave-2.webp`,
    pose: "wave-2",
    usable: true,
    wired: true,
    notes: "Welcome / wave cycle",
  },
  {
    path: `${P}/gretel-wave-exit.webp`,
    pose: "exit wave (G-03)",
    usable: true,
    wired: true,
    notes: "Lesson leave goodbye",
  },
  {
    path: `${P}/gretel-point.webp`,
    pose: "point right",
    usable: true,
    wired: true,
    notes: "Hint / exercise point",
  },
  {
    path: `${P}/gretel-point-left.webp`,
    pose: "point left (G-04)",
    usable: true,
    wired: true,
    notes: "Point when content is on the right",
  },
  {
    path: `${P}/gretel-point-left-flip.webp`,
    pose: "point left alt",
    usable: true,
    wired: true,
    notes: "Second frame in pointingLeft cycle",
  },
  {
    path: `${P}/gretel-cheer.webp`,
    pose: "cheer-0",
    usable: true,
    wired: true,
    notes: "Success / celebrate",
  },
  {
    path: `${P}/gretel-cheer-1.webp`,
    pose: "cheer-1",
    usable: true,
    wired: true,
    notes: "Success / celebrate",
  },
  {
    path: `${P}/gretel-talk-0.webp`,
    pose: "talk-0",
    usable: true,
    wired: true,
    notes: "Talk cycle (near-idle mouth closed)",
  },
  {
    path: `${P}/gretel-talk-1.webp`,
    pose: "talk-1",
    usable: true,
    wired: true,
    notes: "Talk cycle open mouth",
  },
  {
    path: `${P}/gretel-talk-2.webp`,
    pose: "talk-2",
    usable: true,
    wired: true,
    notes: "Talk cycle mid mouth",
  },
  {
    path: `${P}/gretel-talk.webp`,
    pose: "talk base",
    usable: true,
    wired: true,
    notes: "Talk cycle extra frame",
  },
  {
    path: "/cartilla/images/gretel/gretel-original.png",
    pose: "source reference",
    usable: false,
    wired: false,
    notes: "Unused — source/reference PNG, not a product pose frame",
  },
  {
    path: "/art/hd/gretel-authentic.jpg",
    pose: "home garden scene",
    usable: true,
    wired: true,
    notes: "Home book-plate scene background",
  },
];

export const GRETEL_ORIGINAL_ARTWORK = `${P}/gretel-idle.webp`;

/** Every usable pose path currently wired into GRETEL_POSES. */
export function allWiredPosePaths(): string[] {
  const out = new Set<string>();
  for (const v of Object.values(GRETEL_POSES)) {
    if (Array.isArray(v)) v.forEach((p) => out.add(p));
    else out.add(v);
  }
  return [...out];
}

export function getGretelPoseFrames(state: GretelPoseKey): string | string[] {
  return GRETEL_POSES[state] ?? GRETEL_POSES.idle;
}

export function getGretelPose(state: GretelPoseKey): string {
  const pose = GRETEL_POSES[state] ?? GRETEL_POSES.idle;
  return Array.isArray(pose) ? pose[0] : pose;
}

/** Frame interval (ms) for multi-frame pose families. */
export function poseFrameMs(state: GretelPoseKey): number {
  switch (state) {
    case "talking":
      return 120;
    case "waving":
    case "welcome":
      return 220;
    case "cheering":
      return 160;
    case "pointingLeft":
      return 400;
    case "idle":
      // Slow soft dwell so idle multi-frame reads as life, not a flipbook
      return 2800;
    default:
      return 180;
  }
}

/**
 * Map product bus moments → pose family.
 * Used by GretelPresence (primary lesson host).
 */
export function poseForBusEvent(type: string): GretelPoseKey | null {
  switch (type) {
    case "lesson:start":
    case "mount":
      return "welcome";
    case "answer:correct":
    case "activity:complete":
    case "lesson:complete":
      return "cheering";
    case "answer:wrong":
      return "encouraging";
    case "hint:show":
      return "pointing";
    case "hint:hide":
      return "idle";
    case "page-flip":
      return "settling";
    case "talk:start":
      return "talking";
    case "talk:stop":
      return "idle";
    default:
      return null;
  }
}
