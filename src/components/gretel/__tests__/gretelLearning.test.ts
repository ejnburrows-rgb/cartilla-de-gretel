import { describe, expect, it } from 'vitest';
import { advanceLearning, freshLearningState } from '../gretelLearning';

describe('Gretel progressive teaching policy', () => {
  it('escalates cue, hint, demonstration deterministically', () => {
    const first = advanceLearning(freshLearningState(), 'wrong');
    const second = advanceLearning(first.state, 'wrong');
    const third = advanceLearning(second.state, 'wrong');
    expect([first.reaction, second.reaction, third.reaction]).toEqual(['cue', 'hint', 'demonstration']);
    expect(first.state.assisted).toBe(false);
    expect(third.state.assisted).toBe(true);
  });
  it('requires a new independent attempt after help and ignores premature completion', () => {
    const hinted = advanceLearning(freshLearningState(), 'hint');
    const assisted = advanceLearning(hinted.state, 'correct');
    expect(assisted.reaction).toBe('independent-retry');
    expect(advanceLearning(assisted.state, 'complete').reaction).toBeNull();
    const retry = advanceLearning(assisted.state, 'retry');
    const success = advanceLearning(retry.state, 'correct');
    expect(success.reaction).toBe('success');
    expect(advanceLearning(success.state, 'complete').reaction).toBe('mastery');
  });
  it('does not celebrate completion while help is still active', () => {
    const hinted = advanceLearning(freshLearningState(), 'hint');
    expect(advanceLearning(hinted.state, 'complete').reaction).toBe('independent-retry');
  });
  it('celebrates mastery once', () => {
    const completed = advanceLearning(freshLearningState(), 'complete');
    expect(completed.reaction).toBe('mastery');
    expect(advanceLearning(completed.state, 'complete').reaction).toBeNull();
    expect(advanceLearning(completed.state, 'hint')).toEqual({ state: completed.state, reaction: null });
    expect(advanceLearning(completed.state, 'wrong')).toEqual({ state: completed.state, reaction: null });
  });
});
