const RELOAD_KEY = "cartilla:preload-reload-at";
const RELOAD_WINDOW_MS = 60_000;

/**
 * After a release, a tab still running the previous build asks for code files
 * that no longer exist. Reload once to pick up the new build instead of leaving
 * a blank screen; a second failure within a minute falls through to the error page.
 */
export function shouldReloadAfterPreloadError(getStorage: () => Storage, now = Date.now()): boolean {
  try {
    // Reading window.sessionStorage itself throws when storage is blocked.
    const storage = getStorage();
    const last = Number(storage.getItem(RELOAD_KEY) ?? 0);
    if (now - last < RELOAD_WINDOW_MS) return false;
    storage.setItem(RELOAD_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

export function installPreloadRecovery(win: Window = window): void {
  win.addEventListener("vite:preloadError", (event) => {
    if (!shouldReloadAfterPreloadError(() => win.sessionStorage)) return;
    event.preventDefault();
    win.location.reload();
  });
}
