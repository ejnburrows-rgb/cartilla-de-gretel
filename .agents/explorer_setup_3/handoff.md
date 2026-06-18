# Handoff Report - Swipe Gestures and Touch/Pointer Events Analysis

This report documents the exploration and analysis of swipe gesture handling, page-flip animation mechanisms, and testing helpers for page-flip components in the project.

---

## 1. Observation

### A. Location of Swipe Hook and Event Handling
* **Hook implementation:** In `src/hooks/useSwipe.ts`, the hook is implemented using React `PointerEvent` handlers rather than `TouchEvent` handlers:
  * Line 17: `const onPointerDown = useCallback((event: React.PointerEvent) => {`
  * Line 29: `const onPointerUp = useCallback((event: React.PointerEvent) => {`
* **Hook output:** It returns `{ onPointerDown, onPointerMove, onPointerUp }` which are passed directly to DOM elements using the spread operator `{...swipeHandlers}`.
* **Velocity and Duration calculation:** In `src/hooks/useSwipe.ts`:
  * Line 35: `const duration = Date.now() - startRef.current.time;`
  * Line 39: `if (distance < minDistance || duration === 0) return;`
  * Line 41: `const velocity = distance / duration;`

### B. Swipe Navigation in BookPageFlip.tsx
* **File Path:** `src/components/cartilla/BookPageFlip.tsx`
* **Event Integration:** Binds the hook on lines 113-122:
  ```typescript
  const swipeHandlers = useSwipe({
    onSwipe: (data) => {
      if (data.direction === "left") {
        handleNext();
      } else if (data.direction === "right") {
        handlePrev();
      }
    },
    minDistance: 40,
  });
  ```
* **Swipe handlers mapping:**
  * Swipe `left` -> `handleNext()` (advances page forward)
  * Swipe `right` -> `handlePrev()` (returns to previous page)
* **Animation Mechanism:**
  * Rotation is horizontal around the Y-axis.
  * Driven by `isFlipping` boolean and `flipTransform` string states.
  * Transitions are scheduled with a double `requestAnimationFrame` on lines 94-98 / 70-74, initiating a CSS transition:
    ```typescript
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(-180deg)');
      });
    });
    ```
  * Animation duration is **600ms**, synchronized via `setTimeout` which updates page indexes and cleans up animation states (e.g., line 100).
  * Rendered as:
    * Mobile mode (line 124): single page layout with aspect ratio `3/4`.
    * Desktop mode (line 153): dual spread pages side-by-side with aspect ratio `2/1.33`.
    * Flipping leaf overlay `.page-flip` containing `.page-front` and `.page-back` with 3D transforms (`transformStyle: preserve-3d`).

### C. Swipe Navigation in StudentWorkbookFlip.tsx
* **File Path:** `src/components/StudentBook/StudentWorkbookFlip.tsx`
* **Event Integration:** Binds the hook on lines 104-113:
  ```typescript
  const swipeHandlers = useSwipe({
    onSwipe: (data) => {
      if (data.direction === "up") {
        handleNext();
      } else if (data.direction === "down") {
        handlePrev();
      }
    },
    minDistance: 40,
  });
  ```
* **Swipe handlers mapping:**
  * Swipe `up` -> `handleNext()` (advances page forward)
  * Swipe `down` -> `handlePrev()` (returns to previous page)
* **Animation Mechanism:**
  * Rotation is vertical around the X-axis (notebook layout).
  * Styled as a spiral notebook binder using 12 rendered rings (`.spiral-ring`).
  * Double `requestAnimationFrame` (lines 74-78 / 92-96) is used to transition `flipTransform` from `'rotateX(0deg)'` to `'rotateX(-180deg)'` or vice versa.
  * Sync `setTimeout` runs for **600ms** before finalizing indices via `afterFlip()`.
  * In addition to page content, vertical flipping implements a `.workbook-shadow-overlay` whose opacity transitions dynamically to simulate paper shadowing.

### D. Swipe Navigation in useSwipeNav.ts
* **File Path:** `src/hooks/useSwipeNav.ts`
* **Event Integration:** Unlike `useSwipe.ts`, this hook binds native `touchstart` and `touchend` events directly to the global `window` object:
  * Line 43: `window.addEventListener("touchstart", handleTouchStart, { passive: true });`
  * Line 44: `window.addEventListener("touchend", handleTouchEnd, { passive: true });`
  * Calculates purely horizontal touch changes `diffX` (distance > 50px) to trigger `onSwipeLeft` and `onSwipeRight`. Used for slide-show style presentation navigation.

---

## 2. Logic Chain

1. **Event Type Identification:**
   * Based on the imports and property bindings in both `BookPageFlip.tsx` and `StudentWorkbookFlip.tsx`, the primary user-interaction swipe handler is derived from `useSwipe.ts`.
   * Since `useSwipe.ts` explicitly maps React's PointerEvent handlers (`onPointerDown`, `onPointerUp`) rather than touch events, any simulated event in Vitest / testing-library must fire `pointerdown` and `pointerup` on the container element to test this swipe behavior.
   * Conversely, because `useSwipeNav.ts` binds directly to `window` with native `touchstart`/`touchend` listeners, tests evaluating global swipe navigation must emit DOM `TouchEvent`s (`touchstart`/`touchend`) on the `window` object.

2. **Timing / Velocity Dependency:**
   * In `useSwipe.ts`, velocity is calculated by dividing distance by the time difference (`Date.now() - startRef.current.time`).
   * If `duration === 0` (which occurs if pointer/touch down and up events are fired synchronously in a test), the hook exits early and triggers nothing.
   * Therefore, tests simulating these swipes must either use fake timers (`vi.useFakeTimers()` and `vi.advanceTimersByTime(duration)`) or execute with an asynchronous delay to ensure a non-zero, realistic duration is registered.

3. **Gesture Direction Calculations:**
   * **Horizontal swipe (BookPageFlip):** Fired when `Math.abs(dx) > Math.abs(dy)`. Next page requires `dx < 0` (swipe left), and prev page requires `dx > 0` (swipe right).
   * **Vertical swipe (StudentWorkbookFlip):** Fired when `Math.abs(dx) <= Math.abs(dy)`. Next page requires `dy < 0` (swipe up), and prev page requires `dy > 0` (swipe down).
   * A minimum drag threshold of `minDistance: 40` is specified for both flip components. Thus, helper functions must define coordinate shifts exceeding 40px (e.g., 150px) to successfully trigger page changes.

---

## 3. Caveats

* **Active Test Runners and Environment:** Tests must be executed in an environment that supports `PointerEvent` in JSDOM. Some older JSDOM versions do not fully support `PointerEvent` properties or constructors; in such cases, polyfilling/mocking `PointerEvent` on the `window` object might be necessary.
* **Fake Timers Coordination:** If tests are written using `vi.useFakeTimers()`, the test author must ensure the timers are advanced between pointer down and up events, and also advanced by at least 600ms afterwards if they want to assert that the page index state transition has finalized.

---

## 4. Conclusion

Page flips in the student's workbook (`StudentWorkbookFlip`) and book spread viewer (`BookPageFlip`) are built on a CSS 3D transition framework (600ms duration) driven by state hooks. Local swipes on these components are captured through React **PointerEvents** via the `useSwipe` hook. Global swipe gestures in teacher-view presentation screens use native **TouchEvents** bound to `window` via `useSwipeNav`. Mocking interactions in tests requires distinct event-firing strategies depending on whether PointerEvents (for `useSwipe`) or TouchEvents (for `useSwipeNav`) are targeted.

---

## 5. Verification Method

### Testing Helper Implementations
To simulate these gestures in tests, the following testing helpers can be imported and executed.

```typescript
import { fireEvent, act } from "@testing-library/react";

interface SwipeOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number; // duration in ms (defaults to 100ms)
}

/**
 * 1. Simulates Pointer-based swipe gestures (targets: BookPageFlip & StudentWorkbookFlip)
 * Since useSwipe depends on Date.now(), we must advance timers or wait.
 */
export async function simulatePointerSwipe(
  element: HTMLElement,
  { startX, startY, endX, endY, duration = 100 }: SwipeOptions
) {
  // Fire pointerdown with start coordinates
  act(() => {
    fireEvent.pointerDown(element, {
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    });
  });

  // Advance time to calculate valid speed/duration
  if (typeof vi !== "undefined" && vi.advanceTimersByTime) {
    act(() => {
      vi.advanceTimersByTime(duration);
    });
  } else {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, duration));
    });
  }

  // Fire pointerup with end coordinates
  act(() => {
    fireEvent.pointerUp(element, {
      clientX: endX,
      clientY: endY,
      button: 0,
      buttons: 0,
    });
  });
}

/**
 * 2. Simulates Touch-based swipe gestures (targets: useSwipeNav / window)
 */
export async function simulateTouchSwipe(
  target: HTMLElement | Window | Document,
  { startX, startY, endX, endY, duration = 100 }: SwipeOptions
) {
  const createTouch = (x: number, y: number) => ({
    identifier: Date.now(),
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
  });

  act(() => {
    fireEvent.touchStart(target, {
      touches: [createTouch(startX, startY)],
      targetTouches: [createTouch(startX, startY)],
      changedTouches: [createTouch(startX, startY)],
    });
  });

  if (typeof vi !== "undefined" && vi.advanceTimersByTime) {
    act(() => {
      vi.advanceTimersByTime(duration);
    });
  } else {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, duration));
    });
  }

  act(() => {
    fireEvent.touchEnd(target, {
      touches: [],
      targetTouches: [],
      changedTouches: [createTouch(endX, endY)],
    });
  });
}

/**
 * Component-specific wrappers for easier test code readability
 */

// BookPageFlip: Next (Swipe Left)
export async function simulateBookPageSwipeNext(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 200, startY: 100, endX: 50, endY: 100 });
}

// BookPageFlip: Prev (Swipe Right)
export async function simulateBookPageSwipePrev(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 50, startY: 100, endX: 200, endY: 100 });
}

// StudentWorkbookFlip: Next (Swipe Up)
export async function simulateWorkbookSwipeNext(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 100, startY: 200, endX: 100, endY: 50 });
}

// StudentWorkbookFlip: Prev (Swipe Down)
export async function simulateWorkbookSwipePrev(element: HTMLElement) {
  await simulatePointerSwipe(element, { startX: 100, startY: 50, endX: 100, endY: 200 });
}

// Window Swipe Navigation (useSwipeNav): Next (Swipe Left)
export async function simulateWindowSwipeNext() {
  await simulateTouchSwipe(window, { startX: 200, startY: 100, endX: 100, endY: 100 });
}

// Window Swipe Navigation (useSwipeNav): Prev (Swipe Right)
export async function simulateWindowSwipePrev() {
  await simulateTouchSwipe(window, { startX: 100, startY: 100, endX: 200, endY: 100 });
}
```

### Verification Command
Run unit/integration tests using Vitest to confirm everything runs and tests execute:
```bash
npx vitest run
```
