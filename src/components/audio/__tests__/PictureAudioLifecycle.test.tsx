import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PictureAudioLifecycle } from '../PictureAudioLifecycle';

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => '/',
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('keeps failed audio playback silent for students', () => {
  render(<PictureAudioLifecycle />);

  window.dispatchEvent(new CustomEvent('cartilla:picture-audio-status', { detail: 'failed' }));

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByText(/No se pudo reproducir/)).not.toBeInTheDocument();
});
