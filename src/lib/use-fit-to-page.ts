import { useEffect, type RefObject } from "react";

/** Smallest content scale used before a page would become hard to read. */
const MIN_FIT = 0.6;

/**
 * Fit-to-screen lessons (owner direction 2026-10-12): a page never scrolls
 * and never cuts content off. Activities that can grow already share the
 * page height through CSS; for text-heavy pages whose content is still
 * taller than the page, this scales the page content down just enough to
 * fit (CSS `--lc-fit`, used as `zoom` by lesson-fit.css).
 *
 * Only active inside `.lc-lesson-shell--fit`, so other viewers are untouched.
 */
export function useFitToPage(rootRef: RefObject<HTMLElement | null>, key: unknown) {
  useEffect(() => {
    const found = rootRef.current;
    if (!found || !found.closest(".lc-lesson-shell--fit")) return;
    const root: HTMLElement = found;
    if (typeof ResizeObserver === "undefined") return;

    const fits = (body: HTMLElement) => body.scrollHeight <= body.clientHeight + 1;
    const fitBody = (body: HTMLElement) => {
      body.style.setProperty("--lc-fit", "1");
      body.removeAttribute("data-lc-fit-overflow");
      if (fits(body)) return;
      let lo = MIN_FIT;
      let hi = 1;
      for (let i = 0; i < 7; i += 1) {
        const mid = (lo + hi) / 2;
        body.style.setProperty("--lc-fit", String(mid));
        if (fits(body)) lo = mid;
        else hi = mid;
      }
      body.style.setProperty("--lc-fit", String(Math.floor(lo * 100) / 100));
      // Even the smallest readable size is too tall (a phone with several
      // drawing boxes): the page grows at full size and the screen scrolls,
      // rather than hiding any of the child's work or shrinking the words
      // and tracing letters too small for a child (lesson-fit.css).
      if (!fits(body)) {
        body.style.setProperty("--lc-fit", "1");
        body.setAttribute("data-lc-fit-overflow", "true");
      }
    };

    let frame = 0;
    const observed = new Set<Element>();
    const ro = new ResizeObserver(() => schedule());
    const observeAll = () => {
      root.querySelectorAll<HTMLElement>(".faithful-page__body, .faithful-page__body > .gretel-activity").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        ro.observe(el);
      });
    };
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        observeAll();
        root.querySelectorAll<HTMLElement>(".faithful-page__body").forEach(fitBody);
      });
    }

    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true });
    root.addEventListener("load", schedule, true);
    void document.fonts?.ready.then(schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      root.removeEventListener("load", schedule, true);
    };
  }, [rootRef, key]);
}
