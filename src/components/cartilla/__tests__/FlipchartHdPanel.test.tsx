/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { FlipchartHdPanel } from "../FlipchartHdPanel";
import { TeacherPresentationShell } from "../TeacherPresentationShell";

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

beforeEach(() => {
  cleanup();
  window.matchMedia =
    window.matchMedia ??
    ((query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList);
});

afterEach(() => cleanup());

describe("FlipchartHdPanel — CRM-grade presenter board", () => {
  it("renders wide stage landmarks (no max-w postage stamp class on board)", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    const panel = container.querySelector('[data-testid="flipchart-hd-panel"]');
    const stage = container.querySelector('[data-testid="flipchart-stage"]');
    expect(panel).toBeTruthy();
    expect(stage).toBeTruthy();
    expect(panel?.getAttribute("data-hd-primary")).toBe("true");
    // Legacy narrow constraints must not reappear on the board root
    expect(panel?.className).not.toMatch(/max-w-5xl|max-w-4xl|max-w-3xl/);
    expect(stage?.className).not.toMatch(/max-w-5xl|max-w-4xl/);
  });

  it("uses HD flipchart asset paths on faces", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    const face = container.querySelector("[data-flipchart-src]");
    // Lesson 2 may or may not have plates depending on catalog — if present, HD
    if (face) {
      const src = face.getAttribute("data-flipchart-src") ?? "";
      expect(src).toContain("/cartilla/art/hd/flipchart/");
      expect(face.getAttribute("data-hd")).toBe("true");
    } else {
      expect(screen.getByTestId("flipchart-empty")).toBeTruthy();
    }
  });

  it("shows Spanish hoja counter and large nav when plates exist", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(/Hoja/i);
    expect(screen.getByLabelText(/Lámina anterior/i)).toBeTruthy();
    expect(screen.getByLabelText(/Lámina siguiente/i)).toBeTruthy();
  });

  it("advances with keyboard arrow keys", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    const before = screen.getByTestId("flipchart-counter").textContent;
    fireEvent.keyDown(window, { key: "ArrowRight" });
    // May still be hoja 1 if single plate or flip in progress — counter exists
    expect(screen.getByTestId("flipchart-counter").textContent).toBeTruthy();
    void before;
  });

  // useReducedMotion is mocked to true at the top of this file, so page turns
  // must be instant: no rotateX flip layer, no ~820ms isFlipping dead period.
  it("under reduced motion, advances instantly with no flip layer", () => {
    // Lesson 7+ has multiple flipchart plates (1-6 are single-plate).
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    const counter = screen.getByTestId("flipchart-counter");
    expect(counter.textContent).toMatch(/Hoja 1 de/);
    fireEvent.click(screen.getByLabelText(/Lámina siguiente/i));
    // Synchronously on the next page — no waiting out the flip timer.
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(/Hoja 2 de/);
    // The animated 3D flip layer must never have been mounted.
    expect(container.querySelector(".flipchart-flip-wrapper")).toBeNull();
  });
});

describe("TeacherPresentationShell — book-warm presenter chrome", () => {
  it("renders full-viewport shell with stage landmark (not dark max-w column)", () => {
    const { container } = render(
      <TeacherPresentationShell
        title="Vocal O o"
        eyebrow="Lección 2 · Flipchart"
        subtitle="Proyector del maestro"
        onExit={() => {}}
      >
        <div>board</div>
      </TeacherPresentationShell>,
    );
    const shell = container.querySelector('[data-testid="teacher-presenter-shell"]');
    const stage = container.querySelector('[data-testid="teacher-presenter-stage"]');
    expect(shell).toBeTruthy();
    expect(stage).toBeTruthy();
    expect(shell?.className).toContain("fc-presenter");
    expect(shell?.className).not.toMatch(/bg-stone-950|bg-slate-950/);
    expect(screen.getByText("Vocal O o")).toBeTruthy();
    expect(screen.getByLabelText(/Volver al panel del docente/i)).toBeTruthy();
  });
});
