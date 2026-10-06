import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { recordEvent } from '../student-session';
import { evidenceFor } from '../progress-semantics';
import { recordExerciseStat, lessonAccuracy, getStats, resetStats } from '../exercise-stats';
import { gretelEvent, isGretelAssistedAttempt, hasGretelDemonstration } from '../gretel-bus';
import { InteractivePictureGrid, InteractiveFillInBlank } from '@/components/cartilla/InteractivePageExercises';
import { GretelActivity } from '@/components/gretel/GretelActivity';
import { SyllableWordCircle } from '@/cartilla/interactions/SyllableWordCircle';
beforeEach(() => { localStorage.clear(); resetStats(); });
afterEach(cleanup);
it('distinguishes independent completion, assisted completion and recovery after demonstration', () => {
  const input = { score: 1, total: 1, meta: { activityId: 'A', encounterId: 'run', completed: true } };
  expect(evidenceFor(input, { assisted: false, demonstration: false })).toMatchObject({ outcome: 'independent-success', completed: true, grading: 'practice' });
  expect(evidenceFor(input, { assisted: true, demonstration: false })).toMatchObject({ outcome: 'assisted-success', completed: true });
  expect(evidenceFor(input, { assisted: true, demonstration: true })).toMatchObject({ outcome: 'recovery-after-support', completed: true, needsIndependentAttempt: true });
  expect(evidenceFor({ score: 0, total: 1 }, { assisted: false, demonstration: false }).outcome).toBe('incorrect-attempt');
  expect(evidenceFor({ score: 1, total: 1 }, { assisted: false, demonstration: false }).outcome).toBe('correct-independence-unknown');
  expect(evidenceFor({ ...input, meta: { grading: 'formal-evaluation' } }, { assisted: false, demonstration: false }).grading).toBe('formal-evaluation');
});
it('help requests and planned reactions alone are not delivered assistance', () => {
  gretelEvent('hint:show', { activityId: 'A' });
  gretelEvent('guide:reaction', { activityId: 'A', reaction: 'demonstration' });
  expect(isGretelAssistedAttempt('A')).toBe(false);
  gretelEvent('support:delivered', { activityId: 'A', reaction: 'demonstration', targetId: 'one-target', text: 'Mira esta opción.' });
  expect(isGretelAssistedAttempt('A')).toBe(true);
  expect(hasGretelDemonstration('A')).toBe(true);
});
it('ungraded production completes while old and new production never affect literacy accuracy', () => {
  expect(evidenceFor({ score: 1, total: 1, meta: { exercise: 'draw_box_A', completed: true } }, { assisted: true, demonstration: false })).toMatchObject({ outcome: 'ungraded-production', completed: true, grading: 'ungraded' });
  recordExerciseStat({ lessonId: '1', exercise: 'draw_box_old', score: 1, total: 1, completed: true });
  expect(lessonAccuracy('1')).toBeNull();
  recordExerciseStat({ lessonId: '1', exercise: 'picture_grid_A', score: 1, total: 2 });
  expect(lessonAccuracy('1')).toBe(.5);
  expect(getStats()['1'].draw_box_old.completedRounds).toBe(1);
});
it('preserves validated selections, marks wrong choices and reports remaining count without reveal-all', () => {
  const view = render(<GretelActivity id="multi" pageNumber={1} kind="picture-grid"><InteractivePictureGrid lessonId="1" accent="#123" region={{ id: 'multi', regionType: 'picture-grid', order: 1, fontRole: 'body', cells: [{ caption: 'oso', correct: true }, { caption: 'olla', correct: true }, { caption: 'avión', correct: false }] }} /></GretelActivity>);
  fireEvent.click(screen.getByRole('button', { name: /oso/ })); fireEvent.click(screen.getByRole('button', { name: /avión/ })); fireEvent.click(screen.getByText('Comprobar'));
  expect(view.container.querySelectorAll('.graded-correct')).toHaveLength(1);
  expect(view.container.querySelectorAll('.graded-wrong')).toHaveLength(1);
  expect(view.container.querySelectorAll('.graded-missed')).toHaveLength(0);
  expect(screen.getByRole('status')).toHaveTextContent('Faltan 1');
  expect(getStats()['1'].picture_grid_multi).toMatchObject({ hits: 1, attempts: 3, meta: { completed: false } });
  fireEvent.click(screen.getByText('Corregir respuestas'));
  expect(screen.getByRole('button', { name: /oso/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /olla/ })); fireEvent.click(screen.getByText('Comprobar'));
  expect(getStats()['1'].picture_grid_multi.meta).toMatchObject({ completed: true, outcome: 'independent-success' });
});
it('Completa gives immediate gentle wrong feedback for implicit distractors and permits correction', () => {
  render(<InteractiveFillInBlank accent="#123" region={{ id: 'fill', regionType: 'fill-in-blank', order: 1, fontRole: 'body', fillItems: [{ wordBox: 'mapa', blank: '___pa', choices: [{ text: 'sa' }, { text: 'ma', correct: true }] }] }} />);
  fireEvent.click(screen.getByText('sa'));
  expect(screen.getByText('sa')).toHaveClass('is-retry');
  expect(screen.queryByText('Comprobar')).toBeNull();
  fireEvent.click(screen.getByText('ma'));
  expect(screen.getByText('ma')).toHaveClass('graded-correct');
  expect(screen.getByText('Completado')).toBeInTheDocument();
});
it('both occurrences of pa in papá are valid, and correct syllables are not boxed before an attempt', () => {
  const view = render(<SyllableWordCircle region={{ id: 'repeat', regionType: 'syllable-match', order: 1, fontRole: 'body', syllable: 'pa', matchRows: [[{ word: 'papá', correct: true }]] }} />);
  expect(view.container.querySelector('.is-circled')).toBeNull();
  expect(view.container.querySelectorAll('.native-syllable__letter')).toHaveLength(4);
  fireEvent.click(screen.getByRole('button', { name: 'papá, posición 2: a' }));
  expect(screen.getByRole('status')).toHaveTextContent('Inténtalo');
  fireEvent.click(screen.getByRole('button', { name: 'papá, posición 3: p' }));
  expect(screen.getByRole('status')).toHaveTextContent('1 de 1');
  fireEvent.click(screen.getByRole('button', { name: /^papá$/ }));
  expect(screen.getByRole('status')).toHaveTextContent('1 de 1');
});
it('before an attempt, Gretel gives a strategy without displaying a correct target; later demonstrates only one', () => {
  const view = render(<GretelActivity id="help" pageNumber={1} kind="picture-grid"><button data-gretel-correct="true">A</button><button data-gretel-correct="true">B</button><button data-gretel-correct="false">C</button></GretelActivity>);
  act(() => gretelEvent('guide:reaction', { activityId: 'help', reaction: 'demonstration' }));
  expect(view.container.querySelector('[data-gretel-highlight]')).toBeNull();
  expect(isGretelAssistedAttempt('help')).toBe(true);
  expect(hasGretelDemonstration('help')).toBe(false);
  act(() => { gretelEvent('answer:wrong', { activityId: 'help' }); gretelEvent('guide:reaction', { activityId: 'help', reaction: 'demonstration' }); });
  expect(view.container.querySelectorAll('[data-gretel-highlight]')).toHaveLength(1);
  expect(screen.getByText('C')).toBeEnabled();
  expect(hasGretelDemonstration('help')).toBe(true);
});

it('the existing reporting pipeline retains assisted completion, records recovery and excludes ungraded scores', () => {
  const identity = { activityId: 'pipeline', encounterId: 'run' };
  recordEvent({ lessonId: '1', kind: 'exercise', score: 1, total: 1, meta: { ...identity, exercise: 'picture_grid_pipeline', completed: true } });
  expect(getStats()['1'].picture_grid_pipeline.meta?.outcome).toBe('independent-success');
  gretelEvent('support:delivered', { activityId: 'pipeline', text: 'Escucha el sonido inicial.' });
  recordEvent({ lessonId: '1', kind: 'exercise', score: 1, total: 1, meta: { ...identity, exercise: 'picture_grid_pipeline', completed: true } });
  expect(getStats()['1'].picture_grid_pipeline.meta).toMatchObject({ completed: true, outcome: 'assisted-success' });
  gretelEvent('support:delivered', { activityId: 'pipeline', reaction: 'demonstration', targetId: 'one' });
  recordEvent({ lessonId: '1', kind: 'exercise', score: 1, total: 1, meta: { ...identity, exercise: 'picture_grid_pipeline', completed: true } });
  expect(getStats()['1'].picture_grid_pipeline.meta).toMatchObject({ completed: true, outcome: 'recovery-after-support' });
  recordEvent({ lessonId: '1', kind: 'exercise', score: 1, total: 1, meta: { ...identity, exercise: 'draw_box_pipeline', completed: true } });
  expect(getStats()['1'].draw_box_pipeline).toMatchObject({ hits: 0, attempts: 0, completedRounds: 1, meta: { completed: true, grading: 'ungraded', outcome: 'ungraded-production' } });
  expect(lessonAccuracy('1')).toBe(1);
});
