import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LivingIllustration } from '../LivingIllustration';
let reduced = false;
beforeEach(() => {
  reduced = false;
  window.matchMedia = vi.fn().mockImplementation(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('approved Flow clip delivery', () => {
  it('plays once then returns to the approved static image', () => {
    const props = { src: '/cartilla/art/optimized/flipchart-native/p018-tomate.webp', clipSrc: '/cartilla/motion/tomate.webm' };
    const { container, rerender } = render(<LivingIllustration {...props} />);
    const video = container.querySelector('video')!;
    expect(video.loop).toBe(false);
    expect(video.muted).toBe(true);
    fireEvent.ended(video);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')!.style.visibility).toBe('');
    rerender(<LivingIllustration {...props} />);
    expect(container.querySelector('video')).toBeNull();
  });
  it('returns to the still on a failed clip', () => {
    const { container } = render(<LivingIllustration src="/still.png" clipSrc="/missing.webm" />);
    fireEvent.error(container.querySelector('video')!);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')!.src).toContain('/still.png');
  });
  it('uses only the still with reduced motion or static presentation', () => {
    reduced = true;
    const { container, rerender } = render(<LivingIllustration src="/still.png" clipSrc="/motion.webm" />);
    expect(container.querySelector('video')).toBeNull();
    reduced = false;
    rerender(<LivingIllustration src="/still.png" clipSrc="/motion.webm" static />);
    expect(container.querySelector('video')).toBeNull();
  });
});
