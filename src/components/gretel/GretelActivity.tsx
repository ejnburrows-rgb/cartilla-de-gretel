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
  const correct = [...root.querySelectorAll<HTMLElement>('[data-gretel-correct="true"]:not(:disabled)')];
  return correct.length === 1 ? correct[0]! : null;
}

/** Adds context to existing exercises without replacing their mechanics. */
export function GretelActivity({ id, pageNumber, kind, children }: {
  id: string; pageNumber: number; kind: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const currentEncounter = useRef("");
  const context = useMemo(() => {
    const encounterId = crypto.randomUUID();
    return { activityId: id, pageNumber, kind, encounterId, isCurrent: () => mounted.current && currentEncounter.current === encounterId };
  }, [id, pageNumber, kind]);
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
      if (type === 'guide:reaction') {
        clear();
        if (detail.reaction === 'hint' || detail.reaction === 'demonstration') {
          const target = ref.current ? resolveGretelTarget(ref.current, detail.targetId) : null;
          if (target) {
            target.id ||= `${id}-target`;
            target.setAttribute('data-gretel-highlight', detail.reaction);
            gretelEvent('task:point', { activityId: id, pageNumber, encounterId: context.encounterId, targetId: target.id });
          }
        }
        if (detail.reaction === 'demonstration') {
          ref.current?.querySelectorAll<HTMLButtonElement>('button[data-gretel-correct="false"]:not(:disabled)').forEach(el => { el.disabled = true; el.setAttribute('data-gretel-narrowed', 'true'); });
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
