/**
 * Preload management for the flip-book.
 * Injects/removes <link rel="preload"> tags for upcoming page images
 * so the browser fetches them before the user flips.
 */

const PRELOAD_PREFIX = "flipbook-preload-";

/** Remove all existing flipbook preload links from <head>. */
function clearPreloads(): void {
  document
    .querySelectorAll(`link[data-flipbook-preload]`)
    .forEach((el) => el.remove());
}

/**
 * Preload images for the given page numbers.
 * Clears any previously injected preloads first.
 */
export function preloadSpread(pageNumbers: number[]): void {
  clearPreloads();
  for (const n of pageNumbers) {
    if (n < 1 || n > 95) continue;
    const id = `${PRELOAD_PREFIX}${n}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "preload";
    link.as = "image";
    link.href = `/art/hd/page-${n}.png`;
    link.setAttribute("data-flipbook-preload", "true");
    document.head.appendChild(link);
  }
}
