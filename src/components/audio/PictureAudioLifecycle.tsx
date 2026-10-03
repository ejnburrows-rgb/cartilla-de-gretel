import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { installPictureAudio, stopPicturePlayback, type PictureAudioStatus } from '@/lib/picture-audio';

/** Passive vocabulary support: never creates a completion requirement. */
export function PictureAudioLifecycle() {
  const href = useRouterState({ select: state => state.location.href });
  const [message, setMessage] = useState('');
  useEffect(() => installPictureAudio(), []);
  useEffect(() => { stopPicturePlayback(); setMessage(''); return stopPicturePlayback; }, [href]);
  useEffect(() => {
    const update = (event: Event) => {
      const status = (event as CustomEvent<PictureAudioStatus>).detail;
      setMessage(status === 'missing-recording' ? 'El audio de este dibujo aún no está disponible.' : status === 'failed' ? 'No se pudo reproducir la grabación.' : status === 'muted' ? 'El sonido está silenciado.' : '');
    };
    window.addEventListener('cartilla:picture-audio-status', update);
    return () => window.removeEventListener('cartilla:picture-audio-status', update);
  }, []);
  return message ? <p className="picture-audio-status" role="status" aria-live="polite">{message}</p> : null;
}
