import { useEffect, useState } from "react";

/**
 * Fetches /art/hd/page-1.png at runtime, measures its natural dimensions,
 * and returns the aspect ratio for a two-page (spread) container.
 *
 * Returns `null` until the probe image loads.
 * Falls back to 2/1.414 (letter-size portrait × 2) on error.
 */
export function useBookDimensions(): {
  singleAspect: number;
  spreadAspect: number;
} | null {
  const [dims, setDims] = useState<{
    singleAspect: number;
    spreadAspect: number;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/art/hd/page-1.png";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      console.log(`[flipbook] page-1.png natural size: ${w}×${h}`);
      const singleAspect = w / h;
      const spreadAspect = (2 * w) / h;
      setDims({ singleAspect, spreadAspect });
    };
    img.onerror = () => {
      console.warn("[flipbook] Could not probe page-1.png — using fallback ratio");
      const fallbackSingle = 1 / 1.414;
      setDims({ singleAspect: fallbackSingle, spreadAspect: fallbackSingle * 2 });
    };
  }, []);

  return dims;
}
