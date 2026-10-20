import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PictureAudioLifecycle } from '@/components/audio/PictureAudioLifecycle';
vi.mock('@tanstack/react-router', () => ({ useRouterState: () => '/' }));
afterEach(cleanup);
it('does not duplicate the games local status UI', () => {
 render(<PictureAudioLifecycle />);
 act(() => window.dispatchEvent(new CustomEvent('cartilla:recorded-speech-status', { detail:{ source:'game',status:'missing-recording',key:'game-key' } })));
 expect(screen.queryByRole('status')).toBeNull();
});
it('shows pending and failure feedback for global voice slots', () => {
 render(<PictureAudioLifecycle />);
 act(() => window.dispatchEvent(new CustomEvent('cartilla:recorded-speech-status', { detail:{ status:'missing-recording',key:'reading' } })));
 expect(screen.getByRole('status').textContent).toBe('Grabación pendiente.');
 act(() => window.dispatchEvent(new CustomEvent('cartilla:recorded-speech-status', { detail:{ status:'failed',key:'reading' } })));
 expect(screen.getByRole('status').textContent).toBe('No se pudo reproducir la grabación.');
});

it('does not cover native pending controls with a duplicate global toast', () => {
 render(<PictureAudioLifecycle />);
 act(() => window.dispatchEvent(new CustomEvent('cartilla:recorded-speech-status', { detail:{ source:'native-slot',status:'missing-recording',key:'source-key' } })));
 expect(screen.queryByRole('status')).toBeNull();
});
