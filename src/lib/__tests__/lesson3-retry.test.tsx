import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLesson3Retry } from "../activity-events";

beforeEach(() => localStorage.clear());
describe("Lesson 3 proof retry policy", () => {
  it("allows exactly three incorrect attempts per picture and leaves other pictures available", () => {
    const { result } = renderHook(() => useLesson3Retry("3"));
    for (let i = 1; i <= 3; i++) act(() => expect(result.current.attempt("oruga")).toBe(true));
    act(() => expect(result.current.attempt("oruga")).toBe(false));
    expect(result.current.text("oruga")).toContain("3 veces");
    act(() => expect(result.current.attempt("iman")).toBe(true));
    expect(result.current.text("iman")).toContain("Intento 1 de 3");
  });
  it("does not limit or save the proof policy in other lessons", () => {
    const { result } = renderHook(() => useLesson3Retry("2"));
    for (let i = 0; i < 5; i++) act(() => expect(result.current.attempt("oruga")).toBe(true));
    expect(result.current.text("oruga")).toBeUndefined();
    expect(localStorage.length).toBe(0);
  });
});
