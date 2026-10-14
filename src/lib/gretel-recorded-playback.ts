import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent } from "./speech-playback";
/** Plays bundled MP3s only. No cloud inference or per-play billing. */
export async function playGretelRecordingQueue(urls: readonly string[]): Promise<void> {
  if (typeof window === "undefined" || !urls.length) return;
  const token = claimSpeech("gretel");
  return new Promise(resolve => {
    let current: HTMLAudioElement | undefined;
    let nextIndex = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (current) {
        current.onended = null;
        current.onerror = null;
        current.pause();
        current.removeAttribute("src");
      }
      if (speechIsCurrent(token)) releaseSpeech(token);
      window.dispatchEvent(new CustomEvent("gretel:speak_stop"));
      resolve();
    };
    registerSpeechCleanup(token, finish);
    window.dispatchEvent(new CustomEvent("gretel:speak_start"));
    const next = () => {
      if (!speechIsCurrent(token) || nextIndex >= urls.length) { finish(); return; }
      current = new Audio(urls[nextIndex++]!);
      current.onended = next;
      current.onerror = finish;
      void current.play().catch(finish);
    };
    next();
  });
}
