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

export function preloadSpread(srcs: string[]): void {
  clearPreloads();
  let i = 0;
  for (const src of srcs) {
    if (!src) continue;
    i++;
    const id = `${PRELOAD_PREFIX}${i}-${btoa(src).replace(/=/g, '')}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    link.setAttribute("data-flipbook-preload", "true");
    document.head.appendChild(link);
  }
}
