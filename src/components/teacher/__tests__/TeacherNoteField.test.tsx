/**
 * @vitest-environment jsdom
 *
 * Regression coverage for the reproduced TeacherNoteField defect: entering a
 * note in lesson 1 and switching lessonId to 2 in the same mounted component
 * used to display the old lesson's note (and saved badge). Draft text and the
 * saved indicator must be isolated per lesson+student, stale hide timers must
 * be cancelled on context change/unmount, and a pending callback must never
 * mark the next context as saved.
 */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeacherNoteField } from "../TeacherNoteField";

const SAVED_MS = 2000;
const field = () => screen.getByRole("textbox") as HTMLTextAreaElement;
const savedIndicator = () => screen.queryByText(/Guardado/);
const type = (value: string) => fireEvent.change(field(), { target: { value } });

describe("TeacherNoteField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("edits and saves normally when the context does not change", () => {
    render(<TeacherNoteField lessonId="1" />);

    type("Observación de la lección 1");
    expect(field().value).toBe("Observación de la lección 1");
    expect(savedIndicator()).toBeNull();

    fireEvent.blur(field());
    expect(savedIndicator()).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(SAVED_MS);
    });
    expect(savedIndicator()).toBeNull();
  });

  it("isolates the draft text by lessonId", () => {
    const { rerender } = render(<TeacherNoteField lessonId="1" />);

    type("Nota de la lección 1");
    expect(field().value).toBe("Nota de la lección 1");

    rerender(<TeacherNoteField lessonId="2" />);
    expect(field().value).toBe("");

    type("Nota de la lección 2");
    expect(field().value).toBe("Nota de la lección 2");

    rerender(<TeacherNoteField lessonId="1" />);
    expect(field().value).toBe("Nota de la lección 1");

    rerender(<TeacherNoteField lessonId="2" />);
    expect(field().value).toBe("Nota de la lección 2");
  });

  it("isolates the draft text by studentId within the same lesson", () => {
    const { rerender } = render(<TeacherNoteField lessonId="7" studentId="ana" />);

    type("Nota de Ana");
    rerender(<TeacherNoteField lessonId="7" studentId="beto" />);
    expect(field().value).toBe("");

    type("Nota de Beto");
    rerender(<TeacherNoteField lessonId="7" studentId="ana" />);
    expect(field().value).toBe("Nota de Ana");
  });

  it("does not show a saved indicator for the new lesson after a lesson change", () => {
    const { rerender } = render(<TeacherNoteField lessonId="1" />);

    type("Nota de la lección 1");
    fireEvent.blur(field());
    expect(savedIndicator()).not.toBeNull();

    rerender(<TeacherNoteField lessonId="2" />);
    expect(savedIndicator()).toBeNull();
  });

  it("does not let a pending saved-indicator timer mark the next context saved", () => {
    const { rerender } = render(<TeacherNoteField lessonId="1" />);

    type("Nota de la lección 1");
    fireEvent.blur(field()); // schedules the hide timer for lesson 1

    rerender(<TeacherNoteField lessonId="2" />);
    act(() => {
      vi.advanceTimersByTime(SAVED_MS);
    });
    expect(savedIndicator()).toBeNull();

    // The new context can still save on its own without the stale timer interfering.
    type("Nota de la lección 2");
    fireEvent.blur(field());
    expect(savedIndicator()).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(SAVED_MS);
    });
    expect(savedIndicator()).toBeNull();
  });

  it("cancels a stale hide timer when the student changes", () => {
    const { rerender } = render(<TeacherNoteField lessonId="3" studentId="ana" />);

    type("Nota de Ana");
    fireEvent.blur(field());

    rerender(<TeacherNoteField lessonId="3" studentId="beto" />);
    expect(savedIndicator()).toBeNull();

    type("Nota de Beto");
    fireEvent.blur(field());
    expect(savedIndicator()).not.toBeNull();

    // Ana's stale timer must not clear Beto's fresh saved indicator early.
    act(() => {
      vi.advanceTimersByTime(SAVED_MS);
    });
    expect(savedIndicator()).toBeNull();
  });

  it("cancels the pending hide timer on unmount without leaking state updates", () => {
    const { unmount } = render(<TeacherNoteField lessonId="1" />);

    type("Nota de la lección 1");
    fireEvent.blur(field());
    expect(savedIndicator()).not.toBeNull();

    expect(() => {
      unmount();
      act(() => {
        vi.advanceTimersByTime(SAVED_MS);
      });
    }).not.toThrow();
  });
});
