export type GretelPoseState = 
  | "idle-1" 
  | "idle-2" 
  | "blink" 
  | "talk-open" 
  | "talk-closed" 
  | "wave" 
  | "point" 
  | "cheer";

/**
 * Manifest of all requested poses for the new HD animation system.
 * Operators will drop these files into public/cartilla/images/gretel/poses/.
 */
export const GRETEL_POSES: Record<GretelPoseState, string> = {
  "idle-1": "/cartilla/images/gretel/poses/idle-1.webp",
  "idle-2": "/cartilla/images/gretel/poses/idle-2.webp",
  "blink": "/cartilla/images/gretel/poses/blink.webp",
  "talk-open": "/cartilla/images/gretel/poses/talk-open.webp",
  "talk-closed": "/cartilla/images/gretel/poses/talk-closed.webp",
  "wave": "/cartilla/images/gretel/poses/wave.webp",
  "point": "/cartilla/images/gretel/poses/point.webp",
  "cheer": "/cartilla/images/gretel/poses/cheer.webp",
};

/**
 * Graceful fallbacks using the pre-existing art in public/cartilla/images/gretel/.
 * This ensures the component never breaks if the poses/ folder is incomplete or empty.
 */
export const GRETEL_FALLBACKS: Record<GretelPoseState, string> = {
  "idle-1": "/cartilla/images/gretel/idle-1.webp",
  "idle-2": "/cartilla/images/gretel/idle-2.webp",
  "blink": "/cartilla/images/gretel/idle-1.webp",
  "talk-open": "/cartilla/images/gretel/happy.webp",
  "talk-closed": "/cartilla/images/gretel/idle-1.webp",
  "wave": "/cartilla/images/gretel/happy.webp",
  "point": "/cartilla/images/gretel/encouraging.webp",
  "cheer": "/cartilla/images/gretel/cheer.webp",
};
