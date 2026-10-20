import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { RECORDED_SPEECH_STATUS_EVENT, type RecordedSpeechStatus } from '@/lib/recorded-speech';
import { stopSpeech } from '@/lib/speech-playback';
import { installPictureAudio, type PictureAudioStatus } from '@/lib/picture-audio';

/** Passive vocabulary support: never creates a completion requirement. */
export function PictureAudioLifecycle() {
  const href = useRouterState({ select: state => state.location.href });
  const [message, setMessage] = useState('');
  useEffect(() => installPictureAudio(), []);
  useEffect(() => { stopSpeech(); setMessage(''); return stopSpeech; }, [href]);
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<PictureAudioStatus | { status: RecordedSpeechStatus; source?: string }>).detail;
      if (typeof detail !== 'string' && (detail.source === 'game' || detail.source === 'native-slot')) return;
      const status = typeof detail === 'string' ? detail : detail.status;
      setMessage(status === 'missing-recording' ? 'Grabación pendiente.' : status === 'failed' ? 'No se pudo reproducir la grabación.' : status === 'muted' ? 'El sonido está silenciado.' : '');
    };
    window.addEventListener('cartilla:picture-audio-status', update);
    window.addEventListener(RECORDED_SPEECH_STATUS_EVENT, update);
    return () => { window.removeEventListener('cartilla:picture-audio-status', update); window.removeEventListener(RECORDED_SPEECH_STATUS_EVENT, update); };
  }, []);
  return message ? <p className="picture-audio-status" role="status" aria-live="polite">{message}</p> : null;
}
