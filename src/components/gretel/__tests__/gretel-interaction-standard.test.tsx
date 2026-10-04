import '@testing-library/jest-dom/vitest';
import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GretelLiveAvatar } from '../GretelLiveAvatar';
import { GretelPresence } from '../GretelPresence';
import { gretelEvent } from '@/lib/gretel-bus';
import { GRETEL_APPROVED_MASTER_SRC } from '@/lib/gretel-master';
import { buildMissLine, buildSuccessLine } from '@/lib/gretel-voice';

vi.mock('@/lib/gretel-voice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/gretel-voice')>();
  return {
    ...actual,
    speakAsGretel: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Canonical Gretel Interaction Standard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the canonical owner-approved master asset src', () => {
    expect(GRETEL_APPROVED_MASTER_SRC).toBe('/cartilla/images/gretel/gretel-approved-master.png');
    render(<GretelLiveAvatar />);
    const avatar = screen.getByTestId('gretel-live-avatar');
    expect(avatar).toBeInTheDocument();
    const image = avatar.querySelector('image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('href', '/cartilla/images/gretel/gretel-approved-master.png');
  });

  it('returns canonical spoken feedback text for wrong and correct answers', () => {
    expect(buildMissLine()).toBe('Inténtalo otra vez.');
    expect(buildSuccessLine()).toBe('Buen trabajo.');
  });

  it('switches to listening state when listen:start is emitted and back on listen:stop', () => {
    render(<GretelLiveAvatar />);
    const avatar = screen.getByTestId('gretel-live-avatar');
    expect(avatar).toHaveAttribute('data-listening', 'false');

    act(() => {
      gretelEvent('listen:start');
    });
    expect(avatar).toHaveAttribute('data-listening', 'true');
    expect(avatar).toHaveAttribute('data-state', 'listening');

    act(() => {
      gretelEvent('listen:stop');
    });
    expect(avatar).toHaveAttribute('data-listening', 'false');
    expect(avatar).toHaveAttribute('data-state', 'idle');
  });

  it('settles quietly on page turn start without duplicate reactions', () => {
    render(<GretelPresence bookMode autoIntro={false} />);
    const presence = screen.getByTestId('gretel-presence');

    act(() => {
      gretelEvent('page-turn:start');
    });
    expect(presence).toHaveAttribute('data-page-ready', 'false');

    act(() => {
      gretelEvent('page:revealed', { pageNumber: 3 });
    });
    expect(presence).toHaveAttribute('data-page-ready', 'true');
    expect(presence).toHaveAttribute('data-page-number', '3');
  });
});
