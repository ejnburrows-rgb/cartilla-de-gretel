import { useEffect, useState } from "react";

/**
 * Manifest written by `scripts/build-art-manifest.mjs` (Lane B).
 * Lives at `/cartilla/art/manifest.json` once the art bundle is built.
 */
export type ArtManifest = {
  builtAt?: string;
  cover?: string;
  lessons: Record<string, {
    character?: string;
    pageThumb?: string;
    pages?: string[];
  }>;
};

export type BookArtLessonAssets = {
  character?: string;
  cover?: string;
  pageThumb?: string;
  pages?: string[];
  ready: boolean;
};

const MANIFEST_URL = "/cartilla/art/manifest.json";

let cachedPromise: Promise<ArtManifest | null> | null = null;

function loadManifest(): Promise<ArtManifest | null> {
  if (!cachedPromise) {
    cachedPromise = fetch(MANIFEST_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? (r.json() as Promise<ArtManifest>) : null))
      .catch(() => null);
  }
  return cachedPromise;
}

/**
 * Returns the polished, PDF-extracted art for a lesson.
 * Falls back to an empty object (ready=false) until the manifest is fetched.
 * Safe to call before Lane B has shipped the art bundle.
 */
export function useBookArt(lessonN: number | undefined): BookArtLessonAssets {
  const [manifest, setManifest] = useState<ArtManifest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadManifest().then((m) => {
      if (!mounted) return;
      setManifest(m);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!manifest) return { ready };
  const lesson = lessonN != null ? manifest.lessons?.[String(lessonN)] : undefined;
  return {
    cover: manifest.cover,
    character: lesson?.character,
    pageThumb: lesson?.pageThumb,
    pages: lesson?.pages,
    ready,
  };
}

/**
 * Returns the cover image for the book, if present in the manifest.
 */
export function useBookCover(): { cover?: string; ready: boolean } {
  const { cover, ready } = useBookArt(undefined);
  return { cover, ready };
}
