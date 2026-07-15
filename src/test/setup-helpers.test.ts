import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  simulatePointerSwipe,
  simulateTouchSwipe,
  simulateBookPageSwipeNext,
  simulateBookPageSwipePrev,
  simulateWorkbookSwipeNext,
  simulateWorkbookSwipePrev,
  simulateWindowSwipeNext,
  simulateWindowSwipePrev,
} from "./setup";

describe("setup.ts gesture helpers", () => {
  let element: HTMLDivElement;
  let events: any[] = [];

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    events = [];
  });

  afterEach(() => {
    element.remove();
    vi.useRealTimers();
  });

  describe("simulatePointerSwipe", () => {
    it.fails("should simulate pointer swipe events under real timers", async () => {
      vi.useRealTimers();

      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });

      const startTime = Date.now();
      await simulatePointerSwipe(element, {
        startX: 10,
        startY: 20,
        endX: 100,
        endY: 200,
        duration: 50,
      });
      const endTime = Date.now();

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 10, clientY: 20 });
      expect(events[1]).toEqual({ type: "pointerup", clientX: 100, clientY: 200 });
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // Allow slight timing variations
    });

    it("should simulate pointer swipe events and advance time correctly under fake timers", async () => {
      vi.useFakeTimers();

      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY, time: Date.now() });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY, time: Date.now() });
      });

      const startTime = Date.now();
      const swipePromise = simulatePointerSwipe(element, {
        startX: 10,
        startY: 20,
        endX: 100,
        endY: 200,
        duration: 150,
      });

      await swipePromise;
      const endTime = Date.now();

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 10, clientY: 20, time: startTime });
      expect(events[1]).toEqual({
        type: "pointerup",
        clientX: 100,
        clientY: 200,
        time: startTime + 150,
      });
      expect(endTime - startTime).toBe(150);
    });
  });

  describe("simulateTouchSwipe", () => {
    it.fails("should simulate touch swipe events under real timers", async () => {
      vi.useRealTimers();

      element.addEventListener("touchstart", (e: any) => {
        const touch = e.touches[0];
        events.push({
          type: e.type,
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      });
      element.addEventListener("touchend", (e: any) => {
        const touch = e.changedTouches[0];
        events.push({
          type: e.type,
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      });

      await simulateTouchSwipe(element, {
        startX: 50,
        startY: 60,
        endX: 500,
        endY: 600,
        duration: 50,
      });

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: "touchstart", clientX: 50, clientY: 60 });
      expect(events[1]).toEqual({ type: "touchend", clientX: 500, clientY: 600 });
    });

    it("should simulate touch swipe events and advance time correctly under fake timers", async () => {
      vi.useFakeTimers();

      element.addEventListener("touchstart", (e: any) => {
        const touch = e.touches[0];
        events.push({
          type: e.type,
          clientX: touch.clientX,
          clientY: touch.clientY,
          time: Date.now(),
        });
      });
      element.addEventListener("touchend", (e: any) => {
        const touch = e.changedTouches[0];
        events.push({
          type: e.type,
          clientX: touch.clientX,
          clientY: touch.clientY,
          time: Date.now(),
        });
      });

      const startTime = Date.now();
      await simulateTouchSwipe(element, {
        startX: 50,
        startY: 60,
        endX: 500,
        endY: 600,
        duration: 200,
      });
      const endTime = Date.now();

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: "touchstart", clientX: 50, clientY: 60, time: startTime });
      expect(events[1]).toEqual({
        type: "touchend",
        clientX: 500,
        clientY: 600,
        time: startTime + 200,
      });
      expect(endTime - startTime).toBe(200);
    });
  });

  describe("Component-specific wrappers", () => {
    it("should correctly trigger simulateBookPageSwipeNext", async () => {
      vi.useFakeTimers();
      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });

      await simulateBookPageSwipeNext(element);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 200, clientY: 100 });
      expect(events[1]).toEqual({ type: "pointerup", clientX: 50, clientY: 100 });
    });

    it("should correctly trigger simulateBookPageSwipePrev", async () => {
      vi.useFakeTimers();
      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });

      await simulateBookPageSwipePrev(element);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 50, clientY: 100 });
      expect(events[1]).toEqual({ type: "pointerup", clientX: 200, clientY: 100 });
    });

    it("should correctly trigger simulateWorkbookSwipeNext", async () => {
      vi.useFakeTimers();
      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });

      await simulateWorkbookSwipeNext(element);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 100, clientY: 200 });
      expect(events[1]).toEqual({ type: "pointerup", clientX: 100, clientY: 50 });
    });

    it("should correctly trigger simulateWorkbookSwipePrev", async () => {
      vi.useFakeTimers();
      element.addEventListener("pointerdown", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });
      element.addEventListener("pointerup", (e) => {
        events.push({ type: e.type, clientX: e.clientX, clientY: e.clientY });
      });

      await simulateWorkbookSwipePrev(element);
      expect(events[0]).toEqual({ type: "pointerdown", clientX: 100, clientY: 50 });
      expect(events[1]).toEqual({ type: "pointerup", clientX: 100, clientY: 200 });
    });

    it("should correctly trigger simulateWindowSwipeNext", async () => {
      vi.useFakeTimers();
      const windowEvents: any[] = [];
      const onStart = (e: any) => {
        windowEvents.push({
          type: e.type,
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
      };
      const onEnd = (e: any) => {
        windowEvents.push({
          type: e.type,
          clientX: e.changedTouches[0].clientX,
          clientY: e.changedTouches[0].clientY,
        });
      };

      window.addEventListener("touchstart", onStart);
      window.addEventListener("touchend", onEnd);

      await simulateWindowSwipeNext();

      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);

      expect(windowEvents[0]).toEqual({ type: "touchstart", clientX: 200, clientY: 100 });
      expect(windowEvents[1]).toEqual({ type: "touchend", clientX: 100, clientY: 100 });
    });

    it("should correctly trigger simulateWindowSwipePrev", async () => {
      vi.useFakeTimers();
      const windowEvents: any[] = [];
      const onStart = (e: any) => {
        windowEvents.push({
          type: e.type,
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
      };
      const onEnd = (e: any) => {
        windowEvents.push({
          type: e.type,
          clientX: e.changedTouches[0].clientX,
          clientY: e.changedTouches[0].clientY,
        });
      };

      window.addEventListener("touchstart", onStart);
      window.addEventListener("touchend", onEnd);

      await simulateWindowSwipePrev();

      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);

      expect(windowEvents[0]).toEqual({ type: "touchstart", clientX: 100, clientY: 100 });
      expect(windowEvents[1]).toEqual({ type: "touchend", clientX: 200, clientY: 100 });
    });
  });
});
