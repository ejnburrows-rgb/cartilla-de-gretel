// generated-art.ts — reads the approved generated scene art manifest.
//
// Generated art is allowed for the splash and app chrome only (AGENTS.md,
// "Generated scene art", owner decision 2026-07-25). The OWNER generates and
// approves each image; this module just resolves what has been approved so a
// screen can use it, and returns null when nothing is approved yet.
//
// Importing the JSON means an unapproved or missing image can never be
// referenced by accident: if there is no manifest entry, callers fall back.
import manifest from "../../public/cartilla/art/generated/manifest.json";

export type GeneratedScene = {
  slug: string;
  /** Which surface this image is approved for. */
  purpose: string;
  /** Public path, e.g. /cartilla/art/generated/welcome-splash.webp */
  src: string;
  /** Optional narrow-screen encoding of the same image, for srcset. */
  srcSmall?: string;
  width?: number;
  height?: number;
  tool?: string;
  createdAt?: string;
  reviewedBy?: string;
  notes?: string;
};

type GeneratedManifest = { scenes?: GeneratedScene[] };

/** Every approved scene in the manifest. */
export function getGeneratedScenes(): GeneratedScene[] {
  return (manifest as GeneratedManifest).scenes ?? [];
}

/**
 * The approved image for a surface, or null when the owner has not supplied
 * one yet. Callers must handle null — the app never ships a broken image.
 */
export function getGeneratedScene(purpose: string): GeneratedScene | null {
  const found = getGeneratedScenes().find((s) => s.purpose === purpose && Boolean(s.src));
  return found ?? null;
}
