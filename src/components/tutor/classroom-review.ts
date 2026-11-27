// The first frame of the approved recording's Rhubarb sequence in the edited film.
export const CLASSROOM_SPEECH_START = 616 / 24;

/** Wait for the physical board action. Media failure falls back to the usual word model. */
export function playBoardAction(video: HTMLVideoElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timeout);
      video.pause();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("error", finish);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const onTime = () => {
      if (video.currentTime >= CLASSROOM_SPEECH_START) finish();
    };
    const timeout = window.setTimeout(finish, 35000);
    signal.addEventListener("abort", finish, { once: true });
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("error", finish, { once: true });
    video.currentTime = 0;
    void video.play().catch(finish);
  });
}
