/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGretelAnimation } from '../useGretelAnimation';

describe('useGretelAnimation Hook', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = global.Image;
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.Image = originalImage;
    vi.useRealTimers();
  });

  it("should initialize in idle state immediately", async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src = '';
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    const { result } = renderHook(() => useGretelAnimation());
    expect(result.current.machineState).toBe("idle");
    expect(result.current.isRecovering).toBe(false);
  });

  it('handles SPEAK_START and SPEAK_STOP transitions', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src = '';
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    const { result } = renderHook(() => useGretelAnimation());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.machineState).toBe('idle');

    await act(async () => {
      result.current.send({ type: 'SPEAK_START' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.machineState).toBe('talking');

    await act(async () => {
      result.current.send({ type: 'SPEAK_STOP' });
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.machineState).toBe('idle');
  });

  it('handles recovery (fallback success) and enters recovery mode but stays idle', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src = '';
      constructor() {
        setTimeout(() => {
          if (this.src.includes('/poses/')) {
            this.onerror();
          } else {
            this.onload();
          }
        }, 0);
      }
    } as any;

    const { result } = renderHook(() => useGretelAnimation());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.isRecovering).toBe(true);
    expect(result.current.machineState).toBe('idle');
  });

  it('handles absolute asset failure and transitions to error state', async () => {
    // Both HD and fallback fail
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src = '';
      constructor() {
        setTimeout(() => {
          this.onerror();
        }, 0);
      }
    } as any;

    const { result } = renderHook(() => useGretelAnimation());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.isRecovering).toBe(true);
    expect(result.current.machineState).toBe('error');
  });

  it('cleans up timers on unmount', async () => {
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src = '';
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    const spy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useGretelAnimation());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    unmount();

    expect(spy).toHaveBeenCalled();
  });
});
