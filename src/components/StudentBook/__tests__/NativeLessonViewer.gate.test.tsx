/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { NativeLessonViewer } from "../NativeLessonViewer";
import { gretelEvent } from "@/lib/gretel-bus";
import type { WorkbookPageEntry } from "../SimplePageViewer";

// The gate hooks into the REAL gretel-bus: interactive exercises fire
// `activity:complete` on it, and the viewer subscribes via onGretelEvent.
// Do NOT mock @/lib/gretel-bus here.

function makePages(): WorkbookPageEntry[] {
  return [
    { id: "p1", pageNumber: 101, content: <div>Actividad 1</div>, requiresActivity: true },
    { id: "p2", pageNumber: 102, content: <div>Lectura</div> },
    { id: "p3", pageNumber: 103, content: <div>Actividad 2</div>, requiresActivity: true },
  ];
}

const nextButton = () => screen.getByRole("button", { name: /siguiente|terminar lección/i });
const backButton = () => screen.getByRole("button", { name: /anterior/i });
const completeActivity = () => act(() => { gretelEvent("activity:complete"); });

beforeEach(() => { window.localStorage.clear(); });
afterEach(() => { cleanup(); window.localStorage.clear(); });

describe("NativeLessonViewer page completion gate", () => {
  it("blocks Siguiente until the page activity completes, then lets the student advance", () => {
    const onPageChange = vi.fn();
    render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" onPageChange={onPageChange} />,
    );

    // Incomplete activity page: Siguiente disabled with clear feedback.
    expect(nextButton()).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/completa la actividad/i);

    completeActivity();

    // Completed: gate opens, hint disappears, Siguiente advances.
    expect(nextButton()).toBeEnabled();
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(nextButton());
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("Lectura")).toBeInTheDocument();
  });

  it("always allows Anterior, even when the current page activity is incomplete", () => {
    render(<NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" />);

    completeActivity(); // page 0 done
    fireEvent.click(nextButton()); // -> page 1 (reading, no gate)
    fireEvent.click(nextButton()); // -> page 2 (activity, incomplete)
    expect(screen.getByText("Actividad 2")).toBeInTheDocument();
    expect(nextButton()).toBeDisabled();

    // Back works despite the incomplete activity on the current page.
    fireEvent.click(backButton());
    expect(screen.getByText("Lectura")).toBeInTheDocument();
  });

  it("never gates reading/instruction-only pages", () => {
    render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" initialPage={1} />,
    );
    expect(screen.getByText("Lectura")).toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("gates Terminar lección on the last page until its activity completes", () => {
    const onFinish = vi.fn();
    render(
      <NativeLessonViewer
        pages={makePages()}
        chapterLabel="Lección 1"
        initialPage={2}
        onFinish={onFinish}
      />,
    );

    const finish = screen.getByRole("button", { name: /terminar lección/i });
    expect(finish).toBeDisabled();
    fireEvent.click(finish);
    expect(onFinish).not.toHaveBeenCalled();

    completeActivity();
    expect(finish).toBeEnabled();
    fireEvent.click(finish);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("remembers finished page activities across remounts for the same lesson", () => {
    const first = render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" lessonId={7} />,
    );
    expect(nextButton()).toBeDisabled();
    completeActivity();
    expect(nextButton()).toBeEnabled();
    first.unmount();

    render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" lessonId={7} />,
    );
    expect(nextButton()).toBeEnabled();
  });

  it("does not leak completion between different lessons", () => {
    const first = render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 1" lessonId={7} />,
    );
    completeActivity();
    first.unmount();

    render(
      <NativeLessonViewer pages={makePages()} chapterLabel="Lección 2" lessonId={8} />,
    );
    expect(nextButton()).toBeDisabled();
  });
});
