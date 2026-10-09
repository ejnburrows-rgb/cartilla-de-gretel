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
      const images = [...container.querySelectorAll("img")];
      expect(images.every((img) => !(img.getAttribute("src") ?? "").includes("/hd/flipchart/"))).toBe(true);
      expect(images.every((img) => !(img.getAttribute("src") ?? "").includes("/delivery/flipchart/"))).toBe(true);
      expect(container.textContent?.trim().length).toBeGreaterThan(0);
      if (page.flipchartPage > 2) {
        // Exact replica: pages render via layout-type-specific compositions (book §2).
        // Accept the art grid, legacy letter stage, or any layout-type marker.
        expect(
          container.querySelector('[data-testid="flipchart-art-grid"]') ||
          container.querySelector(".fc-native-board__letter-stage") ||
          container.querySelector("[data-layout-type]"),
        ).toBeTruthy();
      }
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
      const images = [...face.querySelectorAll("img")];
      expect(images.every((img) => !(img.getAttribute("src") ?? "").includes("/hd/flipchart/"))).toBe(true);
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
    expect(screen.getByRole("button", { name: "Lámina anterior" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lámina siguiente" })).toBeTruthy();
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
    fireEvent.click(screen.getByRole("button", { name: "Lámina siguiente" }));
    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(
      /Hoja 2 de/,
    );
    expect(container.querySelector(".flipchart-flip-wrapper")).toBeNull();
  });
});

describe("FlipchartHdPanel bare chrome mode", () => {
  it("keeps controls outside the book in bare mode without thumbnails", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} chrome="bare" />);
    const panel = container.querySelector('[data-testid="flipchart-hd-panel"]');
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute("data-chrome")).toBe("bare");
    // Board still renders
    expect(container.querySelector('[data-testid="flipchart-stage"]')).toBeTruthy();
    expect(container.querySelector('[data-native-flipchart="true"]')).toBeTruthy();
    expect(container.querySelector(".fc-board__controls")).toBeTruthy();
    expect(container.querySelector('[data-testid="flipchart-stage"] .fc-board__controls')).toBeNull();
    expect(container.querySelector(".fc-board__strip")).toBeNull();
    expect(screen.queryByTestId("flipchart-counter")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Lámina anterior" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Lámina siguiente" })).toBeTruthy();
  });

  it("keeps full chrome by default", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    expect(container.querySelector(".fc-board__controls")).toBeTruthy();
    expect(screen.getByTestId("flipchart-counter")).toBeTruthy();
  });

  it("renders one complete native caption for each label-free D-page image", () => {
    // Page 21 (Dd): dados/dedo/didi/dunia have the word baked into the image.
    const page = FLIPCHART_PAGES.find((entry) => entry.flipchartPage === 21)!;
    const { container } = render(<FlipchartNativeBoard page={page} />);
    const grid = container.querySelector('[data-testid="flipchart-art-grid"]');
    expect(grid).toBeTruthy();
    const captions = [...grid!.querySelectorAll(".fc-native-board__art-label")];
    const captionTexts = captions.map((c) => c.textContent?.trim().toLowerCase());
    // None of the baked-label words may have a duplicate figcaption.
    for (const word of ["dados", "dedo", "didi", "dunia"]) {
      expect(captionTexts.filter((text) => text === word), `one label for "${word}"`).toHaveLength(1);
    }
  });

  it("shell bare mode renders stage with no header", () => {
    const { container } = render(
      <TeacherPresentationShell bare onExit={() => {}}>
        <div>board</div>
      </TeacherPresentationShell>,
    );
    const shell = container.querySelector('[data-testid="teacher-presenter-shell"]');
    expect(shell).toBeTruthy();
    expect(shell?.getAttribute("data-bare")).toBe("true");
    expect(container.querySelector('[data-testid="teacher-presenter-stage"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="teacher-presenter-header"]')).toBeNull();
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

describe("FlipchartHdPanel — teacher hand mode and corner flip mechanics", () => {
  it("renders bottom-left and bottom-right corner hotspots in left-hand mode by default", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    const leftCorner = container.querySelector('[data-testid="flipchart-corner-left"]');
    const rightCorner = container.querySelector('[data-testid="flipchart-corner-right"]');

    expect(leftCorner).toBeTruthy();
    expect(rightCorner).toBeTruthy();
    expect(leftCorner?.getAttribute("aria-label")).toContain("Lámina siguiente");
    expect(rightCorner?.getAttribute("aria-label")).toContain("Lámina anterior");
  });

  it("toggles hand mode and flips corner mappings in right-hand mode", () => {
    const { container } = render(
      <TeacherPresentationShell title="Lección 7">
        <FlipchartHdPanel lessonNumber={7} />
      </TeacherPresentationShell>,
    );

    const leftCornerBefore = container.querySelector('[data-testid="flipchart-corner-left"]');
    const rightCornerBefore = container.querySelector('[data-testid="flipchart-corner-right"]');
    expect(leftCornerBefore?.getAttribute("aria-label")).toContain("Lámina siguiente");
    expect(rightCornerBefore?.getAttribute("aria-label")).toContain("Lámina anterior");

    // Toggle hand mode
    const toggleBtn = screen.getByTestId("hand-mode-toggle");
    fireEvent.click(toggleBtn);

    const leftCornerAfter = container.querySelector('[data-testid="flipchart-corner-left"]');
    const rightCornerAfter = container.querySelector('[data-testid="flipchart-corner-right"]');
    expect(leftCornerAfter?.getAttribute("aria-label")).toContain("Lámina anterior");
    expect(rightCornerAfter?.getAttribute("aria-label")).toContain("Lámina siguiente");
  });

  it("advances sheet when tapping bottom-left corner in default left-hand mode", () => {
    const { container } = render(<FlipchartHdPanel lessonNumber={7} />);
    const counter = screen.getByTestId("flipchart-counter");
    expect(counter.textContent).toMatch(/Hoja 1 de/);

    const leftCorner = container.querySelector('[data-testid="flipchart-corner-left"]')!;
    fireEvent.pointerDown(leftCorner, { clientX: 100, clientY: 800, pointerId: 1 });
    fireEvent.pointerUp(leftCorner, { clientX: 100, clientY: 800, pointerId: 1 });

    expect(screen.getByTestId("flipchart-counter").textContent).toMatch(/Hoja 2 de/);
  });
});
