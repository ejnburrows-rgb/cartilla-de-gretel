import { audioEngine } from './audio-engine';
import { approvedPictureRecording, pictureNameKey } from './picture-vocabulary';
import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, type SpeechOwner } from './speech-playback';

export type RecordedSpeechStatus = 'recorded' | 'missing-recording' | 'failed' | 'muted' | 'stopped';
export type RecordedSpeechHandlers = { onStart?: () => void; onEnd?: () => void };
export const RECORDED_SPEECH_STATUS_EVENT = 'cartilla:recorded-speech-status';

export function reportRecordedSpeechStatus(status: RecordedSpeechStatus, key: string, src?: string, source?: 'native-slot'): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(RECORDED_SPEECH_STATUS_EVENT, { detail: { status, key, src, ...(source ? { source } : {}) } }));
}

/** Exact authored vocabulary only. No filename guesses, generated speech or arbitrary provider callbacks. */
export async function playRecordedSpeech(text: string, owner: SpeechOwner, handlers: RecordedSpeechHandlers = {}): Promise<void> {
  if (typeof window === 'undefined' || !text?.trim()) { handlers.onEnd?.(); return; }
  const key = pictureNameKey(text);
  const token = claimSpeech(owner);
  const endWithoutAudio = (status: RecordedSpeechStatus) => {
    releaseSpeech(token);
    reportRecordedSpeechStatus(status, key);
    handlers.onEnd?.();
  };
  // Storage can be denied by browser privacy settings. Never assume unmuted.
  try {
    if (audioEngine.isMuted() || audioEngine.getVolume() <= 0 || localStorage.getItem('cartilla.gretel.voice.muted') === '1') {
      endWithoutAudio('muted'); return;
    }
  } catch { endWithoutAudio('muted'); return; }
  const src = approvedPictureRecording(key);
  if (!src) { endWithoutAudio('missing-recording'); return; }
  return new Promise<void>(resolve => {
    let audio: HTMLAudioElement | undefined;
    let finished = false;
    let started = false;
    const finish = (status: RecordedSpeechStatus = 'stopped') => {
      if (finished) return;
      finished = true;
      if (audio) {
        audio.onplaying = null; audio.onended = null; audio.onerror = null;
        audio.pause(); audio.removeAttribute('src');
      }
      releaseSpeech(token);
      if (started) window.dispatchEvent(new CustomEvent('gretel:speak_stop'));
      if (status !== 'stopped') reportRecordedSpeechStatus(status, key, src);
      handlers.onEnd?.(); resolve();
    };
    registerSpeechCleanup(token, () => finish());
    try {
      audio = new Audio(src);
      audio.volume = Math.max(0, Math.min(1, audioEngine.getVolume()));
      audio.onplaying = () => {
        if (started || finished || !speechIsCurrent(token)) return;
        started = true;
        reportRecordedSpeechStatus('recorded', key, src);
        window.dispatchEvent(new CustomEvent('gretel:speak_start'));
        handlers.onStart?.();
      };
      audio.onended = () => finish();
      audio.onerror = () => finish('missing-recording');
      void audio.play().catch(() => { if (speechIsCurrent(token)) finish('failed'); });
    } catch { finish('failed'); }
  });
}
