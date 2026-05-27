/**
 * src/components/art/svg/index.ts
 * Barrel export for all inline SVG art components.
 */

// ── Gretel poses ──────────────────────────────────────────────────
export { GretelIdle } from "./gretel-idle";
export { GretelHappy } from "./gretel-happy";
export { GretelCheer } from "./gretel-cheer";
export { GretelThinking } from "./gretel-thinking";
export { GretelEncouraging } from "./gretel-encouraging";

// ── Mouth diagrams ────────────────────────────────────────────────
export { MouthAlveolar } from "./mouth-alveolar";
export { MouthBilabial } from "./mouth-bilabial";
export { MouthVelar } from "./mouth-velar";
export { MouthFricative } from "./mouth-fricative";
export { MouthTrill } from "./mouth-trill";

// ── Picture scenes ────────────────────────────────────────────────
export { PictureBear } from "./picture-bear";
export { PictureCow } from "./picture-cow";
export { PictureCat } from "./picture-cat";
export { PictureDog } from "./picture-dog";
export { PictureHouse } from "./picture-house";
export { PictureMoon } from "./picture-moon";
export { PictureSun } from "./picture-sun";
export { PicturePear } from "./picture-pear";
export { PicturePineapple } from "./picture-pineapple";
export { PictureShoe } from "./picture-shoe";

// ── Picture registry map ──────────────────────────────────────────
import type { ComponentType } from "react";
import { PictureBear } from "./picture-bear";
import { PictureCow } from "./picture-cow";
import { PictureCat } from "./picture-cat";
import { PictureDog } from "./picture-dog";
import { PictureHouse } from "./picture-house";
import { PictureMoon } from "./picture-moon";
import { PictureSun } from "./picture-sun";
import { PicturePear } from "./picture-pear";
import { PicturePineapple } from "./picture-pineapple";
import { PictureShoe } from "./picture-shoe";

/**
 * Maps picture keys (format: "letter-word") to their SVG component.
 * Used by PictureScene and art-registry for lookup.
 */
export const PICTURE_REGISTRY: Record<string, ComponentType<{ animated?: boolean; className?: string; style?: React.CSSProperties }>> = {
  "o-oso": PictureBear,
  "v-vaca": PictureCow,
  "g-gato": PictureCat,
  "p-perro": PictureDog,
  "c-casa": PictureHouse,
  "l-luna": PictureMoon,
  "s-sol": PictureSun,
  "p-pera": PicturePear,
  "p-piña": PicturePineapple,
  "z-zapato": PictureShoe,
};
