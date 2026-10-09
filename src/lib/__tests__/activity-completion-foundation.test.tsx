import { setStudentSession } from "../student-session";
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NativeLessonViewer } from '@/components/StudentBook/NativeLessonViewer';
import { FaithfulPageRenderer } from '@/components/cartilla/FaithfulPageRenderer';
import { GretelPresence } from '@/components/gretel/GretelPresence';
import { GretelActivity } from '@/components/gretel/GretelActivity';
import { gretelEvent, onGretelEvent } from '@/lib/gretel-bus';
import { pageCompletionState } from '@/lib/page-completion';
import { saveLassoProgress } from '@/lib/activity-canvas-store';

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));
vi.mock('@/lib/gretel-tts', () => ({ speakGretelPhrase: vi.fn() }));
vi.mock('@/lib/piano-audio', () => ({ playCorrectChord: vi.fn(), playWrongBuzz: vi.fn() }));
vi.mock('@/lib/gretel-voice', async original => ({ ...await original<typeof import('@/lib/gretel-voice')>(), speakAsGretel: vi.fn(() => Promise.resolve()), cancelGretelSpeech: vi.fn() }));

const next = () => screen.getByRole('button', { name: 'Siguiente' });
const pages = [5, 6].map(pageNumber => ({ id: `proof-${pageNumber}`, pageNumber, content: <FaithfulPageRenderer pageNumber={pageNumber} lessonNumber={2} interactive native /> }));
function mountP5() { return render(<><GretelPresence bookMode autoIntro={false} /><NativeLessonViewer pages={pages} chapterLabel="Lección 2" /></>); }
async function tap(name: string) {
  const button = screen.getByRole('button', { name });
  fireEvent.focus(button); fireEvent.click(button);
  await act(async () => { await vi.advanceTimersByTimeAsync(700); });
}
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('actual Workbook p5 completion', () => {
  it('starts with ola as example and requires exactly five learner answers', async () => {
    mountP5();
    expect(screen.getByRole('button', { name: 'ola' }).getAttribute('aria-pressed')).toBe('true');
    expect(next().getAttribute('aria-disabled')).toBe('true');
    for (const word of ['oveja', 'ojos', 'oreja', 'olla']) await tap(word);
    expect(next().getAttribute('aria-disabled')).toBe('true');
    await tap('oso');
    expect(next().hasAttribute('aria-disabled')).toBe(false);
  });
  it('restores completed answers and gate even when the old gate record is missing', () => {
    saveLassoProgress('2:p5-match', ['p5-match-1', 'p5-match-2', 'p5-match-3', 'p5-match-4', 'p5-match-6']);
    mountP5();
    expect(next().hasAttribute('aria-disabled')).toBe(false);
    expect(screen.getByRole('button', { name: 'oso' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('wrong attempts and Ayuda lead to completion that survives follow-up, return and remount', async () => {
    mountP5();
    await tap('iglú'); await tap('alas');
    fireEvent.click(screen.getByRole('button', { name: 'Ayuda' }));
    for (const word of ['oveja', 'ojos', 'oreja', 'olla', 'oso']) await tap(word);
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(next().hasAttribute('aria-disabled')).toBe(false);
    fireEvent.click(next());
    await act(async () => { await vi.advanceTimersByTimeAsync(2600); });
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    await act(async () => { await vi.advanceTimersByTimeAsync(2600); });
    expect(next().hasAttribute('aria-disabled')).toBe(false);
    cleanup(); mountP5();
    expect(next().hasAttribute('aria-disabled')).toBe(false);
    expect(screen.getByRole('button', { name: 'oso' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('locked Siguiente never delivers pedagogical help', () => {
    const events: string[] = []; const off = onGretelEvent(type => events.push(type));
    mountP5(); fireEvent.click(next()); fireEvent.click(next());
    expect(events).not.toContain('hint:show'); expect(events).not.toContain('guide:reaction');
    expect(pageCompletionState(5).complete).toBe(false); off();
  });
});

it('restores partial p5 work and leaves the remaining answers reachable', async () => {
  saveLassoProgress('2:p5-match', ['p5-match-1', 'p5-match-2']);
  mountP5();
  expect(next().getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('button', { name: 'oveja' }).getAttribute('aria-pressed')).toBe('true');
  for (const word of ['oreja', 'olla', 'oso']) await tap(word);
  expect(next().hasAttribute('aria-disabled')).toBe(false);
});

it('an independent follow-up never remounts or erases child work', async () => {
  const { useState } = await import('react');
  function Work() { const [value, setValue] = useState(''); return <input aria-label="Saved child work" value={value} onChange={event => setValue(event.target.value)} />; }
  render(<GretelActivity id="page-5-p5-match" pageNumber={5} kind="vowel-line-match"><Work /></GretelActivity>);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'finished work' } });
  act(() => gretelEvent('guide:reaction', { activityId: 'page-5-p5-match', reaction: 'independent-retry' }));
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('finished work');
});

it('delayed activity A completes A even after B receives focus, and B still locks the page', async () => {
  const { LassoConnect } = await import('@/cartilla/interactions/LassoConnect');
  const { requiredActivitiesForPage } = await import('@/lib/page-completion');
  const [a, b] = requiredActivitiesForPage(26);
  const content = <><GretelActivity id={a!.id} pageNumber={26} kind={a!.kind}>
    <LassoConnect pageKey="identity-A" mode="mark" targets={[{ id: 'one', label: 'Answer A', correct: true }]} reducedMotion />
  </GretelActivity><GretelActivity id={b!.id} pageNumber={26} kind={b!.kind}><input aria-label="Work B" /></GretelActivity></>;
  render(<NativeLessonViewer pages={[{ id: '26', pageNumber: 26, content }, { id: '27', pageNumber: 27, content: null }]} chapterLabel="Proof" />);
  fireEvent.click(screen.getByRole('button', { name: 'Answer A' }));
  fireEvent.focus(screen.getByLabelText('Work B'));
  await act(async () => { await vi.advanceTimersByTimeAsync(700); });
  expect(pageCompletionState(26).remaining.map(item => item.id)).toEqual([b!.id]);
  expect(next().getAttribute('aria-disabled')).toBe('true');
});

it('a delayed answer from an unmounted encounter cannot complete its replacement', async () => {
  const { LassoConnect } = await import('@/cartilla/interactions/LassoConnect');
  const events: string[] = []; const off = onGretelEvent(type => { if (type === 'activity:complete') events.push(type); });
  const view = render(<GretelActivity id="page-5-p5-match" pageNumber={5} kind="vowel-line-match"><LassoConnect pageKey="stale" mode="mark" targets={[{ id: 'one', label: 'Old answer', correct: true }]} reducedMotion /></GretelActivity>);
  fireEvent.click(screen.getByRole('button', { name: 'Old answer' }));
  view.unmount();
  render(<GretelActivity id="page-5-p5-match" pageNumber={5} kind="vowel-line-match"><div>New encounter</div></GretelActivity>);
  await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
  expect(events).toEqual([]); off();
});

it('malformed saved selections cannot crash or unlock p2', () => {
  localStorage.setItem('cartilla.activity-state.v1:page-2-p2-rows:correctRows', '{}');
  render(<NativeLessonViewer pages={[{ id: '2', pageNumber: 2, content: <FaithfulPageRenderer pageNumber={2} lessonNumber={1} interactive native /> }, { id: '3', pageNumber: 3, content: null }]} chapterLabel="Proof" />);
  expect(next().getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('button', { name: 'anillo' }).hasAttribute('disabled')).toBe(false);
});

const learner = (id: string) => ({ studentId: id, studentName: id, studentCode: id, classId: "class", className: "Class" });
it("actual p5 saved answers and gate stay with A when switching to B and back", () => {
  setStudentSession(learner("A"));
  saveLassoProgress('2:p5-match', ['p5-match-1', 'p5-match-2', 'p5-match-3', 'p5-match-4', 'p5-match-6']);
  mountP5();
  expect(next().hasAttribute('aria-disabled')).toBe(false);
  act(() => setStudentSession(learner("B")));
  expect(next().getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('button', { name: 'oso' }).getAttribute('aria-pressed')).toBe('false');
  act(() => setStudentSession(learner("A")));
  expect(next().hasAttribute('aria-disabled')).toBe(false);
  expect(screen.getByRole('button', { name: 'oso' }).getAttribute('aria-pressed')).toBe('true');
});
it("actual p5 never adopts anonymous completed answers into a signed-in learner", () => {
  saveLassoProgress('2:p5-match', ['p5-match-1', 'p5-match-2', 'p5-match-3', 'p5-match-4', 'p5-match-6']);
  mountP5();
  expect(next().hasAttribute('aria-disabled')).toBe(false);
  act(() => setStudentSession(learner("new")));
  expect(next().getAttribute('aria-disabled')).toBe('true');
  expect(screen.getByRole('button', { name: 'oso' }).getAttribute('aria-pressed')).toBe('false');
});
