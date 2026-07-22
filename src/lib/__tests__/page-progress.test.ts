/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPageState,
  markPageStarted,
  markPageCompleted,
  resetPage,
  isPageCompleted,
  getCompletionForLesson,
  getTotalMinutesToday,
  getLastVisitedPage,
} from "../page-progress";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0)); // fixed "today" at 10:00
});
afterEach(() => vi.useRealTimers());

describe("page-progress", () => {
  it("returns a zeroed state for an unseen page", () => {
    expect(getPageState(7)).toEqual({ page: 7, attempts: 0, totalMs: 0 });
    expect(isPageCompleted(7)).toBe(false);
  });

  it("markPageStarted increments attempts and records startedAt", () => {
    const s1 = markPageStarted(7);
    expect(s1.attempts).toBe(1);
    expect(s1.startedAt).toBeDefined();
    const s2 = markPageStarted(7);
    expect(s2.attempts).toBe(2);
  });

  it("markPageCompleted accumulates elapsed time and clears startedAt", () => {
    markPageStarted(7);
    vi.advanceTimersByTime(5000); // 5s on the page
    const done = markPageCompleted(7);
    expect(done.totalMs).toBe(5000);
    expect(done.completedAt).toBeDefined();
    expect(done.startedAt).toBeUndefined();
    expect(isPageCompleted(7)).toBe(true);
  });

  it("markPageCompleted adds an explicit extraMs on top of the session", () => {
    markPageStarted(7);
    vi.advanceTimersByTime(1000);
    expect(markPageCompleted(7, 2000).totalMs).toBe(3000);
  });

  it("getCompletionForLesson returns the completed fraction (0 for an empty lesson)", () => {
    expect(getCompletionForLesson([])).toBe(0);
    markPageStarted(1);
    markPageCompleted(1);
    markPageStarted(2);
    markPageCompleted(2);
    expect(getCompletionForLesson([1, 2, 3, 4])).toBe(0.5);
  });

  it("resetPage clears a page's state", () => {
    markPageStarted(7);
    markPageCompleted(7);
    resetPage(7);
    expect(getPageState(7)).toEqual({ page: 7, attempts: 0, totalMs: 0 });
  });

  it("getTotalMinutesToday sums time from pages completed today", () => {
    markPageStarted(1);
    vi.advanceTimersByTime(120000); // 2 min
    markPageCompleted(1);
    expect(getTotalMinutesToday()).toBe(2);
  });

  it("getLastVisitedPage returns the most recently touched page (null when none)", () => {
    expect(getLastVisitedPage()).toBeNull();
    markPageStarted(3);
    vi.advanceTimersByTime(1000);
    markPageStarted(8);
    expect(getLastVisitedPage()).toBe(8);
  });
});
