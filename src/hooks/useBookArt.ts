/**
 * useBookArt.ts  (Lane A fallback stub — Lane C owns the real hook)
 *
 * If Lane C has already shipped this file from @/hooks/useBookArt, the real
 * version will be used instead. This file is only used when that hook is
 * missing at first clone.
 *
 * ArtManifest shape: { cover: string; lessons: Record<number,
 *   { character?: string; pageThumb?: string; pages?: string[] }> }
 */
import { useEffect, useState } from "react";

export type ArtManifest = {
  builtAt?: string;
  cover: string;
  lessons: Record<
    string,
    { character?: string; pageThumb?: string; pages?: string[] }
  >;
};

const MANIFEST_URL = "/cartilla/art/manifest.json";

let _cache: ArtManifest | null = null;
let _isFetching = false;
const listeners = new Set<(m: ArtManifest | null) => void>();

function notify(m: ArtManifest | null) {
  for (const cb of listeners) {
    cb(m);
  }
}

function fetchManifestBackground() {
  if (_isFetching) return;
  _isFetching = true;
  fetch(MANIFEST_URL)
    .then((r) => {
      if (!r.ok) throw new Error("Network response was not ok");
      return r.json() as Promise<ArtManifest>;
    })
    .then((m) => {
      _isFetching = false;
      const changed = !_cache || JSON.stringify(_cache) !== JSON.stringify(m);
      if (changed) {
        _cache = m;
        notify(m);
      }
    })
    .catch(() => {
      _isFetching = false;
    });
}

export type BookArtResult = {
  character?: string;
  cover?: string;
  pageThumb?: string;
  pages?: string[];
  loading: boolean;
};

export function useBookArt(lessonN: number): BookArtResult {
  const [manifest, setManifest] = useState<ArtManifest | null>(_cache);

  useEffect(() => {
    const handleUpdate = (m: ArtManifest | null) => {
      setManifest(m);
    };
    listeners.add(handleUpdate);
    fetchManifestBackground();
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const loading = !manifest;

  if (!manifest) return { loading };

  const entry = manifest.lessons[String(lessonN)];
  return {
    character: entry?.character,
    cover: manifest.cover,
    pageThumb: entry?.pageThumb,
    pages: entry?.pages,
    loading,
  };
}

/** Non-hook version for static use (e.g. lesson grid) */
export function getManifestSync(): ArtManifest | null {
  return _cache;
}

