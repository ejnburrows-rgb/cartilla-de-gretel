import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent } from "./speech-playback";

/** Stitch complete owner-recorded MP3 phrases into a single interruptible speech turn.
 * 160 ms silence between phrases avoids abrupt word/phrase collisions. No synthesis.
 * Playback, pause timers, and cleanup share one speech token.
 */
export async function playGretelRecordingQueue(
  urls: readonly string[],
  options: { gapMs?: number } = {},
): Promise<void> {
  if (typeof window === "undefined" || !urls.length) return;
  const gapMs = Number.isFinite(options.gapMs) ? Math.max(0, Math.min(2000, options.gapMs!)) : 160;
  const token = claimSpeech("gretel");

  return new Promise(resolve => {
    let current: HTMLAudioElement | undefined;
    let pauseTimer: ReturnType<typeof setTimeout> | undefined;
    let nextIndex = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (pauseTimer !== undefined) {
        clearTimeout(pauseTimer);
        pauseTimer = undefined;
      }
      if (current) {
        current.onended = null;
        current.onerror = null;
        current.pause();
        current.removeAttribute("src");
        current = undefined;
      }
      if (speechIsCurrent(token)) releaseSpeech(token);
      window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
      resolve();
    };
    registerSpeechCleanup(token, finish);
    window.dispatchEvent(new CustomEvent("gretel:speak_start"));

    const next = () => {
      pauseTimer = undefined;
      if (finished || !speechIsCurrent(token) || nextIndex >= urls.length) {
        finish();
        return;
      }
      current = new Audio(urls[nextIndex++]!);
      current.onended = () => {
        if (!speechIsCurrent(token) || finished) {
          finish();
          return;
        }
        if (nextIndex < urls.length && gapMs > 0) {
          current = undefined;
          pauseTimer = setTimeout(next, gapMs);
        } else {
          next();
        }
      };
      current.onerror = finish;
      void current.play().catch(finish);
    };
    next();
  });
}
