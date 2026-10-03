import { describe, expect, it, vi } from "vitest";
import { gretelEvent, onGretelEvent } from "../gretel-bus";

describe("gretel bus detail", () => {
  it("delivers the page guidance text with page:revealed", () => {
    const handler = vi.fn();
    const off = onGretelEvent(handler);
    gretelEvent("page:revealed", { text: "Lee estas palabras.", pageNumber: 8 });
    expect(handler).toHaveBeenCalledWith(
      "page:revealed",
      expect.objectContaining({ text: "Lee estas palabras.", pageNumber: 8 }),
    );
    off();
  });
});

it('explicit activity identity does not inherit another activity page or encounter', async () => {
  const { focusGretelActivity } = await import('../gretel-bus');
  const handler = vi.fn(); const off = onGretelEvent(handler);
  focusGretelActivity({ activityId: 'B', pageNumber: 26, encounterId: 'B-run' });
  gretelEvent('activity:complete', { activityId: 'A', pageNumber: 24, encounterId: 'A-run' });
  expect(handler).toHaveBeenLastCalledWith('activity:complete', expect.objectContaining({ activityId: 'A', pageNumber: 24, encounterId: 'A-run' }));
  off();
});

it('retry invitation is not assistance, delivered help belongs to its source, and clearing only resets that source', async () => {
  const { focusGretelActivity, isGretelAssistedAttempt } = await import('../gretel-bus');
  localStorage.clear();
  focusGretelActivity({ activityId: 'B' });
  gretelEvent('guide:reaction', { activityId: 'A', reaction: 'independent-retry' });
  expect(isGretelAssistedAttempt('A')).toBe(false);
  gretelEvent('support:delivered', { activityId: 'A', reaction: 'cue', text: 'Escucha el sonido inicial.' });
  expect(isGretelAssistedAttempt('A')).toBe(true);
  expect(isGretelAssistedAttempt('B')).toBe(false);
  gretelEvent('activity:retry', { activityId: 'A', reaction: 'independent-retry' });
  expect(isGretelAssistedAttempt('A')).toBe(true);
  gretelEvent('activity:retry', { activityId: 'B', reason: 'work-cleared' });
  expect(isGretelAssistedAttempt('A')).toBe(true);
  gretelEvent('activity:retry', { activityId: 'A', reason: 'work-cleared' });
  expect(isGretelAssistedAttempt('A')).toBe(false);
});
