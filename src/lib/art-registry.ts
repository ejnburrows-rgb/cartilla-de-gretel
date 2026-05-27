/**
 * src/lib/art-registry.ts
 *
 * Lazy-loaded art component registry for tree-shaking.
 * Each entry maps a picture key to a dynamic import factory
 * so unused illustrations never reach the client bundle.
 */
import type { ComponentType } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type LazyFactory = () => Promise<{ default: ComponentType<any> }>;

const registry = new Map<string, LazyFactory>();

// ── Register lazy loaders ────────────────────────────────────────
registry.set("o-oso", () =>
  import("../components/art/svg/picture-bear").then((m) => ({
    default: m.PictureBear as any,
  })),
);
registry.set("v-vaca", () =>
  import("../components/art/svg/picture-cow").then((m) => ({
    default: m.PictureCow as any,
  })),
);
registry.set("g-gato", () =>
  import("../components/art/svg/picture-cat").then((m) => ({
    default: m.PictureCat as any,
  })),
);
registry.set("p-perro", () =>
  import("../components/art/svg/picture-dog").then((m) => ({
    default: m.PictureDog as any,
  })),
);
registry.set("c-casa", () =>
  import("../components/art/svg/picture-house").then((m) => ({
    default: m.PictureHouse as any,
  })),
);
registry.set("l-luna", () =>
  import("../components/art/svg/picture-moon").then((m) => ({
    default: m.PictureMoon as any,
  })),
);
registry.set("s-sol", () =>
  import("../components/art/svg/picture-sun").then((m) => ({
    default: m.PictureSun as any,
  })),
);
registry.set("p-pera", () =>
  import("../components/art/svg/picture-pear").then((m) => ({
    default: m.PicturePear as any,
  })),
);
registry.set("p-piña", () =>
  import("../components/art/svg/picture-pineapple").then((m) => ({
    default: m.PicturePineapple as any,
  })),
);
registry.set("z-zapato", () =>
  import("../components/art/svg/picture-shoe").then((m) => ({
    default: m.PictureShoe as any,
  })),
);

// ── Public API ───────────────────────────────────────────────────

/**
 * Returns a React.lazy-compatible factory for the given art key,
 * or `undefined` if the key is not registered.
 */
export function getArtComponent(key: string): LazyFactory | undefined {
  return registry.get(key);
}

/** Check whether an art component exists for the given key. */
export function hasArt(key: string): boolean {
  return registry.has(key);
}

/** All registered art keys (useful for preloading / listing). */
export const ART_KEYS = [
  "o-oso",
  "v-vaca",
  "g-gato",
  "p-perro",
  "c-casa",
  "l-luna",
  "s-sol",
  "p-pera",
  "p-piña",
  "z-zapato",
] as const;

export type ArtKey = (typeof ART_KEYS)[number];
