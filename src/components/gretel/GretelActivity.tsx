import { useEffect, useRef, useState, type ReactNode } from 'react';
import { focusGretelActivity, releaseGretelActivity, gretelEvent, onGretelEvent } from '@/lib/gretel-bus';

export function resolveGretelTarget(root: HTMLElement, requestedId?: string): HTMLElement | null {
  if (requestedId) {
    const requested = document.getElementById(requestedId);
    if (requested instanceof HTMLElement && root.contains(requested)) return requested;
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
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => {
      ref.current?.querySelectorAll('[data-gretel-highlight]').forEach(el => el.removeAttribute('data-gretel-highlight'));
      ref.current?.querySelectorAll<HTMLButtonElement>('[data-gretel-narrowed]').forEach(el => { el.disabled = false; el.removeAttribute('data-gretel-narrowed'); });
    };
    const off = onGretelEvent((type, detail) => {
      if (type === 'page-turn:start') { clear(); if (timer) { clearTimeout(timer); timer = undefined; setAttempt(value => value + 1); gretelEvent('activity:retry', { activityId: id }); } return; }
      if (detail.activityId !== id) return;
      if (type === 'guide:reaction') {
        clear();
        if (detail.reaction === 'hint' || detail.reaction === 'demonstration') {
          const target = ref.current ? resolveGretelTarget(ref.current, detail.targetId) : null;
          if (target) {
            target.id ||= `${id}-target`;
            target.setAttribute('data-gretel-highlight', detail.reaction);
            gretelEvent('task:point', { activityId: id, targetId: target.id });
          }
        }
        if (detail.reaction === 'demonstration') {
          ref.current?.querySelectorAll<HTMLButtonElement>('button[data-gretel-correct="false"]:not(:disabled)').forEach(el => { el.disabled = true; el.setAttribute('data-gretel-narrowed', 'true'); });
        }
        if (detail.reaction === 'independent-retry') {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            timer = undefined;
            setAttempt(value => value + 1);
            gretelEvent('activity:retry', { activityId: id });
          }, 1600);
        }
      }
    });
    return () => { off(); clear(); releaseGretelActivity(id); if (timer) clearTimeout(timer); };
  }, [id]);
  const focus = () => focusGretelActivity({ activityId: id, pageNumber, kind });
  return <div ref={ref} className="gretel-activity" data-gretel-activity={id} onPointerDownCapture={focus} onFocusCapture={focus}>
    <div key={attempt} className="gretel-activity__content">{children}</div>
  </div>;
}
