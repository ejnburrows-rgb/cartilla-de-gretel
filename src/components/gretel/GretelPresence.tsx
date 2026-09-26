/** Page-aware host, using the existing pose reducer, assets and event bus. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cancelGretelSpeech, isGretelVoiceMuted, setGretelVoiceMuted, type IntroCatalogSlice } from '@/lib/gretel-voice';
import { gretelEvent, onGretelEvent, type GretelBusDetail } from '@/lib/gretel-bus';
import { GretelLiveAvatar, type GretelLiveAvatarRef } from './GretelLiveAvatar';
import { advanceLearning, freshLearningState, REACTION_TEXT, type LearningState, type LearningInput } from './gretelLearning';

export type GretelPresenceProps = {
  lesson?: IntroCatalogSlice; instruction?: string | null; className?: string;
  autoIntro?: boolean; variant?: 'lesson' | 'home'; hideChrome?: boolean; bookMode?: boolean;
};
export function GretelPresence({ lesson, instruction, className = '', autoIntro = true, variant = 'lesson', hideChrome = false, bookMode = false }: GretelPresenceProps) {
  const [entered, setEntered] = useState(!bookMode);
  const [muted, setMuted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [context, setContext] = useState<GretelBusDetail>({});
  const [reaction, setReaction] = useState('idle');
  const avatarRef = useRef<GretelLiveAvatarRef>(null);
  const learning = useRef(new Map<string, LearningState>());
  const seen = useRef(new Set<string>());
  const active = useRef<GretelBusDetail>({});
  const ready = useRef(!bookMode);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSpeech = useRef({ text: '', at: 0 });
  const lastActivity = useRef(Date.now());
  const nudged = useRef(false);

  const say = useCallback((text: string, delay = 0) => {
    if (!text.trim() || !ready.current) return;
    if (text === lastSpeech.current.text && Date.now() - lastSpeech.current.at < 7000) return;
    clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => {
      if (!ready.current) return;
      lastSpeech.current = { text, at: Date.now() };
      void avatarRef.current?.speakMessage(text);
    }, delay);
  }, []);

  useEffect(() => {
    setMuted(isGretelVoiceMuted());
    if (!bookMode && autoIntro) say(variant === 'home' ? '¡Hola! Soy Gretel. Vamos a aprender juntos.' : instruction || 'Estoy aquí para ayudarte.', 400);
    const off = onGretelEvent((type, detail) => {
      if (type === 'page-turn:start') {
        ready.current = false; setEntered(false); setFocused(true); setReaction('hidden');
        clearTimeout(speechTimer.current); cancelGretelSpeech(); avatarRef.current?.cancel();
        return;
      }
      if (type === 'page:revealed') {
        ready.current = true; setEntered(true); setFocused(false); setReaction('idle');
        active.current = { pageNumber: detail.pageNumber }; setContext(active.current);
        lastActivity.current = Date.now(); nudged.current = false;
        const key = `${detail.pageNumber}:${detail.text || ''}`;
        if ((autoIntro || detail.text) && !seen.current.has(key)) { seen.current.add(key); say(detail.text || instruction || 'Vamos a explorar esta página.', 220); }
        return;
      }
      if (type === 'task:point' && detail.targetId) { active.current = { ...active.current, targetId: detail.targetId }; setContext(active.current); return; }
      if (type === 'activity:focus') {
        active.current = detail; setContext(detail); setFocused(true);
        lastActivity.current = Date.now();
        clearTimeout(focusTimer.current);
        focusTimer.current = setTimeout(() => setFocused(false), 8000);
        return;
      }
      if ((!ready.current && type !== 'activity:retry') || variant === 'home') return;
      const inputs: Record<string, LearningInput> = { 'answer:wrong': 'wrong', 'hint:show': 'hint', 'answer:correct': 'correct', 'activity:complete': 'complete', 'lesson:complete': 'complete', 'activity:retry': 'retry' };
      const input = inputs[type];
      if (!input) return;
      const id = detail.activityId || active.current.activityId || `page-${active.current.pageNumber ?? 'current'}`;
      const result = advanceLearning(learning.current.get(id) || freshLearningState(), input);
      learning.current.set(id, result.state);
      if (!result.reaction) return;
      setFocused(false); setReaction(result.reaction); lastActivity.current = Date.now();
      gretelEvent('guide:reaction', { ...active.current, ...detail, activityId: id, reaction: result.reaction });
      // Completion immediately follows a correct answer; one sentence is enough.
      say(REACTION_TEXT[result.reaction], 80);
    });
    const idleTimer = setInterval(() => {
      if (!ready.current || nudged.current || document.hidden || !active.current.activityId) return;
      if (Date.now() - lastActivity.current >= 45000) {
        nudged.current = true; setFocused(false); setReaction('inactivity');
        say('Si necesitas una pista, toca Ayuda.');
      }
    }, 5000);
    return () => { off(); clearInterval(idleTimer); clearTimeout(speechTimer.current); clearTimeout(focusTimer.current); cancelGretelSpeech(); };
  }, [autoIntro, bookMode, instruction, say, variant]);

  const toggleMute = () => { const next = !muted; setMuted(next); setGretelVoiceMuted(next); if (next) cancelGretelSpeech(); };
  return <aside className={['gretel-presence', entered ? 'gretel-presence--in' : '', variant === 'home' ? 'gretel-presence--home' : '', bookMode ? 'gretel-presence--book' : '', className].filter(Boolean).join(' ')}
    aria-label="Gretel, la guía de la cartilla" aria-hidden={!entered} inert={!entered}
    data-testid={variant === 'home' ? 'book-hero-gretel' : 'gretel-presence'} data-sticker="false" data-gretel-system="presence" data-variant={variant}
    data-placement={bookMode ? 'book' : 'standalone'} data-page-ready={String(entered)} data-page-number={context.pageNumber} data-activity-id={context.activityId} data-target-id={context.targetId} data-reaction={reaction} data-focused={String(focused)}>
    <GretelLiveAvatar ref={avatarRef} size={variant === 'home' ? 'md' : 'sm'} bubblePosition={bookMode ? 'right' : 'top'} paused={focused || !entered} managed />
    {bookMode && context.activityId && entered && <button className="gretel-presence__help" onClick={() => gretelEvent('hint:show', active.current)}>Ayuda</button>}
    {!hideChrome && <div className="gretel-presence__chrome"><p className="gretel-presence__name">Gretel</p><button type="button" onClick={toggleMute} className="gretel-presence__mute" aria-pressed={muted} aria-label={muted ? 'Activar voz de Gretel' : 'Silenciar voz de Gretel'}>{muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}<span>{muted ? 'Sin voz' : 'Con voz'}</span></button></div>}
  </aside>;
}
