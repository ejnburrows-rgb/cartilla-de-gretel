import { learnerScope, useLearnerScope } from "@/lib/learner-storage";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { ActivityContext } from '@/lib/activity-events';
import { focusGretelActivity, releaseGretelActivity, gretelEvent, onGretelEvent } from '@/lib/gretel-bus';

export function resolveGretelTarget(root: HTMLElement, requestedId?: string): HTMLElement | null {
  if (requestedId) {
    const requested = document.getElementById(requestedId);
    if (requested instanceof HTMLElement && root.contains(requested) && !requested.matches(":disabled")) return requested;
  }
  const explicit = [...root.querySelectorAll<HTMLElement>('[data-gretel-target="primary"]:not(:disabled)')];
  if (explicit.length === 1) return explicit[0]!;
  const correct = [...root.querySelectorAll<HTMLElement>('[data-gretel-correct="true"]:not(:disabled):not([aria-pressed="true"])')];
  return correct[0] ?? null;
}

/** Adds context to existing exercises without replacing their mechanics. */
type Props = { id: string; pageNumber: number; kind: string; children: ReactNode };
export function GretelActivity(props: Props) {
  const scope = useLearnerScope();
  return <LearnerActivity key={scope} {...props} scope={scope} />;
}
function LearnerActivity({ id, pageNumber, kind, children, scope }: Props & { scope: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const attempted = useRef(false);
  const currentEncounter = useRef("");
  const context = useMemo(() => {
    const encounterId = crypto.randomUUID();
    return { activityId: id, pageNumber, kind, encounterId, isCurrent: () => mounted.current && learnerScope() === scope && currentEncounter.current === encounterId };
  }, [id, pageNumber, kind, scope]);
  currentEncounter.current = context.encounterId;
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; releaseGretelActivity(id, context.encounterId); };
  }, [id, context]);
  useEffect(() => {
    const clear = () => {
      ref.current?.querySelectorAll('[data-gretel-highlight]').forEach(el => el.removeAttribute('data-gretel-highlight'));
      ref.current?.querySelectorAll<HTMLButtonElement>('[data-gretel-narrowed]').forEach(el => { el.disabled = false; el.removeAttribute('data-gretel-narrowed'); });
    };
    const off = onGretelEvent((type, detail) => {
      if (type === 'page-turn:start') { clear(); return; }
      if (detail.activityId !== id) return;
      if (type === 'answer:correct' || type === 'answer:wrong') attempted.current = true;
      if (type === 'activity:retry' && detail.reason === 'work-cleared') attempted.current = false;
      if (type === 'guide:reaction') {
        clear();
        if (attempted.current && (detail.reaction === 'hint' || detail.reaction === 'demonstration')) {
          const target = ref.current ? resolveGretelTarget(ref.current, detail.targetId) : null;
          if (target) {
            target.id ||= `${id}-target`;
            target.setAttribute('data-gretel-highlight', detail.reaction);
            gretelEvent('support:delivered', { ...detail, activityId: id, targetId: target.id, text: 'Mira esta opción y comprueba si cumple la consigna.' });
            gretelEvent('task:point', { activityId: id, pageNumber, encounterId: context.encounterId, targetId: target.id });
          }
        }
        if (['cue', 'hint', 'demonstration'].includes(detail.reaction || '') && !ref.current?.querySelector('[data-gretel-highlight]')) {
          const strategies: Record<string, string> = {
            'picture-grid': 'Di el nombre de cada dibujo y escucha el sonido que pide la consigna.',
            'vowel-line-match': 'Di el nombre de cada dibujo y escucha si empieza con la vocal de la consigna.',
            'vowel-match-all': 'Di el nombre de cada dibujo y escucha su vocal inicial antes de unirlo.',
            'vowel-pick-one': 'Di los nombres de los dibujos y escucha con qué vocal empiezan.',
            'syllable-match': 'Lee la sílaba de la consigna. Busca ese sonido dentro de cada palabra.',
            'fill-in-blank': 'Prueba cada sílaba en el espacio y lee la palabra completa.',
            'draw-box': 'Dibuja lo que pide la consigna. Cuando termines, toca Listo.',
            'writing-line': 'Sigue los puntos en orden y continúa el trazo de la letra. Tu escritura se conserva.',
            'writing-response': 'Escribe tu respuesta a la consigna. Cuando termines, toca Listo.',
            'connect': 'Di el nombre del dibujo y escucha el sonido inicial antes de unirlo.',
          };
          const text = strategies[kind];
          if (text) gretelEvent('support:delivered', { ...detail, activityId: id, text });
        }
        // Follow-up removes the cue only. Correct work and completion stay intact.
        if (detail.reaction === 'independent-retry') clear();
      }
    });
    return () => { off(); clear(); };
  }, [id, pageNumber, context]);
  const focus = () => focusGretelActivity({ activityId: id, pageNumber, kind, encounterId: context.encounterId });
  return <div ref={ref} className="gretel-activity" data-gretel-activity={id} onPointerDownCapture={focus} onFocusCapture={focus}>
    <ActivityContext.Provider value={context}><div className="gretel-activity__content">{children}</div></ActivityContext.Provider>
  </div>;
}
