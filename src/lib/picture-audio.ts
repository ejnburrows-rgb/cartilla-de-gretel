import { isGretelVoiceMuted } from "./gretel-voice";
import { approvedPictureRecording, pictureRecordingSlot, resolvePictureName, type VerifiedPictureName } from './picture-vocabulary';
import { reportRecordedSpeechStatus } from './recorded-speech';
import { audioEngine } from './audio-engine';
import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, stopSpeech } from './speech-playback';

export type PictureAudioStatus = 'recorded' | 'missing-recording' | 'muted' | 'unverified' | 'failed' | 'stopped';
const STATUS_EVENT = 'cartilla:picture-audio-status';
function status(value: PictureAudioStatus): PictureAudioStatus {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: value }));
  return value;
}
function isMuted(): boolean {
  try { return audioEngine.isMuted() || audioEngine.getVolume() <= 0 || isGretelVoiceMuted(); }
  catch { return true; }
}
export function stopPicturePlayback(): void { stopSpeech('picture'); }
/** Vocabulary only: no answer, help, grading or progress events. */
export function playPictureName(entry: VerifiedPictureName): PictureAudioStatus {
  if (typeof window === 'undefined') return 'stopped';
  // Callers cannot turn arbitrary text or filenames into verified vocabulary.
  if (!entry.images.some(src => resolvePictureName(src, entry.name)?.key === entry.key)) return status('unverified');
  if (isMuted()) { stopPicturePlayback(); return status('muted'); }
  const recording = approvedPictureRecording(entry.key);
  if (!recording) {
    stopSpeech();
    reportRecordedSpeechStatus('missing-recording', entry.key, pictureRecordingSlot(entry.key)?.src);
    return status('missing-recording');
  }
  const token = claimSpeech('picture');
  if (recording) {
    try {
      const audio = new Audio(recording);
      audio.volume = audioEngine.getVolume();
      const finish = () => { audio.onended = null; audio.onerror = null; audio.pause(); audio.removeAttribute('src'); };
      registerSpeechCleanup(token, finish);
      audio.onended = () => { finish(); releaseSpeech(token); };
      audio.onerror = () => { if (!speechIsCurrent(token)) return; finish(); releaseSpeech(token); status('missing-recording'); };
      void audio.play().catch((err: any) => { if (!speechIsCurrent(token)) return; if (err?.name === 'AbortError') { releaseSpeech(token); return; } finish(); releaseSpeech(token); status('failed'); });
      return status('recorded');
    } catch { releaseSpeech(token); return status('failed'); }
  }
  releaseSpeech(token);
  return status('missing-recording');
}

/** One delegated listener supports image taps and existing button keyboard clicks. */
export function installPictureAudio(): () => void {
  let pointer: { x: number; y: number; moved: boolean } | undefined;
  const down = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY, moved: false }; };
  const move = (event: PointerEvent) => { if (pointer && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true; };
  const click = (event: MouseEvent) => {
    if (event.detail > 0 && pointer?.moved) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('[inert]')) return;
    let picture = target.closest<HTMLElement>('[data-picture-name]');
    if (!picture) {
      const interactive = target.closest('button, [role="button"]');
      const pictures = interactive?.querySelectorAll<HTMLElement>('[data-picture-name]');
      if (pictures?.length === 1) picture = pictures[0]!;
    }
    if (picture?.closest('[aria-hidden="true"]')) return;
    const rawImage = target.closest('img') ?? target.closest('button, [role="button"]')?.querySelector('img');
    if (!picture && rawImage?.closest('[aria-hidden="true"]')) return;
    const entry = picture ? resolvePictureName(picture.dataset.pictureSrc ?? '', picture.dataset.pictureName ?? '') : rawImage ? resolvePictureName(rawImage.getAttribute('src') ?? '', rawImage.getAttribute('alt') ?? '') : null;
    if (entry) { const result = playPictureName(entry); if (picture) { picture.dataset.pictureAudioStatus = result; picture.dataset.pictureAudioSrc = pictureRecordingSlot(entry.key)?.src ?? ''; } }
  };
  const cancel = () => { pointer = undefined; stopPicturePlayback(); };
  const page = (event: Event) => { const type = (event as CustomEvent).detail?.type; if (type === 'page-turn:start') cancel(); };
  const mute = () => { if (isMuted()) stopPicturePlayback(); };
  const hidden = () => { if (document.hidden) cancel(); };
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('pointermove', move, true);
  document.addEventListener('click', click, true);
  document.addEventListener('pointercancel', cancel, true);
  document.addEventListener('visibilitychange', hidden);
  window.addEventListener('gretel:bus', page);
  window.addEventListener('pagehide', cancel);
  window.addEventListener('popstate', cancel);
  window.addEventListener('cartilla:audio-settings', mute);
  window.addEventListener('storage', mute);
  return () => {
    document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointermove', move, true);
    document.removeEventListener('click', click, true); document.removeEventListener('pointercancel', cancel, true);
    document.removeEventListener('visibilitychange', hidden);
    window.removeEventListener('gretel:bus', page); window.removeEventListener('pagehide', cancel); window.removeEventListener('popstate', cancel);
    window.removeEventListener('cartilla:audio-settings', mute); window.removeEventListener('storage', mute); cancel();
  };
}
