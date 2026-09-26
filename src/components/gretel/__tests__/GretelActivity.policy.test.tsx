import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GretelActivity } from '../GretelActivity';
import { GretelPresence } from '../GretelPresence';
import { gretelEvent } from '@/lib/gretel-bus';
vi.mock('@/lib/gretel-voice', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/gretel-voice')>(),
  speakAsGretel: vi.fn(() => Promise.resolve()), cancelGretelSpeech: vi.fn(), isGretelVoiceMuted: () => false,
}));
afterEach(() => vi.useRealTimers());
describe('page-aware exercise help', () => {
  it('highlights the actual target, narrows choices, and requests independent retry', async () => {
    vi.useFakeTimers();
    render(<><GretelPresence bookMode autoIntro={false} /><GretelActivity id="test-exercise" pageNumber={19} kind="picture-grid">
      <button data-gretel-correct="false" onClick={() => gretelEvent('answer:wrong')}>Distractor</button>
      <button data-gretel-correct="true" onClick={() => { gretelEvent('answer:correct'); gretelEvent('activity:complete'); }}>Target</button>
    </GretelActivity></>);
    act(() => gretelEvent('page:revealed', { pageNumber: 19 }));
    const wrong = screen.getByText('Distractor');
    fireEvent.focus(wrong);
    fireEvent.click(wrong);
    expect(screen.getByTestId('gretel-presence')).toHaveAttribute('data-reaction', 'cue');
    fireEvent.click(wrong);
    expect(screen.getByText('Target')).toHaveAttribute('data-gretel-highlight', 'hint');
    fireEvent.click(wrong);
    expect(wrong).toBeDisabled();
    expect(screen.getByText('Target')).toHaveAttribute('data-gretel-highlight', 'demonstration');
    fireEvent.click(screen.getByText('Target'));
    expect(screen.getByTestId('gretel-presence')).toHaveAttribute('data-reaction', 'independent-retry');
    await act(async () => { await vi.advanceTimersByTimeAsync(1700); });
    expect(screen.getByText('Distractor')).not.toBeDisabled();
    fireEvent.focus(screen.getByText('Target'));
    fireEvent.click(screen.getByText('Target'));
    expect(screen.getByTestId('gretel-presence')).toHaveAttribute('data-reaction', 'mastery');
  });
  it('hides and cancels queued guidance during a turn', async () => {
    vi.useFakeTimers();
    render(<GretelPresence bookMode autoIntro={false} />);
    act(() => gretelEvent('page:revealed', { pageNumber: 1, text: 'Old page instruction' }));
    act(() => gretelEvent('page-turn:start'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.getByTestId('gretel-presence')).toHaveAttribute('data-page-ready', 'false');
    expect(screen.queryByText('Old page instruction')).toBeNull();
  });
});
