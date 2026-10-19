import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { instructionRecordings, instructionAudioMuted, playInstruction, stopInstructionAudio } from '@/lib/instruction-audio';

export function EscucharInstruccionButton({ text, className }: { text: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const active = useRef(false);
  useEffect(() => {
    const stop = () => { if (active.current) stopInstructionAudio(); active.current = false; setPlaying(false); };
    const mute = () => { if (instructionAudioMuted()) stop(); };
    const pageTurn = (event: Event) => { if ((event as CustomEvent).detail?.type === 'page-turn:start') stop(); };
    const hidden = () => { if (document.hidden) stop(); };
    window.addEventListener('cartilla:audio-settings', mute);
    window.addEventListener('storage', mute);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', stop);
    window.addEventListener('gretel:bus', pageTurn);
    return () => {
      if (active.current) stopInstructionAudio();
      window.removeEventListener('cartilla:audio-settings', mute);
      window.removeEventListener('storage', mute);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', stop);
      window.removeEventListener('gretel:bus', pageTurn);
    };
  }, [text]);
  if (!instructionRecordings(text).length) return null;
  return <button type="button" onClick={async e => {
    e.preventDefault(); e.stopPropagation();
    if (playing) { stopInstructionAudio(); return; }
    active.current = true; setPlaying(true);
    try { await playInstruction(text); } finally { active.current = false; setPlaying(false); }
  }} className={`inline-flex items-center justify-center p-1.5 rounded-full text-amber-600 hover:bg-amber-100 transition shadow-sm bg-amber-50 border border-amber-200 ${playing ? 'opacity-50' : ''} ${className || ''}`}
    aria-label={`${playing ? 'Detener' : 'Escuchar'} instrucciones: ${text}`} title={playing ? 'Detener instrucciones' : 'Escuchar instrucciones'} aria-pressed={playing}>
    <Volume2 className="w-4 h-4" />
  </button>;
}
