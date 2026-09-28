/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { FlipchartHdPanel } from "../FlipchartHdPanel";
import { TeacherPresentationShell } from "../TeacherPresentationShell";
import { FlipchartNativeBoard } from "../FlipchartNativeBoard";
import { FLIPCHART_PAGES } from "@/lib/flipchart-hd";
import { FLIPCHART_FLIP_MS } from "@/lib/living-motion";

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
  it("renders every lesson plate as a native HTML board with standalone artwork", () => {
    for (const page of FLIPCHART_PAGES.filter((page) => page.lesson > 0)) {
      const { container, unmount } = render(<FlipchartNativeBoard page={page} />);
      const board = container.querySelector('[data-native-flipchart="true"]');
      expect(board, `Native board missing on plate ${page.flipchartPage}`).toBeTruthy();
      expect(container.querySelector('[data-testid="flipchart-hero-asset"]')?.getAttribute("src")).toBe(
        `/cartilla/art/faithful/flipchart/flipchart-p${String(page.flipchartPage).padStart(3, "0")}-hero.webp`,
      );
      expect(container.querySelector("img")?.getAttribute("src") ?? "").not.toContain("/hd/flipchart/");
      expect(container.textContent?.trim().length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("rebuilds Flip Chart frontmatter without rendering source JPG pages", () => {
    for (const pageNumber of [1, 2] as const) {
      const page = FLIPCHART_PAGES.find((entry) => entry.flipchartPage === pageNumber)!;
      const { container, unmount } = render(<FlipchartNativeBoard page={page} />);
      expect(container.querySelector('[data-native-flipchart="true"]')).toBeTruthy();
      expect(container.querySelector("img")?.getAttribute("src") ?? "").not.toContain("hd/flipchart/page-00");
      unmount();
    }
  });

  it("renders a wide clean digital presenter without simulated binding hardware", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    const panel = container.querySelector('[data-testid="flipchart-hd-panel"]');
    const stage = container.querySelector('[data-testid="flipchart-stage"]');
    expect(panel).toBeTruthy();
    expect(stage).toBeTruthy();
    expect(panel?.getAttribute("data-hd-primary")).toBe("true");
    expect(panel?.getAttribute("data-presenter-mode")).toBe("native");
    expect(panel?.hasAttribute("data-physical-flipchart")).toBe(false);
    expect(panel?.getAttribute("data-page-turn-axis")).toBe("vertical");
    expect(panel?.getAttribute("data-page-turn-ms")).toBe(
      String(FLIPCHART_FLIP_MS),
    );
    expect(container.querySelector(".fc-board__binding")).toBeNull();
    expect(container.querySelectorAll(".fc-board__ring")).toHaveLength(0);
    // Legacy narrow constraints must not reappear on the board root.
    expect(panel?.className).not.toMatch(/max-w-5xl|max-w-4xl|max-w-3xl/);
    expect(stage?.className).not.toMatch(/max-w-5xl|max-w-4xl/);
  });

  it("keeps HD canonical provenance while the visible surface is native", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    const face = container.querySelector('[data-native-surface="true"]');
    if (face) {
      expect(face.getAttribute("data-canonical-src")).toMatch(/\/cartilla\/art\/hd\/flipchart\//);
      expect(face.getAttribute("data-hd")).toBe("true");
      expect(face.querySelector('[data-native-flipchart="true"]')).toBeTruthy();
      expect(face.querySelector("img")?.getAttribute("src") ?? "").not.toContain("/hd/flipchart/");
    } else {
      expect(screen.getByTestId("flipchart-empty")).toBeTruthy();
    }
  });

  it("shows Spanish hoja counter and large nav when plates exist", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={2} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(
      /Hoja/i,
    );
    expect(screen.getByLabelText(/Lámina anterior/i)).toBeTruthy();
    expect(screen.getByLabelText(/Lámina siguiente/i)).toBeTruthy();
  });

  it("supports vertical arrow keys as the primary presenter navigation", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    const counter = screen.getByTestId("flipchart-counter");
    expect(counter.textContent).toMatch(/Hoja 1 de/);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(
      /Hoja 2 de/,
    );
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(
      /Hoja 1 de/,
    );
  });

  // useReducedMotion is mocked to true at the top of this file, so page turns
  // must be instant: no rotateX flip layer and no disabled-motion dead period.
  it("under reduced motion, advances instantly with no flip layer", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    if (container.querySelector('[data-testid="flipchart-empty"]')) return;
    const counter = screen.getByTestId("flipchart-counter");
    expect(counter.textContent).toMatch(/Hoja 1 de/);
    fireEvent.click(screen.getByLabelText(/Lámina siguiente/i));
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(
      /Hoja 2 de/,
    );
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
    const shell = container.querySelector(
      '[data-testid="teacher-presenter-shell"]',
    );
    const stage = container.querySelector(
      '[data-testid="teacher-presenter-stage"]',
    );
    expect(shell).toBeTruthy();
    expect(stage).toBeTruthy();
    expect(shell?.className).toContain("fc-presenter");
    expect(shell?.className).not.toMatch(/bg-stone-950|bg-slate-950/);
    expect(screen.getByText("Vocal O o")).toBeTruthy();
    expect(screen.getByLabelText(/Volver al panel del docente/i)).toBeTruthy();
  });
});
